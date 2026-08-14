import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { Settings, X, RefreshCw, Play, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import adService from '../../services/adService';
import { adFrequencyService } from '../../services/ads/adFrequencyService';
import { adMetricsService } from '../../services/ads/adMetricsService';
import { resetDailyRewardedAdsLimit, clearAdFreeStatus } from '../../store/slices/rewardsSlice';
import { useAppTheme } from '../../hooks/useAppTheme';

export const DevAdControlsModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useAppTheme();

  const [simEnabled, setSimEnabled] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  if (!visible || (typeof __DEV__ !== 'undefined' && __DEV__ === false)) return null;

  const handleToggleSimulation = (val) => {
    setSimEnabled(val);
    adService.setDevSimulationEnabled(val);
  };

  const handleResetLimit = () => {
    dispatch(resetDailyRewardedAdsLimit());
    Alert.alert('Dev Control', 'Daily rewarded ad count and milestone claim state reset.');
  };

  const handleResetFrequency = () => {
    adFrequencyService.resetSession();
    Alert.alert('Dev Control', 'Interstitial session count and cooldown reset.');
  };

  const handleResetAdFree = () => {
    dispatch(clearAdFreeStatus());
    Alert.alert('Dev Control', 'Active ad-free entitlement cleared.');
  };

  const logs = adMetricsService.getDecisionLogs();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppIcon icon={Settings} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="titleMedium" style={{ fontWeight: '800' }}>
                Dev Ad Controls & Debugger (__DEV__ Only)
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <View style={styles.settingRow}>
              <View style={styles.textGroup}>
                <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                  Simulated Ad Provider
                </AppText>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Enable or disable local development ad simulation
                </AppText>
              </View>
              <Switch
                value={simEnabled}
                onValueChange={handleToggleSimulation}
                trackColor={{ false: currentTheme.border, true: `${currentTheme.primary}80` }}
                thumbColor={simEnabled ? currentTheme.primary : currentTheme.surfaceVariant}
              />
            </View>

            <View style={[styles.statsCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
              <AppText variant="caption" style={{ fontWeight: '800', marginBottom: 6 }}>
                INTERSTITIAL FREQUENCY QA STATS
              </AppText>
              <View style={styles.statRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Cooldown Config:</AppText>
                <AppText variant="caption" style={{ fontWeight: '700' }}>3 min</AppText>
              </View>
              <View style={styles.statRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Session Limit:</AppText>
                <AppText variant="caption" style={{ fontWeight: '700' }}>3</AppText>
              </View>
              <View style={styles.statRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Shown This Session:</AppText>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  {adFrequencyService.getStatus().interstitialSessionCount} / 3
                </AppText>
              </View>
              <View style={styles.statRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Cooldown Remaining:</AppText>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  {adFrequencyService.getFormattedRemainingCooldown(3)}
                </AppText>
              </View>
              <View style={styles.statRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Current Decision:</AppText>
                <AppText
                  variant="caption"
                  color={logs[0]?.allowed !== false ? currentTheme.success : currentTheme.error}
                  style={{ fontWeight: '800' }}
                >
                  {logs[0] ? (logs[0].allowed ? 'ALLOWED' : `BLOCKED — ${logs[0].reason}`) : 'ALLOWED'}
                </AppText>
              </View>
            </View>

            <View style={styles.actionSection}>
              <SecondaryButton
                title="Reset Interstitial Frequency"
                icon={RefreshCw}
                onPress={handleResetFrequency}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title="Reset Ad-Free Entitlement"
                icon={XCircle}
                onPress={handleResetAdFree}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title="Reset Daily Limit & Milestone"
                icon={RefreshCw}
                onPress={handleResetLimit}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title="Simulate Interstitial Ad Modal"
                icon={Play}
                onPress={() => {
                  onClose();
                  setTimeout(async () => {
                    adFrequencyService.resetSession();
                    const res = await adService.showInterstitial('dev_test_interstitial', { screen: 'calculators' });
                    if (res?.reason && res.reason !== 'ONLINE') {
                      Alert.alert('Interstitial Debug', `Decision: ${res.reason}`);
                    }
                  }, 200);
                }}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title="Simulate Test Success (+10 pts)"
                icon={Play}
                onPress={async () => {
                  const res = await adService.showRewarded('dev_test', { forcedMode: null });
                  if (res?.status === 'COMPLETED') {
                    Alert.alert('Test Success', `Simulated ad completed! TxID: ${res.transactionId}`);
                  }
                }}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title="Simulate Test Failure"
                icon={AlertTriangle}
                onPress={async () => {
                  const res = await adService.showRewarded('dev_test', { forcedMode: 'fail' });
                  Alert.alert('Test Failure', `Status: ${res?.status}, Reason: ${res?.reason}`);
                }}
                style={styles.btnMargin}
              />

              <SecondaryButton
                title={showLogs ? 'Hide Ad Decision Logs' : 'View Ad Decision Logs'}
                icon={ShieldAlert}
                onPress={() => setShowLogs(!showLogs)}
                style={styles.btnMargin}
              />
            </View>

            {showLogs && (
              <View style={[styles.logsContainer, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
                <AppText variant="caption" style={{ fontWeight: '800', marginBottom: 8 }}>
                  RECENT AD DECISIONS ({logs.length})
                </AppText>
                {logs.length === 0 ? (
                  <AppText variant="caption" color={currentTheme.textMuted}>
                    No ad decision logs recorded yet.
                  </AppText>
                ) : (
                  logs.slice(0, 10).map((log, idx) => (
                    <View key={idx} style={styles.logRow}>
                      <AppText variant="caption" style={{ fontWeight: '700', fontSize: 10 }}>
                        {log.timestamp} • [{log.adType.toUpperCase()}] {log.placementId}
                      </AppText>
                      <AppText
                        variant="caption"
                        color={log.allowed ? currentTheme.success : currentTheme.error}
                        style={{ fontWeight: '800', fontSize: 10 }}
                      >
                        {log.allowed ? 'ALLOWED' : `BLOCKED: ${log.reason}`}
                      </AppText>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          <PrimaryButton title="Done" onPress={onClose} style={{ marginTop: 12 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 16,
  },
  statsCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  textGroup: {
    flex: 1,
    marginRight: 10,
  },
  actionSection: {
    marginBottom: 16,
  },
  btnMargin: {
    marginBottom: 8,
  },
  logsContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  logRow: {
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DevAdControlsModal;

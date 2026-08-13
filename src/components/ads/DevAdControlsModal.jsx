import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Switch, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { Settings, X, RefreshCw, Play, XCircle, AlertTriangle } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import adService from '../../services/adService';
import { resetDailyRewardedAdsLimit } from '../../store/slices/rewardsSlice';
import { useAppTheme } from '../../hooks/useAppTheme';

export const DevAdControlsModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useAppTheme();

  const [simEnabled, setSimEnabled] = useState(true);

  if (!__DEV__ || !visible) return null;

  const handleToggleSimulation = (val) => {
    setSimEnabled(val);
    adService.setDevSimulationEnabled(val);
  };

  const handleResetLimit = () => {
    dispatch(resetDailyRewardedAdsLimit());
    Alert.alert('Dev Control', 'Daily rewarded ad count and milestone claim state reset.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppIcon icon={Settings} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="titleMedium" style={{ fontWeight: '800' }}>
                Dev Ad Controls (__DEV__ Only)
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

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

          <View style={styles.actionSection}>
            <SecondaryButton
              title="Reset Daily Limit & Milestone"
              icon={RefreshCw}
              onPress={handleResetLimit}
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
              title="Simulate Test Cancel"
              icon={XCircle}
              onPress={async () => {
                const res = await adService.showRewarded('dev_test', { forcedMode: 'cancel' });
                Alert.alert('Test Cancel', `Status: ${res?.status}`);
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
          </View>

          <PrimaryButton title="Done" onPress={onClose} style={{ marginTop: 8 }} />
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
});

export default DevAdControlsModal;

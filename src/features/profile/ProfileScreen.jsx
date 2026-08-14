import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Alert, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Info,
  Share2,
  Code,
  ChevronRight,
  Star,
  Flame,
  WalletCards,
  Bell,
  ShieldAlert,
  FileText,
} from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import AppCard from '../../components/cards/AppCard';
import ProfileHeader from './components/ProfileHeader';
import ProfileSection from './components/ProfileSection';
import ProfileRow from './components/ProfileRow';
import PrivacyInfoModal from './components/PrivacyInfoModal';
import DevAdControlsModal from '../../components/ads/DevAdControlsModal';
import { RewardCard, rewardService } from '../rewards';
import ProfileAdMilestoneCard from '../rewards/components/ProfileAdMilestoneCard';
import {
  selectRewardPoints,
  selectCurrentStreak,
  selectHasCheckedInToday,
  selectAdFreeUntil,
  selectIsRewardedMilestoneClaimedToday,
} from '../../store/slices/rewardsSlice';
import {
  isAdFreeActive,
  formatAdFreeExpiry,
  formatAdFreeRemainingTime,
} from '../rewards/utils/rewardUtils';
import {
  selectActiveLoanCount,
  selectTotalOutstanding,
} from '../../store/slices/loanProfilesSlice';
import {
  selectLoanRemindersEnabled,
  setLoanRemindersEnabled,
} from '../../store/slices/settingsSlice';
import loanReminderService from '../loans/services/loanReminderService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import { selectRewardedAdsConfig } from '../../config/realtimeConfigSelectors';
import { formatCurrencyCompact } from '../../utils/financeFormatters';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';
import { navigateToMyLoans } from '../../navigation/navigationHelpers';
import AdPlacement from '../../components/ads/AdPlacement';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme, themeMode, setThemeMode, isDark } = useAppTheme();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [devAdModalVisible, setDevAdModalVisible] = useState(false);
  const [now, setNow] = useState(new Date());
  const [config, setConfig] = useState(realtimeConfigService.getConfig());

  // 1-minute live timer while screen is focused
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const timer = setInterval(() => {
        setNow(new Date());
      }, 60000);

      return () => clearInterval(timer);
    }, [])
  );

  // Subscribe to remote configuration
  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

  const points = useSelector(selectRewardPoints);
  const currentStreak = useSelector(selectCurrentStreak);
  const hasCheckedInToday = useSelector(selectHasCheckedInToday);
  const adFreeUntil = useSelector(selectAdFreeUntil);
  const isClaimedToday = useSelector(selectIsRewardedMilestoneClaimedToday);

  const activeLoanCount = useSelector(selectActiveLoanCount);
  const totalOutstanding = useSelector(selectTotalOutstanding);
  const globalRemindersEnabled = useSelector(selectLoanRemindersEnabled);

  const adFreeActive = isAdFreeActive(adFreeUntil, now);
  const remainingTimeStr = formatAdFreeRemainingTime(adFreeUntil, now);
  const expiryFormattedStr = formatAdFreeExpiry(adFreeUntil);

  const rewardedConfig = selectRewardedAdsConfig(config);
  const milestone = rewardedConfig?.milestone || { adFreeMinutes: 30 };
  const adFreeMinutes = Number(milestone?.adFreeMinutes) || 30;

  const themeOptions = [
    { label: 'System Default', value: 'system', icon: Monitor },
    { label: 'Light Mode', value: 'light', icon: Sun },
    { label: 'Dark Mode', value: 'dark', icon: Moon },
  ];

  const handleClaimDailyCheckIn = () => {
    rewardService.claimDailyCheckIn(dispatch, currentStreak);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          'Check out Finzo - an offline-first financial calculator and planning utility for EMI, SIP, FD, GST & real loan tracking!',
        title: 'Finzo Finance Calculator',
      });
    } catch (err) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const adFreeColor = isDark ? '#4ADE80' : currentTheme.success;
  const adFreeBg = isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)';

  const loanSummaryText = activeLoanCount > 0
    ? `${activeLoanCount} Active Loan${activeLoanCount > 1 ? 's' : ''} • ${formatCurrencyCompact(totalOutstanding)} Outstanding`
    : 'No active loans • Tap to track loans';

  return (
    <ScreenContainer
      scrollable
      header={<ProfileHeader />}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      contentContainerStyle={{ paddingBottom: 0 }}
      style={styles.container}
    >
      {/* HIGH PRIORITY: PROMINENT ACTIVE AD-FREE STATUS CARD */}
      {adFreeActive && (
        <View style={styles.topStatusContainer}>
          <AppCard
            style={[styles.activeAdFreeCard, { backgroundColor: adFreeBg, borderColor: adFreeColor }]}
            accessibilityRole="summary"
            accessibilityLabel={`Ad-Free Active. ${remainingTimeStr || 'Active'}. Ads are paused ${expiryFormattedStr ? expiryFormattedStr.toLowerCase() : ''}.`}
          >
            <View style={styles.activeHeaderRow}>
              <View style={styles.activeTitleGroup}>
                <AppIcon icon={ShieldCheck} size={22} color={adFreeColor} style={{ marginRight: 8 }} />
                <AppText variant="bodyLarge" style={{ fontWeight: '800', color: adFreeColor }}>
                  Ad-Free Active
                </AppText>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.REWARDS)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="View Rewards Store"
                style={styles.viewRewardsBtn}
              >
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
                  View Rewards
                </AppText>
                <AppIcon icon={ChevronRight} size={13} color={currentTheme.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.activeTimeBody}>
              {remainingTimeStr && (
                <AppText variant="titleLarge" color={currentTheme.textPrimary} style={styles.remainingTimeText}>
                  {remainingTimeStr}
                </AppText>
              )}
              {expiryFormattedStr && (
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Ads are paused {expiryFormattedStr.toLowerCase()}
                </AppText>
              )}

              {isClaimedToday && (
                <View style={styles.unlockedSubRow}>
                  <AppText variant="caption" color={adFreeColor} style={{ fontWeight: '700' }}>
                    ✓ Today's {adFreeMinutes} min reward unlocked
                  </AppText>
                </View>
              )}
            </View>
          </AppCard>
        </View>
      )}

      {/* 1. My Accounts Section */}
      <ProfileSection title="My Accounts">
        <ProfileRow
          icon={WalletCards}
          title="My Loans & Liabilities"
          subtitle={loanSummaryText}
          onPress={() => navigateToMyLoans(navigation, { initialSegment: 'loans' })}
          accessibilityLabel="Manage your real-world loans and EMIs"
        />
      </ProfileSection>

      {/* 2. Rewards Section */}
      <ProfileSection title="Rewards">
        <RewardCard
          hasCheckedInToday={hasCheckedInToday}
          currentStreak={currentStreak}
          onClaim={handleClaimDailyCheckIn}
          style={styles.rewardCardMargin}
        />

        <ProfileAdMilestoneCard />

        {/* Compact Points / Streak / Store Summary Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.REWARDS)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View rewards history, points store and ad-free entitlements"
        >
          <AppCard style={styles.compactStatsCard}>
            <View style={styles.compactSummaryRow}>
              <View style={styles.statPill}>
                <AppIcon icon={Star} size={16} color={currentTheme.primary} style={{ marginRight: 6 }} />
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  {points.toLocaleString('en-IN')} points
                </AppText>
              </View>

              <View style={styles.statPill}>
                <AppIcon icon={Flame} size={16} color="#F97316" style={{ marginRight: 6 }} />
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'} streak
                </AppText>
              </View>

              <View style={styles.storeLinkRow}>
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
                  Store & Details
                </AppText>
                <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
              </View>
            </View>
          </AppCard>
        </TouchableOpacity>

        <AdPlacement
          screen="profile"
          placementId={AD_PLACEMENTS.PROFILE_BANNER}
          adType="banner"
          style={{ marginTop: 18, marginBottom: 12 }}
        />
      </ProfileSection>

      {/* 3. Preferences Section */}
      <ProfileSection title="Preferences">
        <ProfileRow
          icon={Bell}
          title="Loan Payment Reminders"
          subtitle="Master toggle for all local EMI alerts"
          rightElement={
            <Switch
              value={globalRemindersEnabled}
              onValueChange={async (val) => {
                if (val) {
                  const perm = await loanReminderService.requestPermissions();
                  if (!perm.authorized) {
                    dispatch(setLoanRemindersEnabled(false));
                    return;
                  }
                }
                dispatch(setLoanRemindersEnabled(val));
              }}
              trackColor={{ false: currentTheme.border, true: `${currentTheme.primary}80` }}
              thumbColor={globalRemindersEnabled ? currentTheme.primary : currentTheme.surfaceVariant}
            />
          }
          style={{ marginBottom: 12 }}
        />

        <AppCard style={styles.cardPadding}>
          <AppText variant="bodyMedium" style={styles.labelMargin}>
            Theme Preference
          </AppText>
          <View style={styles.themeOptionsRow}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setThemeMode(opt.value)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Set theme to ${opt.label}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.themeOptionButton,
                    {
                      backgroundColor: isSelected ? `${currentTheme.primary}1A` : currentTheme.surface,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                    },
                  ]}
                >
                  <AppIcon
                    icon={opt.icon}
                    size={20}
                    color={isSelected ? currentTheme.primary : currentTheme.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    color={isSelected ? currentTheme.primary : currentTheme.textSecondary}
                    style={styles.optionText}
                  >
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>
      </ProfileSection>

      {/* 4. Data & Privacy Section */}
      <ProfileSection title="Data & Privacy">
        <ProfileRow
          icon={ShieldCheck}
          title="Privacy & Local Data"
          subtitle="Finzo is designed to keep your financial data on your device"
          onPress={() => navigation.navigate(ROUTES.LOCAL_DATA_PRIVACY)}
          accessibilityLabel="View privacy and local data information"
          style={styles.rowMargin}
        />
        <ProfileRow
          icon={FileText}
          title="Privacy Policy"
          subtitle="Comprehensive disclosures on data, advertising & services"
          onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)}
          accessibilityLabel="Read full Privacy Policy"
        />
      </ProfileSection>

      {/* 5. About Finzo Section */}
      <ProfileSection title="About Finzo" isLast={!__DEV__}>
        <ProfileRow
          icon={Info}
          title="App Version"
          value="v1.0.0 (Offline MVP)"
          style={styles.rowMargin}
        />
        <ProfileRow
          icon={Share2}
          title="Share Finzo"
          subtitle="Tell friends about Finzo offline calculator"
          onPress={handleShareApp}
          accessibilityLabel="Share Finzo app"
        />
      </ProfileSection>

      {/* 6. Developer Tools Section (Debug only) */}
      {Boolean(__DEV__) && (
        <ProfileSection title="Developer Tools" isLast>
          <ProfileRow
            icon={Bell}
            title="Test Local Notification"
            subtitle="Fire a test notification in 5 seconds"
            onPress={async () => {
              const res = await loanReminderService.sendTestNotification(5);
              if (res.success) {
                Alert.alert(
                  'Test Notification Scheduled! 🔔',
                  'A local notification will fire in 5 seconds.\n\nLock your phone or exit the app now to see it in your notification tray!'
                );
              } else {
                Alert.alert('Test Notification Failed', res.error || 'Could not schedule local notification.');
              }
            }}
            accessibilityLabel="Test local notification delivery"
            style={{ marginBottom: 10 }}
          />

          <ProfileRow
            icon={ShieldAlert}
            title="Ad Controls & Debugger"
            subtitle="Test banner, native, interstitial & rewarded ads QA controls"
            onPress={() => setDevAdModalVisible(true)}
            accessibilityLabel="Open developer ad controls modal"
            style={{ marginBottom: 10 }}
          />

          <ProfileRow
            icon={Code}
            title="Component Showcase"
            subtitle="Preview core UI tokens, buttons, inputs, and cards"
            onPress={() => navigation.navigate(ROUTES.SHOWCASE)}
            accessibilityLabel="Launch component showcase"
          />
        </ProfileSection>
      )}

      <PrivacyInfoModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      {Boolean(__DEV__) && (
        <DevAdControlsModal
          visible={devAdModalVisible}
          onClose={() => setDevAdModalVisible(false)}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topStatusContainer: {
    marginBottom: 12,
    marginTop: 4,
  },
  activeAdFreeCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewRewardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTimeBody: {
    marginTop: 2,
  },
  remainingTimeText: {
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 2,
  },
  unlockedSubRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  rewardCardMargin: {
    marginBottom: 10,
  },
  compactStatsCard: {
    padding: 14,
  },
  compactSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPadding: {
    padding: 16,
  },
  labelMargin: {
    marginBottom: 12,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOptionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  rowMargin: {
    marginBottom: 10,
  },
});

export default ProfileScreen;

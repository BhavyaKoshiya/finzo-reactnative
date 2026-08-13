import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Gift, Ban, CheckCircle2, AlertCircle } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppHeader from '../../components/navigation/AppHeader';
import AppText from '../../components/common/AppText';
import AppCard from '../../components/cards/AppCard';
import AppIcon from '../../components/common/AppIcon';
import EmptyState from '../../components/feedback/EmptyState';
import RewardCard from './components/RewardCard';
import RewardStatsCard from './components/RewardStatsCard';
import RewardHistoryItem from './components/RewardHistoryItem';
import RedeemRewardCard from './components/RedeemRewardCard';
import RedeemRewardModal from './components/RedeemRewardModal';
import {
  selectRewardPoints,
  selectCurrentStreak,
  selectLongestStreak,
  selectTotalCheckIns,
  selectHasCheckedInToday,
  selectRewardHistory,
  selectIsAdFree,
  selectAdFreeExpiryFormatted,
} from '../../store/slices/rewardsSlice';
import rewardService from './services/rewardService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import { selectEnabledRewards, selectFeatureFlags } from '../../config/realtimeConfigSelectors';
import { useAppTheme } from '../../hooks/useAppTheme';
import AdPlacement from '../../components/ads/AdPlacement';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';

export const RewardsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useAppTheme();

  const points = useSelector(selectRewardPoints);
  const currentStreak = useSelector(selectCurrentStreak);
  const longestStreak = useSelector(selectLongestStreak);
  const totalCheckIns = useSelector(selectTotalCheckIns);
  const hasCheckedInToday = useSelector(selectHasCheckedInToday);
  const rewardHistory = useSelector(selectRewardHistory);
  const isAdFree = useSelector(selectIsAdFree);
  const adFreeExpiryFormatted = useSelector(selectAdFreeExpiryFormatted);

  const [activeConfig, setActiveConfig] = useState(realtimeConfigService.getConfig());
  const [selectedRewardForRedeem, setSelectedRewardForRedeem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    realtimeConfigService.initialize();
    const unsubscribe = realtimeConfigService.subscribe((cfg) => {
      setActiveConfig(cfg);
    });
    return () => unsubscribe();
  }, []);

  const featureFlags = selectFeatureFlags(activeConfig);
  const rewardsEnabled = featureFlags.rewardsEnabled !== false;
  const redeemablePackages = selectEnabledRewards(activeConfig);

  const handleClaimDailyCheckIn = () => {
    rewardService.claimDailyCheckIn(dispatch, currentStreak);
  };

  const handleOpenRedeemModal = (reward) => {
    setSelectedRewardForRedeem(reward);
    setModalVisible(true);
  };

  const handleConfirmRedemption = async (rewardId) => {
    rewardService.redeemReward(dispatch, rewardId);
    setModalVisible(false);
    setSelectedRewardForRedeem(null);

    const targetReward = redeemablePackages.find((r) => r.id === rewardId);
    const msg = `✓ ${targetReward?.title || 'Reward'} redeemed! Ad-free access is now active.`;
    setSuccessMessage(msg);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const renderHeader = () => (
    <AppHeader
      title="Rewards & Points"
      subtitle="Daily check-in, store & history"
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
    />
  );

  const adFreeBg = isDark ? 'rgba(34, 197, 94, 0.16)' : `${currentTheme.success}14`;
  const adFreeColor = isDark ? '#4ADE80' : currentTheme.success;

  return (
    <ScreenContainer
      header={renderHeader()}
      paddingHorizontal={0}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      <FlatList
        data={rewardHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.topSection}>
            {/* Feature Flag Disabled Banner */}
            {!rewardsEnabled && (
              <AppCard style={[styles.disabledBanner, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <View style={styles.disabledRow}>
                  <AppIcon icon={AlertCircle} size={20} color={currentTheme.error} style={{ marginRight: 10 }} />
                  <AppText variant="bodySmall" color={currentTheme.error} style={{ fontWeight: '600', flex: 1 }}>
                    Rewards are temporarily undergoing maintenance. Check back soon!
                  </AppText>
                </View>
              </AppCard>
            )}

            {/* Active Ad-Free Status Banner */}
            {isAdFree && (
              <AppCard style={[styles.adFreeBanner, { backgroundColor: adFreeBg }]}>
                <View style={styles.adFreeRow}>
                  <View style={styles.adFreeIconBox}>
                    <AppIcon icon={Ban} size={20} color={adFreeColor} />
                  </View>
                  <View style={styles.adFreeTextGroup}>
                    <AppText variant="bodyMedium" color={adFreeColor} style={styles.adFreeTitle}>
                      Ad-Free Active
                    </AppText>
                    <AppText variant="caption" color={currentTheme.textSecondary}>
                      {adFreeExpiryFormatted || 'Active'}
                    </AppText>
                  </View>
                </View>
              </AppCard>
            )}

            {/* Success Toast Banner */}
            {successMessage && (
              <AppCard style={[styles.successBanner, { backgroundColor: adFreeBg }]}>
                <View style={styles.adFreeRow}>
                  <AppIcon icon={CheckCircle2} size={20} color={adFreeColor} style={{ marginRight: 10 }} />
                  <AppText variant="bodySmall" color={adFreeColor} style={{ fontWeight: '600', flex: 1 }}>
                    {successMessage}
                  </AppText>
                </View>
              </AppCard>
            )}

            {/* Stats Summary Card */}
            <RewardStatsCard
              points={points}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalCheckIns={totalCheckIns}
              style={styles.cardMargin}
            />

            {/* Today's Habit Reward Card */}
            {rewardsEnabled && (
              <>
                <AppText variant="sectionTitle" style={styles.sectionTitle}>
                  Daily Check-In
                </AppText>
                <RewardCard
                  hasCheckedInToday={hasCheckedInToday}
                  currentStreak={currentStreak}
                  onClaim={handleClaimDailyCheckIn}
                  style={styles.cardMargin}
                />
              </>
            )}

            {/* Redeem Rewards Store Section */}
            {rewardsEnabled && (
              <>
                <AppText variant="sectionTitle" style={styles.sectionTitle}>
                  Redeem Rewards
                </AppText>
                <View style={styles.storeList}>
                  {redeemablePackages.map((reward) => (
                    <RedeemRewardCard
                      key={reward.id}
                      reward={reward}
                      userPoints={points}
                      onRedeemPress={handleOpenRedeemModal}
                    />
                  ))}
                </View>
                <AdPlacement
                  screen="rewards"
                  placementId={AD_PLACEMENTS.REWARDS_NATIVE}
                  adType="native"
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            {/* History Section Header */}
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Reward History
            </AppText>
          </View>
        }
        renderItem={({ item }) => <RewardHistoryItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <EmptyState
              title="No reward transactions yet"
              description="Claim your daily check-in reward above or redeem packages to build your history."
              icon={Gift}
            />
          </View>
        }
      />

      <RedeemRewardModal
        visible={modalVisible}
        reward={selectedRewardForRedeem}
        currentPoints={points}
        onConfirm={handleConfirmRedemption}
        onClose={() => {
          setModalVisible(false);
          setSelectedRewardForRedeem(null);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topSection: {
    marginBottom: 8,
  },
  disabledBanner: {
    padding: 12,
    marginBottom: 16,
  },
  disabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adFreeBanner: {
    padding: 14,
    marginBottom: 16,
  },
  successBanner: {
    padding: 12,
    marginBottom: 16,
  },
  adFreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adFreeIconBox: {
    marginRight: 10,
  },
  adFreeTextGroup: {
    flex: 1,
  },
  adFreeTitle: {
    fontWeight: '700',
  },
  cardMargin: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  storeList: {
    marginBottom: 10,
  },
  emptyWrapper: {
    paddingVertical: 20,
  },
});

export default RewardsScreen;

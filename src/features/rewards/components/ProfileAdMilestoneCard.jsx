import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Gift, CheckCircle2, Lock } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import RewardedAdButton from '../../../components/ads/RewardedAdButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { realtimeConfigService } from '../../../config/realtimeConfigService';
import { selectRewardedAdsConfig } from '../../../config/realtimeConfigSelectors';
import {
  selectRewardedAdsWatchedToday,
  selectIsRewardedMilestoneClaimedToday,
} from '../../../store/slices/rewardsSlice';
import { AD_PLACEMENTS } from '../../../services/ads/adPlacementConstants';

export const ProfileAdMilestoneCard = ({ style }) => {
  const { currentTheme, isDark } = useAppTheme();
  const [config, setConfig] = useState(realtimeConfigService.getConfig());
  const watchedToday = useSelector(selectRewardedAdsWatchedToday);
  const isClaimedToday = useSelector(selectIsRewardedMilestoneClaimedToday);

  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

  const rewardedConfig = selectRewardedAdsConfig(config);
  const milestone = rewardedConfig?.milestone || { enabled: false, requiredAds: 5, adFreeMinutes: 30 };

  const isEnabled = Boolean(rewardedConfig.enabled && milestone.enabled);
  const requiredAds = Number(milestone.requiredAds) || 5;
  const adFreeMinutes = Number(milestone.adFreeMinutes) || 30;

  const currentCount = Math.min(watchedToday, requiredAds);
  const remainingCount = Math.max(0, requiredAds - currentCount);
  const isCompleted = isClaimedToday || currentCount >= requiredAds;

  if (!isEnabled) {
    return (
      <AppCard style={[styles.card, style]}>
        <View style={styles.disabledRow}>
          <AppIcon icon={Lock} size={16} color={currentTheme.textMuted} style={{ marginRight: 8 }} />
          <AppText variant="caption" color={currentTheme.textMuted}>
            Rewarded ads are currently unavailable.
          </AppText>
        </View>
      </AppCard>
    );
  }

  const isAdFreeActiveColor = isDark ? '#4ADE80' : currentTheme.success;

  return (
    <AppCard
      style={[styles.card, style]}
      accessibilityRole="summary"
      accessibilityLabel={`Earn Ad-Free Time. Rewarded ads: ${currentCount} of ${requiredAds} completed. ${
        isCompleted
          ? `${adFreeMinutes} minutes ad-free unlocked!`
          : `Watch ${remainingCount} more ad${remainingCount === 1 ? '' : 's'} to unlock ${adFreeMinutes} minutes ad-free.`
      }`}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <AppIcon icon={Gift} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
            Earn Ad-Free Time
          </AppText>
        </View>
        <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
          +{adFreeMinutes} min Reward
        </AppText>
      </View>

      <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginBottom: 10 }}>
        Watch {requiredAds} rewarded ads today to unlock {adFreeMinutes} minutes ad-free.
      </AppText>

      {/* Milestone Progress Dots */}
      <View style={styles.progressDotsRow}>
        {Array.from({ length: requiredAds }).map((_, idx) => {
          const isFilled = idx < currentCount;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: isFilled
                    ? currentTheme.primary
                    : isDark
                    ? '#334155'
                    : '#E2E8F0',
                  borderColor: isFilled ? currentTheme.primary : currentTheme.border,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Progress Subtitle */}
      <View style={styles.statusRow}>
        <AppText variant="caption" style={{ fontWeight: '700' }}>
          {currentCount} of {requiredAds} completed
        </AppText>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <AppIcon icon={CheckCircle2} size={12} color={isAdFreeActiveColor} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={isAdFreeActiveColor} style={{ fontWeight: '700' }}>
              ✓ {adFreeMinutes} min Ad-Free Unlocked
            </AppText>
          </View>
        ) : (
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {remainingCount} more to unlock
          </AppText>
        )}
      </View>

      {/* Rewarded Ad Action Button */}
      <View style={{ marginTop: 10 }}>
        <RewardedAdButton placementId={AD_PLACEMENTS.PROFILE_REWARDED} />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
  },
  disabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileAdMilestoneCard;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gift, Award, PlayCircle, ShieldCheck } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatRewardDate } from '../utils/dateUtils';
import { REWARD_TITLES, REWARD_TYPES } from '../config/rewardConfig';

export const RewardHistoryItem = ({ item, style }) => {
  const { currentTheme, isDark } = useAppTheme();

  const title = REWARD_TITLES[item.type] || 'Reward Claimed';
  const formattedDate = formatRewardDate(item.createdAt);

  const iconBg = isDark ? 'rgba(59, 130, 246, 0.18)' : `${currentTheme.primary}12`;
  const iconColor = isDark ? '#60A5FA' : currentTheme.primary;
  const pointsColor = isDark ? '#4ADE80' : currentTheme.success;

  let icon = Award;
  let pointsDisplay = `+${item.points} Points`;

  if (item.type === REWARD_TYPES.DAILY_CHECKIN) {
    icon = Gift;
  } else if (item.type === REWARD_TYPES.REWARDED_AD) {
    icon = PlayCircle;
    pointsDisplay = `+${item.points} Points`;
  } else if (item.type === REWARD_TYPES.REWARDED_AD_MILESTONE) {
    icon = ShieldCheck;
    const minutes = item.metadata?.adFreeMinutes || 30;
    pointsDisplay = `+${minutes} min Ad-Free`;
  } else if (item.type === REWARD_TYPES.REDEMPTION) {
    pointsDisplay = `${item.points} Points`;
  }

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <AppIcon icon={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.textGroup}>
          <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.title}>
            {title}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {formattedDate} {item.metadata?.streakDay ? `• Day ${item.metadata.streakDay} streak` : ''}
          </AppText>
        </View>
        <AppText variant="bodyMedium" color={item.points < 0 ? currentTheme.textSecondary : pointsColor} style={styles.pointsText}>
          {pointsDisplay}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 1,
  },
  pointsText: {
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default RewardHistoryItem;

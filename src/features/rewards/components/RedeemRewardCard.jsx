import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ban, Clock, Tag } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { calculateRewardPrice } from '../utils/discountUtils';
import { canRedeemReward } from '../utils/rewardUtils';

export const RedeemRewardCard = ({
  reward,
  userPoints = 0,
  onRedeemPress,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();

  if (!reward) return null;

  const priceInfo = calculateRewardPrice(reward);
  const isAffordable = canRedeemReward(userPoints, reward);

  const iconBg = isDark ? 'rgba(59, 130, 246, 0.18)' : `${currentTheme.primary}14`;
  const iconColor = isDark ? '#60A5FA' : currentTheme.primary;

  const discountTagBg = isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.12)';
  const discountTagColor = isDark ? '#4ADE80' : currentTheme.success;

  const buttonTitle = isAffordable
    ? `Redeem ${priceInfo.finalPointsCost} Pts`
    : `Need ${priceInfo.finalPointsCost} Pts`;

  const accessibilityLabelText = isAffordable
    ? `Redeem ${reward.title} for ${priceInfo.finalPointsCost} Finzo points.`
    : `${reward.title}. Requires ${priceInfo.finalPointsCost} Finzo points. You currently have ${userPoints}.`;

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <AppIcon icon={Ban} size={22} color={iconColor} />
        </View>
        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <AppText variant="bodyMedium" style={styles.title}>
              {reward.title}
            </AppText>
            <View style={styles.badgeChip}>
              <AppIcon icon={Clock} size={12} color={currentTheme.textSecondary} style={{ marginRight: 3 }} />
              <AppText variant="caption" color={currentTheme.textSecondary} style={styles.badgeText}>
                {reward.durationMinutes >= 60
                  ? `${reward.durationMinutes / 60}h`
                  : `${reward.durationMinutes}m`}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.desc}>
            {reward.description}
          </AppText>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.costGroup}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.costLabel}>
            COST
          </AppText>
          <View style={styles.priceRow}>
            {priceInfo.discountActive && (
              <AppText variant="caption" color={currentTheme.textMuted} style={styles.strikethroughPrice}>
                {priceInfo.basePointsCost}
              </AppText>
            )}
            <AppText variant="cardTitle" color={isAffordable ? currentTheme.primary : currentTheme.textSecondary} style={styles.costValue}>
              {priceInfo.finalPointsCost} <AppText variant="caption" color={currentTheme.textSecondary}>pts</AppText>
            </AppText>
          </View>

          {priceInfo.discountActive && (
            <View style={[styles.discountTag, { backgroundColor: discountTagBg }]}>
              <AppIcon icon={Tag} size={10} color={discountTagColor} style={{ marginRight: 3 }} />
              <AppText variant="caption" color={discountTagColor} style={styles.discountTagText}>
                {priceInfo.discountLabel}
              </AppText>
            </View>
          )}
        </View>

        <PrimaryButton
          title={buttonTitle}
          onPress={() => onRedeemPress(reward)}
          disabled={!isAffordable}
          accessibilityLabel={accessibilityLabelText}
          style={styles.redeemButton}
        />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontWeight: '700',
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
  desc: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costGroup: {
    justifyContent: 'center',
  },
  costLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    marginRight: 6,
    fontSize: 13,
  },
  costValue: {
    fontWeight: '800',
    fontSize: 16,
  },
  discountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  discountTagText: {
    fontWeight: '800',
    fontSize: 10,
  },
  redeemButton: {
    minWidth: 140,
  },
});

export default RedeemRewardCard;

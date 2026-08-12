import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Flame, CheckCircle2, Check, Star, Sparkles } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { realtimeConfigService } from '../../../config/realtimeConfigService';
import { getDailyCheckInCopy, getWeeklyRewardProgress } from '../utils/dailyCheckInUtils';

export const RewardCard = ({
  hasCheckedInToday,
  currentStreak = 0,
  onClaim,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();
  const config = realtimeConfigService.getConfig();

  const copy = getDailyCheckInCopy(currentStreak, hasCheckedInToday, config);
  const progressNodes = getWeeklyRewardProgress(currentStreak, hasCheckedInToday, config);

  const flameBg = isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.12)';
  const flameColor = '#F97316';

  const claimedBg = isDark ? 'rgba(34, 197, 94, 0.16)' : `${currentTheme.success}14`;
  const claimedColor = isDark ? '#4ADE80' : currentTheme.success;

  return (
    <AppCard style={[styles.card, style]}>
      {/* 1. Header Section: Streak / Title */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: hasCheckedInToday ? claimedBg : flameBg }]}>
          <AppIcon
            icon={hasCheckedInToday ? CheckCircle2 : Flame}
            size={22}
            color={hasCheckedInToday ? claimedColor : flameColor}
          />
        </View>
        <View style={styles.titleGroup}>
          {copy.showStreak && (
            <AppText variant="caption" color={flameColor} style={styles.streakBadge}>
              {copy.streakBadge}
            </AppText>
          )}
          <AppText variant="bodyMedium" style={styles.title}>
            {copy.title}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.subtitle}>
            {hasCheckedInToday ? copy.successMessage : copy.subtitle}
          </AppText>
        </View>
      </View>

      {/* 2. Today's Highlight Badge */}
      {!hasCheckedInToday && (
        <View
          style={[
            styles.todayHighlightBox,
            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : currentTheme.primaryLight },
          ]}
        >
          <View style={styles.todayTextGroup}>
            <AppText variant="caption" color={currentTheme.primary} style={styles.todayLabel}>
              {copy.todayRewardLabel.toUpperCase()}
            </AppText>
            <AppText variant="cardTitle" color={currentTheme.textPrimary} style={styles.todayPointsText}>
              +{copy.todayPoints} <AppText variant="caption" color={currentTheme.textSecondary}>Finzo Points</AppText>
            </AppText>
          </View>
          <AppIcon icon={Sparkles} size={20} color={currentTheme.primary} />
        </View>
      )}

      {/* 3. 7-Day Progression Timeline */}
      {copy.showProgress && (
        <View style={styles.progressSection}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.progressSectionTitle}>
            {copy.progressTitle.toUpperCase()}
          </AppText>
          <View style={styles.timelineRow}>
            {progressNodes.map((node) => {
              let nodeBg = 'rgba(148, 163, 184, 0.15)';
              let nodeBorder = 'transparent';
              let nodeTextColor = currentTheme.textMuted;

              if (node.isCompleted) {
                nodeBg = claimedBg;
                nodeTextColor = claimedColor;
              } else if (node.isCurrent) {
                nodeBg = isDark ? 'rgba(59, 130, 246, 0.25)' : currentTheme.primaryLight;
                nodeBorder = currentTheme.primary;
                nodeTextColor = currentTheme.primary;
              }

              return (
                <View key={node.day} style={styles.timelineNodeContainer}>
                  <View
                    style={[
                      styles.nodeCircle,
                      { backgroundColor: nodeBg, borderColor: nodeBorder },
                    ]}
                  >
                    {node.isCompleted ? (
                      <AppIcon icon={Check} size={12} color={claimedColor} />
                    ) : node.isCurrent ? (
                      <AppIcon icon={Star} size={12} color={currentTheme.primary} />
                    ) : (
                      <AppText variant="caption" color={currentTheme.textMuted} style={styles.nodeText}>
                        {node.day}
                      </AppText>
                    )}
                  </View>
                  <AppText
                    variant="caption"
                    color={nodeTextColor}
                    style={[styles.nodePoints, node.isCurrent && styles.nodePointsCurrent]}
                  >
                    +{node.points}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 4. Next Reward Preview */}
      {!hasCheckedInToday && copy.showNextReward && (
        <View style={styles.nextRewardRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {copy.nextRewardLabel}: <AppText variant="caption" color={currentTheme.textPrimary} style={{ fontWeight: '700' }}>+{copy.nextPoints} Points</AppText>
          </AppText>
        </View>
      )}

      {/* 5. Claim Action Button */}
      {!hasCheckedInToday && (
        <PrimaryButton
          title={copy.claimButtonText}
          onPress={onClaim}
          accessibilityLabel={`Claim daily check-in reward. Earn ${copy.todayPoints} Finzo points`}
          style={styles.claimButton}
        />
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleGroup: {
    flex: 1,
  },
  streakBadge: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  todayHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  todayTextGroup: {
    flex: 1,
  },
  todayLabel: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  todayPointsText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressSectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineNodeContainer: {
    alignItems: 'center',
    flex: 1,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  nodeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nodePoints: {
    fontSize: 9,
    fontWeight: '600',
  },
  nodePointsCurrent: {
    fontWeight: '800',
  },
  nextRewardRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  claimButton: {
    marginTop: 2,
  },
});

export default RewardCard;

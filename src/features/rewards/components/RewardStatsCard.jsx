import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star, Flame, Trophy, CalendarCheck } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const RewardStatsCard = ({
  points = 0,
  currentStreak = 0,
  longestStreak = 0,
  totalCheckIns = 0,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();

  const heroBg = isDark ? 'rgba(59, 130, 246, 0.2)' : currentTheme.primaryLight;
  const heroBorder = isDark ? 'rgba(59, 130, 246, 0.3)' : `${currentTheme.primary}25`;
  const starColor = isDark ? '#60A5FA' : currentTheme.primary;

  const flameBg = isDark ? 'rgba(249, 115, 22, 0.18)' : 'rgba(249, 115, 22, 0.12)';
  const trophyBg = isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.12)';
  const checkBg = isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.12)';

  return (
    <AppCard style={[styles.card, style]}>
      {/* 1. Hero Points Banner */}
      <View
        style={[
          styles.heroBanner,
          { backgroundColor: heroBg, borderColor: heroBorder },
        ]}
      >
        <View style={[styles.starIconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#FFFFFF' }]}>
          <AppIcon icon={Star} size={24} color={starColor} />
        </View>
        <View style={styles.heroTextGroup}>
          <AppText variant="caption" color={currentTheme.primary} style={styles.heroBadgeTitle}>
            FINZO POINTS ACCUMULATED
          </AppText>
          <AppText variant="screenTitle" color={currentTheme.textPrimary} style={styles.pointsValue}>
            {points.toLocaleString('en-IN')}{' '}
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.pointsLabel}>
              pts
            </AppText>
          </AppText>
        </View>
      </View>

      {/* 2. Sub-Metrics Row */}
      <View style={styles.subMetricsRow}>
        <View style={styles.metricColumn}>
          <View style={[styles.miniIconBox, { backgroundColor: flameBg }]}>
            <AppIcon icon={Flame} size={16} color="#F97316" />
          </View>
          <AppText variant="cardTitle" color={currentTheme.textPrimary} style={styles.metricValue}>
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.metricLabel}>
            Current Streak
          </AppText>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: currentTheme.border }]} />

        <View style={styles.metricColumn}>
          <View style={[styles.miniIconBox, { backgroundColor: trophyBg }]}>
            <AppIcon icon={Trophy} size={16} color="#EAB308" />
          </View>
          <AppText variant="cardTitle" color={currentTheme.textPrimary} style={styles.metricValue}>
            {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.metricLabel}>
            Longest Streak
          </AppText>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: currentTheme.border }]} />

        <View style={styles.metricColumn}>
          <View style={[styles.miniIconBox, { backgroundColor: checkBg }]}>
            <AppIcon icon={CalendarCheck} size={16} color={isDark ? '#4ADE80' : currentTheme.success} />
          </View>
          <AppText variant="cardTitle" color={currentTheme.textPrimary} style={styles.metricValue}>
            {totalCheckIns}
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.metricLabel}>
            Check-ins
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  starIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroTextGroup: {
    flex: 1,
  },
  heroBadgeTitle: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  pointsLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  subMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 2,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  miniIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 36,
  },
});

export default RewardStatsCard;

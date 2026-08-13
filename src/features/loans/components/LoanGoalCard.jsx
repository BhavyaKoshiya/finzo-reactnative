import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, ChevronRight, CheckCircle2, AlertCircle, Clock, PauseCircle } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { GOAL_STATUS } from '../types/loanGoalTypes';
import { deriveGoalProgress } from '../utils/loanGoalUtils';

export const LoanGoalCard = ({ goal, loan, payments = [], onPress }) => {
  const { currentTheme } = useAppTheme();

  if (!goal || !loan) return null;

  const derived = deriveGoalProgress({ goal, loan, payments });

  const getStatusColor = () => {
    if (goal.status === GOAL_STATUS.PAUSED) return currentTheme.warning;
    if (derived.isCompleted) return '#10B981';
    if (derived.onTrackStatus === 'ahead') return '#10B981';
    if (derived.onTrackStatus === 'behind') return currentTheme.warning;
    return currentTheme.primary;
  };

  const statusColor = getStatusColor();

  return (
    <AppCard style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <AppIcon icon={Target} size={18} color={statusColor} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" numberOfLines={1} style={{ flex: 1 }}>
              {goal.title}
            </AppText>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <AppText variant="caption" color={statusColor} style={{ fontWeight: '700' }}>
              {goal.status === GOAL_STATUS.PAUSED ? 'PAUSED' : derived.statusText}
            </AppText>
          </View>
        </View>

        <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.formattedProgress}>
          {derived.formattedProgress}
        </AppText>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: currentTheme.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${derived.progressPercentage}%`, backgroundColor: statusColor },
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            Progress: {derived.progressPercentage}%
          </AppText>

          <View style={styles.viewDetailsRow}>
            <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
              View Details
            </AppText>
            <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  formattedProgress: {
    marginBottom: 10,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanGoalCard;

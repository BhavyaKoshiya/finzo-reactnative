import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, ChevronRight, Plus, Sparkles } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanGoalPreviewCard = ({
  goal = null,
  onViewGoals,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onViewGoals}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={goal ? `View Payoff Goal: ${goal.title}` : 'Create a Payoff Goal'}
        style={styles.contentRow}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: goal ? `${currentTheme.primary}18` : `${currentTheme.textMuted}15` },
          ]}
        >
          <AppIcon icon={Target} size={20} color={goal ? currentTheme.primary : currentTheme.textMuted} />
        </View>

        <View style={styles.textContainer}>
          {goal ? (
            <>
              <View style={styles.headerTitleRow}>
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  ACTIVE PAYOFF GOAL
                </AppText>
              </View>
              <AppText variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 2 }}>
                {goal.title || 'Personal Payoff Target'}
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                {goal.extraMonthlyAmount > 0
                  ? `Extra ${formatCurrency(goal.extraMonthlyAmount)}/month`
                  : goal.targetPayoffDate
                  ? `Target Payoff: ${goal.targetPayoffDate}`
                  : 'Custom payoff plan'}
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 2 }}>
                No Payoff Goal Set
              </AppText>
              <AppText variant="caption" color={currentTheme.textMuted}>
                Save an extra payment target & track your progress.
              </AppText>
            </>
          )}
        </View>

        <View style={styles.actionRight}>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 4 }}>
            {goal ? 'View Goal' : 'Create Goal'}
          </AppText>
          <AppIcon icon={ChevronRight} size={16} color={currentTheme.primary} />
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerTitleRow: {
    marginBottom: 2,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanGoalPreviewCard;

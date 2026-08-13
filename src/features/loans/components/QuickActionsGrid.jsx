import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Sparkles, Target, TrendingUp } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const QuickActionsGrid = ({
  onRecordPayment,
  onSimulatePrepayment,
  onPayoffGoals,
  onLoanInsights,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();

  const actions = [
    {
      id: 'record_payment',
      title: 'Record Payment',
      subtitle: 'Add EMI / prepayment',
      icon: Plus,
      isPrimary: true,
      onPress: onRecordPayment,
      accessibilityLabel: 'Record payment',
    },
    {
      id: 'simulate_prepayment',
      title: 'Simulate Prepayment',
      subtitle: 'See interest savings',
      icon: Sparkles,
      isPrimary: false,
      onPress: onSimulatePrepayment,
      accessibilityLabel: 'Simulate prepayment',
    },
    {
      id: 'payoff_goals',
      title: 'Payoff Goals',
      subtitle: 'Track your targets',
      icon: Target,
      isPrimary: false,
      onPress: onPayoffGoals,
      accessibilityLabel: 'Payoff goals',
    },
    {
      id: 'loan_insights',
      title: 'Loan Insights',
      subtitle: 'Analytics & schedule',
      icon: TrendingUp,
      isPrimary: false,
      onPress: onLoanInsights,
      accessibilityLabel: 'Loan insights',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <AppText variant="cardTitle" style={styles.sectionTitle}>
        Quick Actions
      </AppText>
      <View style={styles.gridRow}>
        {actions.map((action) => {
          const bg = action.isPrimary
            ? currentTheme.primary
            : isDark
            ? currentTheme.surfaceSubtle
            : '#FFFFFF';
          const titleColor = action.isPrimary ? '#FFFFFF' : currentTheme.textPrimary;
          const subtitleColor = action.isPrimary
            ? 'rgba(255, 255, 255, 0.85)'
            : currentTheme.textMuted;
          const iconColor = action.isPrimary ? '#FFFFFF' : currentTheme.primary;
          const borderColor = action.isPrimary ? currentTheme.primary : currentTheme.border;

          return (
            <TouchableOpacity
              key={action.id}
              onPress={action.onPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              style={[
                styles.actionTile,
                { backgroundColor: bg, borderColor },
              ]}
            >
              <View style={styles.tileHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: action.isPrimary
                        ? 'rgba(255, 255, 255, 0.2)'
                        : `${currentTheme.primary}15`,
                    },
                  ]}
                >
                  <AppIcon icon={action.icon} size={18} color={iconColor} />
                </View>
              </View>
              <AppText variant="bodyMedium" color={titleColor} style={styles.actionTitle} numberOfLines={1}>
                {action.title}
              </AppText>
              <AppText variant="caption" color={subtitleColor} style={styles.actionSubtitle} numberOfLines={1}>
                {action.subtitle}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tileHeader: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
  },
});

export default QuickActionsGrid;

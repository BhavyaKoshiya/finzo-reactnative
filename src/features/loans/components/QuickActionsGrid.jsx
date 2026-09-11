import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Sparkles, Target, TrendingUp, Percent, ChevronRight } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const QuickActionsGrid = ({
  onRecordPayment,
  onSimulatePrepayment,
  onRateRevision,
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
      id: 'rate_revision',
      title: 'Rate Revision',
      subtitle: 'Track repo / EBLR resets',
      icon: Percent,
      isPrimary: false,
      onPress: onRateRevision,
      accessibilityLabel: 'Log interest rate revision',
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
      title: 'Loan Insights & Schedule',
      subtitle: 'Comprehensive analytics, charts & full amortization schedule',
      icon: TrendingUp,
      isPrimary: false,
      onPress: onLoanInsights,
      accessibilityLabel: 'Loan insights',
    },
  ];

  const renderTile = (action) => {
    const bg = action.isPrimary ? currentTheme.primary : currentTheme.card;
    const titleColor = action.isPrimary ? '#FFFFFF' : currentTheme.textPrimary;
    const subtitleColor = action.isPrimary
      ? 'rgba(255, 255, 255, 0.85)'
      : currentTheme.textMuted;
    const iconColor = action.isPrimary ? '#FFFFFF' : currentTheme.primary;
    const borderColor = action.isPrimary ? currentTheme.primary : currentTheme.cardBorder;

    return (
      <TouchableOpacity
        key={action.id}
        onPress={action.onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel}
        style={[
          styles.actionTile,
          {
            backgroundColor: bg,
            borderColor,
            shadowOpacity: isDark ? 0 : 0.05,
          },
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
  };

  const row1 = actions.slice(0, 2);
  const row2 = actions.slice(2, 4);
  const wideAction = actions[4];

  return (
    <View style={[styles.container, style]}>
      <AppText variant="cardTitle" style={styles.sectionTitle}>
        Quick Actions
      </AppText>
      <View style={styles.gridRow}>
        {row1.map(renderTile)}
      </View>
      <View style={styles.gridRow}>
        {row2.map(renderTile)}
      </View>
      {wideAction && (
        <TouchableOpacity
          key={wideAction.id}
          onPress={wideAction.onPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={wideAction.accessibilityLabel}
          style={[
            styles.wideActionTile,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.cardBorder,
              shadowOpacity: isDark ? 0 : 0.05,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${currentTheme.primary}15`, marginRight: 12 },
            ]}
          >
            <AppIcon icon={wideAction.icon} size={18} color={currentTheme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={{ fontWeight: '700' }}>
              {wideAction.title}
            </AppText>
            <AppText variant="caption" color={currentTheme.textMuted} numberOfLines={1}>
              {wideAction.subtitle}
            </AppText>
          </View>
          <AppIcon icon={ChevronRight} size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>
      )}
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
    gap: 10,
    marginBottom: 10,
  },
  wideActionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 0,
    marginBottom: 6,
  },
  actionTile: {
    flex: 1,
    minHeight: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 0,
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

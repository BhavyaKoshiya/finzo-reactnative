import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanDashboardSummary = ({
  totalOriginalLoanAmount = 0,
  totalOutstanding = 0,
  totalMonthlyEMI = 0,
  totalPrincipalPaid = null,
  activeCount = 0,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const originalAmount = Math.max(0, Number(totalOriginalLoanAmount) || 0);
  const outstandingAmount = Math.max(0, Number(totalOutstanding) || 0);
  const emiAmount = Math.max(0, Number(totalMonthlyEMI) || 0);

  const calculatedPaid = totalPrincipalPaid !== null && totalPrincipalPaid !== undefined
    ? Math.max(0, Number(totalPrincipalPaid) || 0)
    : Math.max(0, originalAmount - outstandingAmount);

  const paidRatio = originalAmount > 0 ? Math.min(1, Math.max(0, calculatedPaid / originalAmount)) : 0;
  const paidPercentage = Number((paidRatio * 100).toFixed(2));

  return (
    <AppCard style={[styles.card, { backgroundColor: currentTheme.primary }, style]}>
      {/* Top Header Row: Active Count Badge */}
      <View style={styles.topRow}>
        <View style={styles.countBadge}>
          <AppText variant="caption" color="#FFFFFF" style={styles.countBadgeText}>
            {activeCount} {activeCount === 1 ? 'Active Loan' : 'Active Loans'}
          </AppText>
        </View>
      </View>

      {/* Main Hero Section: Outstanding Principal (Primary Hero Metric) */}
      <View style={styles.heroSection}>
        <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.heroLabel}>
          OUTSTANDING PRINCIPAL
        </AppText>
        <AppText
          variant="h2"
          color="#FFFFFF"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={styles.outstandingAmount}
        >
          {formatCurrency(outstandingAmount)}
        </AppText>
      </View>

      <View style={styles.divider} />

      {/* Secondary Metrics Row: Total Loan Amount vs Monthly EMI */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            Total Loan Amount
          </AppText>
          <AppText
            variant="titleMedium"
            color="#FFFFFF"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={styles.metricValue}
          >
            {formatCurrency(originalAmount)}
          </AppText>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricCol}>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            Monthly EMI
          </AppText>
          <AppText
            variant="titleMedium"
            color="#FFFFFF"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={styles.metricValue}
          >
            {formatCurrency(emiAmount)} / mo
          </AppText>
        </View>
      </View>

      {/* Principal Paid Progress Sub-strip */}
      {originalAmount > 0 && (
        <View style={styles.progressStrip}>
          <View style={styles.progressTextRow}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.95)" style={styles.progressLabel}>
              {formatCurrency(calculatedPaid)} principal paid ({paidPercentage.toFixed(2)}%)
            </AppText>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${paidPercentage}%` }]} />
          </View>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  countBadgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  heroSection: {
    marginTop: 2,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  outstandingAmount: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 2,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  metricValue: {
    fontWeight: '700',
    marginTop: 3,
  },
  progressStrip: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});

export default LoanDashboardSummary;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency, formatCurrencyCompact } from '../../../utils/financeFormatters';

export const LoanDashboardSummary = ({ totalOutstanding, totalMonthlyEMI, activeCount, style }) => {
  const { currentTheme } = useAppTheme();

  return (
    <AppCard style={[styles.card, { backgroundColor: currentTheme.primary }, style]}>
      <View style={styles.topRow}>
        <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
          Total Active Loans ({activeCount})
        </AppText>
        <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
          {formatCurrencyCompact(totalOutstanding)}
        </AppText>
      </View>

      <AppText
        variant="h2"
        color="#FFFFFF"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={styles.totalAmount}
      >
        {formatCurrency(totalOutstanding)}
      </AppText>
      <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.subCaption}>
        Total Outstanding Principal
      </AppText>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            Total Monthly EMI
          </AppText>
          <AppText
            variant="titleMedium"
            color="#FFFFFF"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={styles.emiAmount}
          >
            {formatCurrency(totalMonthlyEMI)} / mo
          </AppText>
        </View>

        <View style={styles.activePill}>
          <AppText variant="caption" color="#FFFFFF" style={styles.activePillText}>
            {activeCount} Active
          </AppText>
        </View>
      </View>
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
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  subCaption: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emiAmount: {
    fontWeight: '700',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activePillText: {
    fontWeight: '700',
  },
});

export default LoanDashboardSummary;

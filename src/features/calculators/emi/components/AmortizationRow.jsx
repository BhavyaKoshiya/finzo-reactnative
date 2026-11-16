import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../../../components/common/AppText';
import { formatCurrency } from '../../../../utils/financeFormatters';
import { useAppTheme } from '../../../../hooks/useAppTheme';

export const AmortizationRow = ({ item, isYearly = false, isLast = false }) => {
  const { currentTheme } = useAppTheme();

  const label = isYearly ? `Year ${item.year}` : `Month ${item.month}`;

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.border }, isLast && styles.noBorder]}>
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.labelTitle}>
          {label}
        </AppText>
        <AppText variant="bodySmall" color={currentTheme.textSecondary}>
          Payment: <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.boldText}>{formatCurrency(item.payment || item.totalPayment)}</AppText>
        </AppText>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailColumn}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            Principal
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textPrimary}>
            {formatCurrency(item.principalComponent)}
          </AppText>
        </View>

        <View style={styles.detailColumn}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            Interest
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary}>
            {formatCurrency(item.interestComponent)}
          </AppText>
        </View>

        <View style={styles.detailColumnRight}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            Balance
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textPrimary}>
            {formatCurrency(item.closingBalance)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelTitle: {
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flex: 1,
  },
  detailColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default AmortizationRow;

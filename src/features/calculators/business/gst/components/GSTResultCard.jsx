import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatCurrency } from '../../../../../utils/financeFormatters';
import { formatPercentage } from '../../../../../utils/financeFormatters';

export const GSTResultCard = ({ result, style }) => {
  if (!result) return null;

  const { baseAmount, gstAmount, totalAmount, gstRate, mode } = result;
  const isExclusive = mode === 'exclusive';

  return (
    <View style={style}>
      <ResultCard
        title={isExclusive ? 'Total Amount (Base + GST)' : 'Total Amount (Inclusive)'}
        value={formatCurrency(totalAmount)}
        subtitle={`Calculated at ${formatPercentage(gstRate)} GST rate (${isExclusive ? 'Exclusive' : 'Inclusive'})`}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Base Amount"
          value={formatCurrency(baseAmount)}
        />
        <CalculatorSummaryRow
          label={`GST Amount (${formatPercentage(gstRate)})`}
          value={formatCurrency(gstAmount)}
        />
        <CalculatorSummaryRow
          label="Total Amount"
          value={formatCurrency(totalAmount)}
          isBold
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
});

export default GSTResultCard;

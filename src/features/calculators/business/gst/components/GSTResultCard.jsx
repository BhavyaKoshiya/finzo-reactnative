import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage } from '../../../../../utils/financeFormatters';

export const GSTResultCard = ({ result, style }) => {
  if (!result) return null;

  const { baseAmount, gstAmount, totalAmount, gstRate, mode } = result;
  const isExclusive = mode === 'exclusive';

  return (
    <View style={style}>
      <ResultCard
        title={isExclusive ? 'Total Amount (Base + GST)' : 'Total Amount (Inclusive)'}
        value={formatINR(totalAmount)}
        subtitle={`Calculated at ${formatPercentage(gstRate)} GST rate (${isExclusive ? 'Exclusive' : 'Inclusive'})`}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Base Amount"
          value={formatINR(baseAmount)}
        />
        <CalculatorSummaryRow
          label={`GST Amount (${formatPercentage(gstRate)})`}
          value={formatINR(gstAmount)}
        />
        <CalculatorSummaryRow
          label="Total Amount"
          value={formatINR(totalAmount)}
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

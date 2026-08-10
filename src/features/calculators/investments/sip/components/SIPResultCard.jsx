import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';

export const SIPResultCard = ({ result, style }) => {
  if (!result) return null;

  const { maturityAmount, totalInvested, estimatedReturns } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Estimated Future Value"
        value={formatINR(maturityAmount)}
        subtitle="Based on assumed return rate"
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Total Invested Amount"
          value={formatINR(totalInvested)}
        />
        <CalculatorSummaryRow
          label="Estimated Returns"
          value={formatINR(estimatedReturns)}
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

export default SIPResultCard;

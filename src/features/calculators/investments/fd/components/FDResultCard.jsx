import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';

export const FDResultCard = ({ result, style }) => {
  if (!result) return null;

  const { maturityAmount, principal, interestEarned } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Maturity Amount"
        value={formatINR(maturityAmount)}
        subtitle="Total payout at completion"
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Deposit Principal Amount"
          value={formatINR(principal)}
        />
        <CalculatorSummaryRow
          label="Total Interest Earned"
          value={formatINR(interestEarned)}
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

export default FDResultCard;

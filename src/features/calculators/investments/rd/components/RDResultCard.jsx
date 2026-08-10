import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';

export const RDResultCard = ({ result, style }) => {
  if (!result) return null;

  const { maturityAmount, totalDeposited, interestEarned } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Maturity Amount"
        value={formatINR(maturityAmount)}
        subtitle="Standard quarterly compounding model"
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Total Monthly Deposits"
          value={formatINR(totalDeposited)}
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

export default RDResultCard;

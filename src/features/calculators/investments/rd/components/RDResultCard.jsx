import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatCurrency } from '../../../../../utils/financeFormatters';

export const RDResultCard = ({ result, style }) => {
  if (!result) return null;

  const { maturityAmount, totalDeposited, interestEarned } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Maturity Amount"
        value={formatCurrency(maturityAmount)}
        subtitle="Standard quarterly compounding model"
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Total Monthly Deposits"
          value={formatCurrency(totalDeposited)}
        />
        <CalculatorSummaryRow
          label="Total Interest Earned"
          value={formatCurrency(interestEarned)}
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

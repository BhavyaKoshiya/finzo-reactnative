import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatCurrency } from '../../../../../utils/financeFormatters';

export const FDResultCard = ({ result, style }) => {
  if (!result) return null;

  const { maturityAmount, principal, interestEarned } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Maturity Amount"
        value={formatCurrency(maturityAmount)}
        subtitle="Total payout at completion"
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Deposit Principal Amount"
          value={formatCurrency(principal)}
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

export default FDResultCard;

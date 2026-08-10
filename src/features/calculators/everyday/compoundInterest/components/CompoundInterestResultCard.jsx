import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage } from '../../../../../utils/financeFormatters';

export const CompoundInterestResultCard = ({ result, style }) => {
  if (!result) return null;

  const {
    principal,
    interestEarned,
    maturityAmount,
    annualInterestRate,
    tenureYears,
    compoundingFrequency,
  } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Compounded Total Amount"
        value={formatINR(maturityAmount)}
        subtitle={`Compounded ${compoundingFrequency} at ${formatPercentage(annualInterestRate)} p.a. over ${tenureYears} year${tenureYears === 1 ? '' : 's'}`}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Principal Amount"
          value={formatINR(principal)}
        />
        <CalculatorSummaryRow
          label="Interest Earned"
          value={formatINR(interestEarned)}
        />
        <CalculatorSummaryRow
          label="Total Compounded Amount"
          value={formatINR(maturityAmount)}
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

export default CompoundInterestResultCard;

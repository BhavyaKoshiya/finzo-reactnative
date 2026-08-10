import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import AppText from '../../../../../components/common/AppText';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage } from '../../../../../utils/financeFormatters';
import { useAppTheme } from '../../../../../hooks/useAppTheme';

export const SimpleInterestResultCard = ({ result, style }) => {
  const { currentTheme } = useAppTheme();

  if (!result) return null;

  const { principal, interest, totalAmount, annualInterestRate, tenureYears } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Total Amount (Principal + Interest)"
        value={formatINR(totalAmount)}
        subtitle={`Simple interest at ${formatPercentage(annualInterestRate)} p.a. over ${tenureYears} year${tenureYears === 1 ? '' : 's'}`}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Principal Amount"
          value={formatINR(principal)}
        />
        <CalculatorSummaryRow
          label="Interest Earned"
          value={formatINR(interest)}
        />
        <CalculatorSummaryRow
          label="Total Amount"
          value={formatINR(totalAmount)}
          isBold
        />
      </View>

      <AppText variant="caption" color={currentTheme.textMuted} style={styles.infoText}>
        Simple interest is calculated strictly on the initial principal throughout the duration.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    marginTop: 12,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
});

export default SimpleInterestResultCard;

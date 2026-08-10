import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage } from '../../../../../utils/financeFormatters';

export const ROIResultCard = ({ result, style }) => {
  if (!result) return null;

  const { roi, netProfit, initialInvestment, finalValue, isProfit } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Return on Investment (ROI)"
        value={formatPercentage(roi)}
        subtitle={isProfit ? 'Net profit percentage gain' : 'Net loss percentage'}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Initial Investment Cost"
          value={formatINR(initialInvestment)}
        />
        <CalculatorSummaryRow
          label="Final Value Returned"
          value={formatINR(finalValue)}
        />
        <CalculatorSummaryRow
          label={isProfit ? 'Net Profit' : 'Net Loss'}
          value={formatINR(Math.abs(netProfit))}
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

export default ROIResultCard;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage } from '../../../../../utils/financeFormatters';

export const CAGRResultCard = ({ result, style }) => {
  if (!result) return null;

  const { cagr, initialValue, finalValue, absoluteGain, tenureYears } = result;
  const isPositive = cagr >= 0;

  return (
    <View style={style}>
      <ResultCard
        title="Compound Annual Growth Rate (CAGR)"
        value={formatPercentage(cagr)}
        subtitle={`Compounded annual return over ${tenureYears} year${tenureYears === 1 ? '' : 's'}`}
      />

      <View style={styles.summaryContainer}>
        <CalculatorSummaryRow
          label="Initial Investment"
          value={formatINR(initialValue)}
        />
        <CalculatorSummaryRow
          label="Final Investment Value"
          value={formatINR(finalValue)}
        />
        <CalculatorSummaryRow
          label={isPositive ? 'Absolute Gain' : 'Absolute Loss'}
          value={formatINR(Math.abs(absoluteGain))}
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

export default CAGRResultCard;

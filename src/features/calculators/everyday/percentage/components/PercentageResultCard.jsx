import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResultCard from '../../../../../components/cards/ResultCard';
import CalculatorSummaryRow from '../../../../../components/calculator/CalculatorSummaryRow';
import { formatINR } from '../../../../../calculations/core/currency';
import { formatPercentage, formatNumber } from '../../../../../utils/financeFormatters';

export const PercentageResultCard = ({ result, style }) => {
  if (!result) return null;

  const { mode } = result;

  if (mode === 'percentage-of') {
    const { value, percentage, result: calculatedValue } = result;
    return (
      <View style={style}>
        <ResultCard
          title={`Calculated Value (${formatPercentage(percentage)} of ${formatNumber(value)})`}
          value={formatNumber(calculatedValue)}
          subtitle={`${formatPercentage(percentage)} of ${formatNumber(value)} = ${formatNumber(calculatedValue)}`}
        />
        <View style={styles.summaryContainer}>
          <CalculatorSummaryRow
            label="Percentage Rate"
            value={formatPercentage(percentage)}
          />
          <CalculatorSummaryRow
            label="Original Amount"
            value={formatNumber(value)}
          />
          <CalculatorSummaryRow
            label="Calculated Result"
            value={formatNumber(calculatedValue)}
            isBold
          />
        </View>
      </View>
    );
  }

  if (mode === 'percentage-change') {
    const { oldValue, newValue, difference, percentageChange: pctChange, isIncrease } = result;
    return (
      <View style={style}>
        <ResultCard
          title={isIncrease ? 'Percentage Increase' : 'Percentage Decrease'}
          value={formatPercentage(pctChange)}
          subtitle={`From ${formatNumber(oldValue)} to ${formatNumber(newValue)} (${isIncrease ? '+' : ''}${formatNumber(difference)})`}
        />
        <View style={styles.summaryContainer}>
          <CalculatorSummaryRow
            label="Original Value"
            value={formatNumber(oldValue)}
          />
          <CalculatorSummaryRow
            label="New Value"
            value={formatNumber(newValue)}
          />
          <CalculatorSummaryRow
            label="Absolute Difference"
            value={formatNumber(Math.abs(difference))}
          />
          <CalculatorSummaryRow
            label="Percentage Change"
            value={`${formatPercentage(pctChange)} (${isIncrease ? 'Increase' : 'Decrease'})`}
            isBold
          />
        </View>
      </View>
    );
  }

  if (mode === 'percentage-difference') {
    const { valA, valB, difference, percentageDifference: pctDiff } = result;
    return (
      <View style={style}>
        <ResultCard
          title="Percentage Difference"
          value={formatPercentage(pctDiff)}
          subtitle={`Relative difference between ${formatNumber(valA)} and ${formatNumber(valB)}`}
        />
        <View style={styles.summaryContainer}>
          <CalculatorSummaryRow
            label="Value A"
            value={formatNumber(valA)}
          />
          <CalculatorSummaryRow
            label="Value B"
            value={formatNumber(valB)}
          />
          <CalculatorSummaryRow
            label="Absolute Difference"
            value={formatINR(difference)}
          />
          <CalculatorSummaryRow
            label="Percentage Difference"
            value={formatPercentage(pctDiff)}
            isBold
          />
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  summaryContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
});

export default PercentageResultCard;

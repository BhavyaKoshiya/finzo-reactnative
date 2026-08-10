import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CalculatorSummaryRow = ({
  label,
  value,
  isBold = false,
  isHighlighted = false,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: currentTheme.border },
        isHighlighted && { backgroundColor: currentTheme.surfaceHighlight },
        style,
      ]}
    >
      <AppText
        variant={isBold ? 'bodyMedium' : 'bodySmall'}
        color={isBold ? currentTheme.textPrimary : currentTheme.textSecondary}
        style={isBold && styles.boldText}
      >
        {label}
      </AppText>

      <AppText
        variant={isBold ? 'bodyMedium' : 'bodySmall'}
        color={currentTheme.textPrimary}
        style={isBold && styles.boldText}
      >
        {value}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  boldText: {
    fontWeight: '700',
  },
});

export default CalculatorSummaryRow;

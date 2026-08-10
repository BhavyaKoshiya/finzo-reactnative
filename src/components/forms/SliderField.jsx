import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SliderField = ({
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChangeValue,
  formatter,
  disabled = false,
  minLabel,
  maxLabel,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const formattedValue = formatter ? formatter(value) : value.toString();

  return (
    <View style={[styles.container, style]}>
      {(label || formattedValue) && (
        <View style={styles.header}>
          {label && (
            <AppText variant="resultLabel" color={currentTheme.textPrimary}>
              {label}
            </AppText>
          )}
          <AppText variant="bodyMedium" color={currentTheme.primary} style={styles.valueText}>
            {formattedValue}
          </AppText>
        </View>
      )}

      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChangeValue}
        disabled={disabled}
        minimumTrackTintColor={currentTheme.primary}
        maximumTrackTintColor={currentTheme.border}
        thumbTintColor={currentTheme.primary}
        accessibilityLabel={label || 'Slider'}
        accessibilityValue={{ min, max, now: value }}
        style={styles.slider}
      />

      {(minLabel || maxLabel) && (
        <View style={styles.rangeRow}>
          <AppText variant="caption" color={currentTheme.textMuted}>
            {minLabel || min.toString()}
          </AppText>
          <AppText variant="caption" color={currentTheme.textMuted}>
            {maxLabel || max.toString()}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueText: {
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
});

export default SliderField;

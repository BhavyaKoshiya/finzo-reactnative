import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const DurationInput = ({
  label,
  value,
  onChangeValue,
  unit = 'years', // 'years' | 'months'
  onUnitChange,
  placeholder = '0',
  helperText,
  errorText,
  required = false,
  disabled = false,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();
  const [activeUnit, setActiveUnit] = useState(unit);

  const handleUnitToggle = (newUnit) => {
    setActiveUnit(newUnit);
    if (onUnitChange) {
      onUnitChange(newUnit);
    }
  };

  const handleChangeText = (text) => {
    const raw = text.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    onChangeValue(isNaN(num) ? '' : num);
  };

  const unitToggle = (
    <View style={[styles.toggleContainer, { backgroundColor: currentTheme.border }]}>
      <TouchableOpacity
        onPress={() => handleUnitToggle('years')}
        style={[
          styles.toggleButton,
          activeUnit === 'years' && { backgroundColor: currentTheme.primary },
        ]}
      >
        <AppText
          variant="caption"
          color={activeUnit === 'years' ? '#FFFFFF' : currentTheme.textSecondary}
          style={styles.toggleText}
        >
          Yr
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleUnitToggle('months')}
        style={[
          styles.toggleButton,
          activeUnit === 'months' && { backgroundColor: currentTheme.primary },
        ]}
      >
        <AppText
          variant="caption"
          color={activeUnit === 'months' ? '#FFFFFF' : currentTheme.textSecondary}
          style={styles.toggleText}
        >
          Mo
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      required={required}
      trailingContent={unitToggle}
      style={style}
    >
      <TextInput
        value={value !== undefined && value !== null ? value.toString() : ''}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.textMuted}
        keyboardType="number-pad"
        editable={!disabled}
        accessibilityLabel={label || 'Duration input'}
        style={[
          styles.input,
          { color: currentTheme.textPrimary },
          disabled && { color: currentTheme.textMuted },
        ]}
        {...props}
      />
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleText: {
    fontWeight: '600',
  },
});

export default DurationInput;

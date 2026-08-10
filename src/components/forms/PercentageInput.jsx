import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';
import { parseINRInput } from '../../utils/numberUtils';

export const PercentageInput = ({
  label,
  value,
  onChangeValue,
  placeholder = '0.0',
  helperText,
  errorText,
  required = false,
  disabled = false,
  min = 0,
  max = 100,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  const handleChangeText = (text) => {
    const raw = parseINRInput(text);
    const num = parseFloat(raw);
    if (isNaN(num)) {
      onChangeValue('');
    } else {
      onChangeValue(num);
    }
  };

  const trailing = (
    <AppText variant="input" color={currentTheme.textSecondary}>
      %
    </AppText>
  );

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      required={required}
      trailingContent={trailing}
      style={style}
    >
      <TextInput
        value={value !== undefined && value !== null ? value.toString() : ''}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.textMuted}
        keyboardType="decimal-pad"
        editable={!disabled}
        accessibilityLabel={label || 'Percentage input'}
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
});

export default PercentageInput;

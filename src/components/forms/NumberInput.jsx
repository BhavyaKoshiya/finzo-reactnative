import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';
import { parseINRInput } from '../../utils/numberUtils';

export const NumberInput = ({
  label,
  value,
  onChangeValue,
  placeholder = '0',
  helperText,
  errorText,
  required = false,
  disabled = false,
  allowDecimal = true,
  prefix,
  suffix,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  const handleChangeText = (text) => {
    const raw = allowDecimal ? parseINRInput(text) : text.replace(/[^0-9]/g, '');
    const num = allowDecimal ? parseFloat(raw) : parseInt(raw, 10);
    if (isNaN(num)) {
      onChangeValue('');
    } else {
      onChangeValue(num);
    }
  };

  const trailing = suffix ? (
    <AppText variant="input" color={currentTheme.textSecondary}>
      {suffix}
    </AppText>
  ) : null;

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
        selectionColor={currentTheme.primary}
        keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
        editable={!disabled}
        accessibilityLabel={label || 'Numeric input'}
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

export default NumberInput;

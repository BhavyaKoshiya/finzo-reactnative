import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatINR, parseINRInput } from '../../utils/numberUtils';

export const MoneyInput = ({
  label,
  value,
  onChangeValue,
  placeholder = '0',
  helperText,
  errorText,
  required = false,
  disabled = false,
  min,
  max,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [displayString, setDisplayString] = useState('');

  useEffect(() => {
    if (!isFocused) {
      if (value !== undefined && value !== null && value !== '') {
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (!isNaN(num)) {
          setDisplayString(formatINR(num, false));
        } else {
          setDisplayString('');
        }
      } else {
        setDisplayString('');
      }
    } else {
      setDisplayString(
        value !== undefined && value !== null ? value.toString() : '',
      );
    }
  }, [value, isFocused]);

  const handleChangeText = text => {
    const raw = parseINRInput(text);
    setDisplayString(raw);
    const num = parseFloat(raw);
    if (onChangeValue) {
      onChangeValue(isNaN(num) ? '' : num);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value !== undefined && value !== null) {
      setDisplayString(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value !== undefined && value !== null && value !== '') {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        if (min !== undefined && num < min) {
          onChangeValue(min);
          setDisplayString(formatINR(min, false));
          return;
        }
        if (max !== undefined && num > max) {
          onChangeValue(max);
          setDisplayString(formatINR(max, false));
          return;
        }
        setDisplayString(formatINR(num, false));
      }
    }
  };

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      required={required}
      style={style}
    >
      <View style={styles.inputRow}>
        <AppText
          variant="input"
          color={currentTheme.primary}
          style={styles.prefix}
        >
          ₹
        </AppText>
        <TextInput
          value={displayString}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={currentTheme.textMuted}
          keyboardType="decimal-pad"
          editable={!disabled}
          accessibilityLabel={label || 'Monetary amount'}
          style={[
            styles.input,
            { color: currentTheme.textPrimary },
            disabled && { color: currentTheme.textMuted },
          ]}
          {...props}
        />
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  prefix: {
    marginRight: 6,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingTop: 0,
    paddingBottom: 0,
    paddingVertical: 0,
    includeFontPadding: false,
  },
});

export default MoneyInput;

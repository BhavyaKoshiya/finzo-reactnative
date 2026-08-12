import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import FormField from './FormField';
import { useAppTheme } from '../../hooks/useAppTheme';

export const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      required={required}
      style={style}
    >
      <TextInput
        value={value !== undefined && value !== null ? String(value) : ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.textMuted}
        selectionColor={currentTheme.primary}
        editable={!disabled}
        accessibilityLabel={label || 'Text input'}
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
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
    includeFontPadding: false,
  },
});

export default TextInputField;

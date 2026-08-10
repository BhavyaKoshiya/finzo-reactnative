import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { ChevronDown } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SelectField = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Select option',
  helperText,
  errorText,
  required = false,
  disabled = false,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const chevron = (
    <AppIcon icon={ChevronDown} size={20} color={currentTheme.textSecondary} />
  );

  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label || 'Select option'}
    >
      <FormField
        label={label}
        helperText={helperText}
        errorText={errorText}
        required={required}
        trailingContent={chevron}
        style={style}
      >
        <View style={styles.content}>
          <AppText
            variant="input"
            color={selectedOption ? currentTheme.textPrimary : currentTheme.textMuted}
          >
            {displayLabel}
          </AppText>
        </View>
      </FormField>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    justify: 'center',
    height: '100%',
  },
});

export default SelectField;

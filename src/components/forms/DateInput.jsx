import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import FormField from './FormField';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { Calendar } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatDisplayDate } from '../../utils/dateUtils';

export const DateInput = ({
  label,
  value,
  onPress,
  placeholder = 'Select date',
  helperText,
  errorText,
  required = false,
  disabled = false,
  formatPattern = 'dd MMM yyyy',
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const formattedDate = value ? formatDisplayDate(value, formatPattern) : placeholder;

  const calendarIcon = (
    <AppIcon icon={Calendar} size={20} color={currentTheme.textSecondary} />
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label || 'Select date'}
    >
      <FormField
        label={label}
        helperText={helperText}
        errorText={errorText}
        required={required}
        trailingContent={calendarIcon}
        style={style}
      >
        <View style={styles.content}>
          <AppText
            variant="input"
            color={value ? currentTheme.textPrimary : currentTheme.textMuted}
          >
            {formattedDate}
          </AppText>
        </View>
      </FormField>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    height: '100%',
  },
});

export default DateInput;

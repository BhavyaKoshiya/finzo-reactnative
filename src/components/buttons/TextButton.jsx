import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const TextButton = ({
  title,
  onPress,
  disabled = false,
  color,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.button, style]}
      {...props}
    >
      <AppText
        variant="bodyMedium"
        color={disabled ? currentTheme.textMuted : color || currentTheme.primary}
        style={textStyle}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});

export default TextButton;

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const IconButton = ({
  icon,
  onPress,
  size = 24,
  color,
  disabled = false,
  accessibilityLabel,
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  const iconColor = color || (disabled ? currentTheme.textMuted : currentTheme.textPrimary);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <AppIcon icon={icon} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;

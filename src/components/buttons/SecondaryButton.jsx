import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[
        styles.button,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        },
        disabled && { backgroundColor: currentTheme.background },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={currentTheme.primary} size="small" />
      ) : (
        <AppText
          variant="button"
          color={disabled ? currentTheme.textMuted : currentTheme.textPrimary}
          style={textStyle}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default SecondaryButton;

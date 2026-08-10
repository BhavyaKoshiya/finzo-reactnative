import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const TertiaryButton = ({
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
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.button, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={currentTheme.primary} size="small" />
      ) : (
        <AppText
          variant="button"
          color={disabled ? currentTheme.textMuted : currentTheme.primary}
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
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

export default TertiaryButton;

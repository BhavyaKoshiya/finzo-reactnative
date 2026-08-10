import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export const AppIcon = ({
  icon: IconComponent,
  size = 24,
  color,
  strokeWidth = 2,
  accessibilityLabel,
  style,
  ...otherProps
}) => {
  const { currentTheme } = useAppTheme();

  if (!IconComponent) return null;

  const iconColor = color || currentTheme.textPrimary;

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={style}
    >
      <IconComponent
        size={size}
        color={iconColor}
        strokeWidth={strokeWidth}
        {...otherProps}
      />
    </View>
  );
};

export default AppIcon;

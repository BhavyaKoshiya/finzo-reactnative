import React from 'react';
import { Text } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { typography } from '../../theme/typography';

export const AppText = ({
  variant = 'body',
  color,
  align,
  numberOfLines,
  style,
  children,
  ...otherProps
}) => {
  const { currentTheme } = useAppTheme();

  const variantStyle = typography[variant] || typography.body;
  const defaultColor =
    variant === 'caption' || variant === 'resultLabel' || variant === 'bodySmall'
      ? currentTheme.textSecondary
      : currentTheme.textPrimary;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        variantStyle,
        { color: color || defaultColor },
        align && { textAlign: align },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};

export default AppText;

import React from 'react';
import { StyleSheet } from 'react-native';
import { ShadowedView } from 'react-native-fast-shadow';
import { useAppTheme } from '../../hooks/useAppTheme';

export const AppCard = ({
  topBorderRadius,
  bottomBorderRadius,
  borderRadius = 16,
  shadowColor = 'rgba(10, 86, 217, 0.08)',
  containerStyle,
  style,
  children,
  shadowOpacity = 0.06,
  shadowRadius = 8,
  ...other
}) => {
  const { isDark, currentTheme } = useAppTheme();

  const dynamicShadowColor = isDark ? '#000000' : shadowColor;
  const dynamicShadowOpacity = isDark ? 0.3 : shadowOpacity;

  const dynamicStyle = {
    backgroundColor: currentTheme.card,
    borderColor: currentTheme.cardBorder,
    borderTopLeftRadius: topBorderRadius ?? borderRadius,
    borderTopRightRadius: topBorderRadius ?? borderRadius,
    borderBottomLeftRadius: bottomBorderRadius ?? borderRadius,
    borderBottomRightRadius: bottomBorderRadius ?? borderRadius,
    shadowColor: dynamicShadowColor,
    shadowRadius,
    shadowOpacity: dynamicShadowOpacity,
  };

  return (
    <ShadowedView
      style={[
        styles.container,
        dynamicStyle,
        containerStyle,
        style,
      ]}
      {...other}
    >
      {children}
    </ShadowedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    padding: 16,
    overflow: 'hidden',
  },
});

export default AppCard;

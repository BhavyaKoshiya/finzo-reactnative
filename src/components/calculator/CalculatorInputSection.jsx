import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../cards/AppCard';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CalculatorInputSection = ({
  title,
  subtitle,
  children,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <AppCard style={[styles.card, style]}>
      {title && (
        <AppText variant="cardTitle" style={styles.title}>
          {title}
        </AppText>
      )}
      {subtitle && (
        <AppText
          variant="caption"
          color={currentTheme.textSecondary}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      )}
      <View style={styles.content}>{children}</View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: 16,
  },
  content: {
    marginTop: 4,
  },
});

export default CalculatorInputSection;

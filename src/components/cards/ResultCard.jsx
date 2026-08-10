import React from 'react';
import { StyleSheet } from 'react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const ResultCard = ({ title, value, subtitle, children, style, ...props }) => {
  const { currentTheme } = useAppTheme();

  return (
    <AppCard
      style={[
        styles.card,
        { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
        style,
      ]}
      {...props}
    >
      {title && <AppText variant="resultLabel" color={currentTheme.textSecondary}>{title}</AppText>}
      {value && <AppText variant="resultValue" color={currentTheme.primary} style={styles.value}>{value}</AppText>}
      {subtitle && <AppText variant="caption" color={currentTheme.textMuted}>{subtitle}</AppText>}
      {children}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  value: {
    marginVertical: 4,
  },
});

export default ResultCard;

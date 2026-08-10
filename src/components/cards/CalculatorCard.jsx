import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CalculatorCard = ({ title, description, icon, onPress, style, ...props }) => {
  const { currentTheme } = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <AppCard style={[styles.card, style]} {...props}>
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: currentTheme.primaryLight }]}>
              <AppIcon icon={icon} size={22} color={currentTheme.primary} />
            </View>
          )}
          <View style={styles.textContainer}>
            <AppText variant="cardTitle">{title}</AppText>
            {description && (
              <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.description}>
                {description}
              </AppText>
            )}
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
});

export default CalculatorCard;

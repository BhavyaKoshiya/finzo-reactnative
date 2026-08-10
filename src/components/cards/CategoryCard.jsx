import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CategoryCard = ({ title, count, icon, onPress, style, ...props }) => {
  const { currentTheme } = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <AppCard style={[styles.card, style]} {...props}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: currentTheme.primaryLight }]}>
            <AppIcon icon={icon} size={24} color={currentTheme.primary} />
          </View>
        )}
        <AppText variant="cardTitle" style={styles.title}>{title}</AppText>
        {count !== undefined && (
          <AppText variant="caption" color={currentTheme.textSecondary}>
            {count} {count === 1 ? 'tool' : 'tools'}
          </AppText>
        )}
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
});

export default CategoryCard;

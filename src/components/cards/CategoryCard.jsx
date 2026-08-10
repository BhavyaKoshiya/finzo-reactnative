import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CategoryCard = ({
  title,
  count,
  icon,
  onPress,
  variant = 'row',
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
        style={style}
      >
        <AppCard style={styles.gridCard} {...props}>
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
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={style}
    >
      <AppCard style={styles.rowCard} {...props}>
        <View style={styles.rowLeft}>
          {icon && (
            <View style={[styles.iconBoxRow, { backgroundColor: currentTheme.primaryLight }]}>
              <AppIcon icon={icon} size={22} color={currentTheme.primary} />
            </View>
          )}
          <View style={styles.rowTextGroup}>
            <AppText variant="cardTitle" style={styles.titleRow}>{title}</AppText>
            {count !== undefined && (
              <AppText variant="caption" color={currentTheme.textSecondary}>
                {count} {count === 1 ? 'calculator' : 'calculators'} available
              </AppText>
            )}
          </View>
        </View>
        <View style={styles.rowRight}>
          <AppIcon icon={ChevronRight} size={20} color={currentTheme.textMuted} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    padding: 16,
    alignItems: 'flex-start',
  },
  rowCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowRight: {
    marginLeft: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBoxRow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowTextGroup: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  titleRow: {
    marginBottom: 2,
  },
});

export default CategoryCard;

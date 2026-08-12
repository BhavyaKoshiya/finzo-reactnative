import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ProfileRow = ({
  icon,
  title,
  subtitle,
  value,
  rightElement,
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const { currentTheme, isDark } = useAppTheme();

  const iconBg = isDark ? 'rgba(59, 130, 246, 0.18)' : `${currentTheme.primary}12`;
  const iconColor = isDark ? '#60A5FA' : currentTheme.primary;

  const content = (
    <AppCard style={[styles.card, style]}>
      <View style={styles.row}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <AppIcon icon={icon} size={20} color={iconColor} />
          </View>
        )}
        <View style={styles.textGroup}>
          <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.title}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}
        </View>
        {value && (
          <AppText variant="caption" color={currentTheme.textSecondary} style={styles.valueText}>
            {value}
          </AppText>
        )}
        {rightElement}
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled }}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    minHeight: 44,
  },
  card: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
  },
  valueText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileRow;

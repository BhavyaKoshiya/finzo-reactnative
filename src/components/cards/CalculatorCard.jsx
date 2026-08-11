import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CalculatorCard = ({
  title,
  description,
  icon,
  onPress,
  status = 'available',
  badgeText,
  disabled,
  style,
  ...props
}) => {
  const { currentTheme, isDark } = useAppTheme();

  const isComingSoon = status === 'comingSoon';
  const isDisabled = disabled !== undefined ? disabled : isComingSoon || !onPress;
  const badgeLabel = badgeText || (isComingSoon ? 'Coming Soon' : null);

  const iconBgColor = isDisabled
    ? currentTheme.border
    : isDark
    ? 'rgba(59, 130, 246, 0.22)'
    : currentTheme.primaryLight;

  const iconColor = isDisabled
    ? currentTheme.textMuted
    : isDark
    ? '#60A5FA'
    : currentTheme.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <AppCard style={[styles.card, isDisabled && styles.disabledCard, style]} {...props}>
        <View style={styles.header}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: iconBgColor,
                },
              ]}
            >
              <AppIcon
                icon={icon}
                size={22}
                color={iconColor}
              />
            </View>
          )}

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <AppText
                variant="cardTitle"
                color={isDisabled ? currentTheme.textSecondary : currentTheme.textPrimary}
                style={styles.titleText}
              >
                {title}
              </AppText>
              {badgeLabel && (
                <View
                  style={[
                    styles.badgeContainer,
                    {
                      backgroundColor: currentTheme.surfaceHighlight || (isDark ? '#334155' : '#F3F4F6'),
                      borderColor: currentTheme.border,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={currentTheme.textMuted}
                    style={styles.badgeText}
                  >
                    {badgeLabel}
                  </AppText>
                </View>
              )}
            </View>

            {description && (
              <AppText
                variant="bodySmall"
                color={currentTheme.textSecondary}
                style={styles.description}
              >
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
  disabledCard: {
    opacity: 0.85,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    marginRight: 6,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    marginTop: 2,
  },
});

export default CalculatorCard;

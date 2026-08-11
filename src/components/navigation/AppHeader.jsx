import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const AppHeader = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  centered = false,
  useSafeAreaTop = true,
  style,
}) => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const topPadding = useSafeAreaTop ? Math.max(insets.top + 12, 24) : 12;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPadding,
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.border,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {leftAction ? (
          <TouchableOpacity
            onPress={leftAction.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={leftAction.accessibilityLabel || 'Header left action'}
            style={styles.actionButton}
          >
            <AppIcon
              icon={leftAction.icon}
              size={leftAction.size || 22}
              color={leftAction.color || currentTheme.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        <View style={[styles.titleGroup, centered && styles.centeredTitle]}>
          {title && (
            <AppText
              variant="cardTitle"
              align={centered ? 'center' : 'left'}
              numberOfLines={1}
              color={currentTheme.textPrimary}
            >
              {title}
            </AppText>
          )}
          {subtitle && (
            <AppText
              variant="caption"
              align={centered ? 'center' : 'left'}
              numberOfLines={1}
              color={currentTheme.textSecondary}
            >
              {subtitle}
            </AppText>
          )}
        </View>

        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={rightAction.accessibilityLabel || 'Header right action'}
            style={styles.actionButton}
          >
            <AppIcon
              icon={rightAction.icon}
              size={rightAction.size || 22}
              color={rightAction.color || currentTheme.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  titleGroup: {
    flex: 1,
    paddingHorizontal: 4,
  },
  centeredTitle: {
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlaceholder: {
    width: 36,
  },
});

export default AppHeader;

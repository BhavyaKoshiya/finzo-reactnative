import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FileQuestion } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import PrimaryButton from '../buttons/PrimaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';

export const EmptyState = ({
  title = 'No Data Available',
  description = 'There are no items to display at this time.',
  icon = FileQuestion,
  actionTitle,
  onActionPress,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconBox, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        <AppIcon icon={icon} size={36} color={currentTheme.textMuted} />
      </View>
      <AppText variant="sectionTitle" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" align="center" color={currentTheme.textSecondary} style={styles.description}>
        {description}
      </AppText>
      {actionTitle && onActionPress && (
        <PrimaryButton title={actionTitle} onPress={onActionPress} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 6,
  },
  description: {
    maxWidth: 280,
    marginBottom: 16,
  },
  button: {
    minWidth: 140,
  },
});

export default EmptyState;

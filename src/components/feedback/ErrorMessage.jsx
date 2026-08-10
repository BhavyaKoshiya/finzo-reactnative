import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const ErrorMessage = ({ message, style }) => {
  const { currentTheme } = useAppTheme();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.errorLight, borderColor: currentTheme.error },
        style,
      ]}
      accessibilityRole="alert"
    >
      <AppIcon icon={AlertCircle} size={18} color={currentTheme.error} style={styles.icon} />
      <AppText variant="bodySmall" color={currentTheme.error} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
  },
});

export default ErrorMessage;

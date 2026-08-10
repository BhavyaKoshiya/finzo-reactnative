import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SuccessMessage = ({ message, style }) => {
  const { currentTheme } = useAppTheme();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.successLight, borderColor: currentTheme.success },
        style,
      ]}
      accessibilityRole="text"
    >
      <AppIcon icon={CheckCircle2} size={18} color={currentTheme.success} style={styles.icon} />
      <AppText variant="bodySmall" color={currentTheme.success} style={styles.text}>
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

export default SuccessMessage;

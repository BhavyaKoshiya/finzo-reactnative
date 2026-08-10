import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const LoadingState = ({ message = 'Loading...', style }) => {
  const { currentTheme } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={currentTheme.primary} style={styles.spinner} />
      {message && (
        <AppText variant="bodySmall" color={currentTheme.textSecondary}>
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
});

export default LoadingState;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../common/AppText';

export const CalculatorResultSection = ({
  title = 'Calculation Results',
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.divider} />
      {title && (
        <AppText variant="sectionTitle" style={styles.title}>
          {title}
        </AppText>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
});

export default CalculatorResultSection;

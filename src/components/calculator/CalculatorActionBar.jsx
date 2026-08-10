import React from 'react';
import { View, StyleSheet } from 'react-native';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';

export const CalculatorActionBar = ({
  primaryTitle = 'Calculate',
  primaryIcon,
  onPrimaryPress,
  secondaryTitle = 'Reset',
  secondaryIcon,
  onSecondaryPress,
  style,
}) => {
  return (
    <View style={[styles.buttonRow, style]}>
      <PrimaryButton
        title={primaryTitle}
        icon={primaryIcon}
        onPress={onPrimaryPress}
        style={styles.calcButton}
      />

      <SecondaryButton
        title={secondaryTitle}
        icon={secondaryIcon}
        onPress={onSecondaryPress}
        style={styles.resetButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  calcButton: {
    flex: 2.2,
    marginRight: 8,
  },
  resetButton: {
    flex: 1,
  },
});

export default CalculatorActionBar;

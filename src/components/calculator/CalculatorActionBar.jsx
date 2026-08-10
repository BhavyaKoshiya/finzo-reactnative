import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';

export const CalculatorActionBar = ({
  primaryTitle = 'Calculate',
  primaryIcon,
  onPrimaryPress,
  secondaryTitle = 'Reset',
  secondaryIcon,
  onSecondaryPress,
  onSavePress,
  isSaveDisabled = false,
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

      {onSavePress && (
        <SecondaryButton
          title="Save"
          icon={Bookmark}
          onPress={onSavePress}
          disabled={isSaveDisabled}
          style={styles.saveButton}
        />
      )}
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
    marginRight: 6,
  },
  resetButton: {
    flex: 1,
    marginRight: 6,
  },
  saveButton: {
    flex: 1,
  },
});

export default CalculatorActionBar;

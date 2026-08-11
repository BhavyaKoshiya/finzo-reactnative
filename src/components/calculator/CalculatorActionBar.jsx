import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bookmark, Share2, FileText } from 'lucide-react-native';
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
  onSharePress,
  isShareDisabled = false,
  onPdfPress,
  isPdfDisabled = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
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

      {(onSavePress || onSharePress || onPdfPress) && (
        <View style={styles.bottomRow}>
          {onSavePress && (
            <SecondaryButton
              title="Save"
              icon={Bookmark}
              onPress={onSavePress}
              disabled={isSaveDisabled}
              style={styles.actionItem}
            />
          )}

          {onSharePress && (
            <SecondaryButton
              title="Share"
              icon={Share2}
              onPress={onSharePress}
              disabled={isShareDisabled}
              style={styles.actionItem}
            />
          )}

          {onPdfPress && (
            <SecondaryButton
              title="PDF"
              icon={FileText}
              onPress={onPdfPress}
              disabled={isPdfDisabled}
              style={styles.actionItem}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calcButton: {
    flex: 2.2,
    marginRight: 6,
  },
  resetButton: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  actionItem: {
    flex: 1,
  },
});

export default CalculatorActionBar;

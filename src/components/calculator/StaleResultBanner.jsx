import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const StaleResultBanner = ({ style }) => {
  const { currentTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: `${currentTheme.secondary}15`,
          borderColor: currentTheme.secondary,
        },
        style,
      ]}
    >
      <AppIcon icon={AlertCircle} size={18} color={currentTheme.secondary} style={styles.icon} />
      <AppText variant="caption" color={currentTheme.textPrimary} style={styles.text}>
        Inputs modified after calculation. Tap Calculate to update results.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontWeight: '500',
  },
});

export default StaleResultBanner;

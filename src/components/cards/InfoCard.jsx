import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from './AppCard';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const InfoCard = ({ title, message, icon, type = 'info', style, ...props }) => {
  const { currentTheme } = useAppTheme();

  const typeColors = {
    info: { bg: currentTheme.infoLight, border: currentTheme.info, text: currentTheme.info },
    success: { bg: currentTheme.successLight, border: currentTheme.success, text: currentTheme.success },
    warning: { bg: currentTheme.warningLight, border: currentTheme.warning, text: currentTheme.warning },
    error: { bg: currentTheme.errorLight, border: currentTheme.error, text: currentTheme.error },
  };

  const selected = typeColors[type] || typeColors.info;

  return (
    <AppCard
      style={[
        styles.card,
        { backgroundColor: selected.bg, borderColor: selected.border },
        style,
      ]}
      shadowOpacity={0.02}
      {...props}
    >
      <View style={styles.row}>
        {icon && (
          <View style={styles.iconBox}>
            <AppIcon icon={icon} size={20} color={selected.text} />
          </View>
        )}
        <View style={styles.content}>
          {title && (
            <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={styles.title}>
              {title}
            </AppText>
          )}
          {message && (
            <AppText variant="bodySmall" color={currentTheme.textSecondary}>
              {message}
            </AppText>
          )}
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
});

export default InfoCard;

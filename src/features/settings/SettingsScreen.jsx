import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Monitor, Code, ShieldCheck } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import AppHeader from '../../components/navigation/AppHeader';
import AppCard from '../../components/cards/AppCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';

export const SettingsScreen = ({ navigation }) => {
  const { currentTheme, themeMode, setThemeMode } = useAppTheme();

  const themeOptions = [
    { label: 'System Default', value: 'system', icon: Monitor },
    { label: 'Light Mode', value: 'light', icon: Sun },
    { label: 'Dark Mode', value: 'dark', icon: Moon },
  ];

  return (
    <View style={[styles.root, { backgroundColor: currentTheme.background }]}>
      <AppHeader title="Settings" subtitle="Preferences & App Information" />

      <ScreenContainer scrollable style={styles.container}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            Appearance
          </AppText>
          <AppCard style={styles.cardPadding}>
            <AppText variant="bodyMedium" style={styles.labelMargin}>
              Theme Preference
            </AppText>
            <View style={styles.themeOptionsRow}>
              {themeOptions.map((opt) => {
                const isSelected = themeMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setThemeMode(opt.value)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Set theme to ${opt.label}`}
                    style={[
                      styles.themeOptionButton,
                      {
                        backgroundColor: isSelected
                          ? currentTheme.primary
                          : currentTheme.surface,
                        borderColor: isSelected
                          ? currentTheme.primary
                          : currentTheme.border,
                      },
                    ]}
                  >
                    <AppIcon
                      icon={opt.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : currentTheme.textSecondary}
                    />
                    <AppText
                      variant="caption"
                      color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                      style={styles.optionText}
                    >
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Privacy & App Info Section */}
        <View style={styles.section}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            About Finzo
          </AppText>
          <AppCard style={styles.cardPadding}>
            <View style={styles.infoRow}>
              <AppIcon icon={ShieldCheck} size={20} color={currentTheme.success} />
              <View style={styles.infoTextGroup}>
                <AppText variant="bodyMedium">100% Privacy Preserved</AppText>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Finzo operates completely offline with zero tracking or data collection.
                </AppText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            <View style={styles.versionRow}>
              <AppText variant="bodySmall" color={currentTheme.textSecondary}>
                App Version
              </AppText>
              <AppText variant="bodySmall" color={currentTheme.textPrimary}>
                0.0.1 (Phase 2 Shell)
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* Dev Component Showcase (Development only) */}
        {__DEV__ && (
          <View style={styles.section}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Developer Tools
            </AppText>
            <AppCard style={styles.cardPadding}>
              <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.labelMargin}>
                Phase 1 Component Library Showcase
              </AppText>
              <PrimaryButton
                title="Launch Component Showcase"
                icon={Code}
                onPress={() => navigation.navigate(ROUTES.SHOWCASE)}
              />
            </AppCard>
          </View>
        )}
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  cardPadding: {
    padding: 16,
  },
  labelMargin: {
    marginBottom: 12,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOptionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justify: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    marginTop: 6,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default SettingsScreen;

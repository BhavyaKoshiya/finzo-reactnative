import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon, Monitor, Code, ShieldCheck } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import AppCard from '../../components/cards/AppCard';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';

export const SettingsScreen = ({ navigation }) => {
  const { currentTheme, themeMode, setThemeMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const themeOptions = [
    { label: 'System Default', value: 'system', icon: Monitor },
    { label: 'Light Mode', value: 'light', icon: Sun },
    { label: 'Dark Mode', value: 'dark', icon: Moon },
  ];

  const renderHeader = () => (
    <View style={[styles.headerGroup, { paddingTop: Math.max(insets.top + 12, 24) }]}>
      <AppText variant="screenTitle">Settings</AppText>
      <AppText variant="bodySmall" color={currentTheme.textSecondary}>
        Preferences & app details.
      </AppText>
    </View>
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
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
                      backgroundColor: isSelected ? `${currentTheme.primary}1A` : currentTheme.surface,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                    },
                  ]}
                >
                  <AppIcon
                    icon={opt.icon}
                    size={20}
                    color={isSelected ? currentTheme.primary : currentTheme.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    color={isSelected ? currentTheme.primary : currentTheme.textSecondary}
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

      {/* Component Showcase Entry */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Design System & Developer Tools
        </AppText>
        <AppCard style={styles.cardPadding}>
          <View style={styles.infoRow}>
            <AppIcon icon={Code} size={22} color={currentTheme.primary} />
            <View style={styles.infoTextGroup}>
              <AppText variant="bodyMedium">Component Showcase</AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Preview all core UI tokens, buttons, inputs, cards, and modal dialogs.
              </AppText>
            </View>
          </View>
          <PrimaryButton
            title="Open Component Showcase"
            onPress={() => navigation.navigate(ROUTES.COMPONENT_SHOWCASE)}
            style={{ marginTop: 12 }}
          />
        </AppCard>
      </View>

      {/* Privacy & App Info Section */}
      <View style={styles.lastSection}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Privacy & App Info
        </AppText>
        <AppCard style={styles.cardPadding}>
          <View style={styles.infoRow}>
            <AppIcon icon={ShieldCheck} size={22} color={currentTheme.success} />
            <View style={styles.infoTextGroup}>
              <AppText variant="bodyMedium">100% Offline & Private</AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Finzo stores all financial snapshots locally on your device. No cloud sync, no tracking.
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

          <View style={styles.versionRow}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Finzo App Version
            </AppText>
            <AppText variant="caption" color={currentTheme.textPrimary} style={{ fontWeight: '600' }}>
              v1.0.0 (Offline MVP)
            </AppText>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  headerGroup: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 8,
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
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
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

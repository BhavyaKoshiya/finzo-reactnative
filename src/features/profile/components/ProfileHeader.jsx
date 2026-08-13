import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserRound } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ProfileHeader = () => {
  const { currentTheme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const avatarBg = isDark ? 'rgba(59, 130, 246, 0.22)' : currentTheme.primaryLight;
  const avatarIconColor = isDark ? '#60A5FA' : currentTheme.primary;

  return (
    <View style={[styles.headerGroup, { paddingTop: Math.max(insets.top + 12, 24), backgroundColor: currentTheme.background }]}>
      <View style={styles.topRow}>
        <View style={styles.textGroup}>
          <AppText variant="screenTitle">Profile</AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.subtitle}>
            Finzo Member
          </AppText>
        </View>
        <View style={[styles.avatarBox, { backgroundColor: avatarBg }]}>
          <AppIcon icon={UserRound} size={28} color={avatarIconColor} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerGroup: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    marginTop: 2,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileHeader;

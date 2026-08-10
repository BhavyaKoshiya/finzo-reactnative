import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import EmptyState from '../../components/feedback/EmptyState';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SavedScreen = () => {
  const { currentTheme } = useAppTheme();

  return (
    <ScreenContainer
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      <View style={styles.headerGroup}>
        <AppText variant="screenTitle">Saved Calculations</AppText>
        <AppText variant="bodySmall" color={currentTheme.textSecondary}>
          Your bookmarked and saved calculation records.
        </AppText>
      </View>

      <View style={styles.emptyContainer}>
        <EmptyState
          title="No saved calculations"
          description="Calculations you save in future will appear here for quick access."
          icon={Bookmark}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  headerGroup: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});

export default SavedScreen;

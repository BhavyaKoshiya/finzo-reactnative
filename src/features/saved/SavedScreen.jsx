import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppHeader from '../../components/navigation/AppHeader';
import EmptyState from '../../components/feedback/EmptyState';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SavedScreen = () => {
  const { currentTheme } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: currentTheme.background }]}>
      <AppHeader title="Saved" subtitle="Your saved calculation records" />

      <ScreenContainer style={styles.container}>
        <EmptyState
          title="No saved calculations"
          description="Calculations you save in future will appear here for quick access."
          icon={Bookmark}
        />
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});

export default SavedScreen;

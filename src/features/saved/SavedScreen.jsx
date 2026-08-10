import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Bookmark, Star } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppHeader from '../../components/navigation/AppHeader';
import AppText from '../../components/common/AppText';
import EmptyState from '../../components/feedback/EmptyState';
import SavedCalculationCard from './components/SavedCalculationCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getCalculatorById } from '../../calculators';

import {
  selectSavedCalculations,
  toggleFavorite,
  deleteSavedCalculation,
} from '../../store/slices/savedCalculationsSlice';

export const SavedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites'

  const savedCalculations = useSelector(selectSavedCalculations);

  const filteredItems = filterMode === 'favorites'
    ? savedCalculations.filter((item) => item.isFavorite)
    : savedCalculations;

  const handleOpenSavedItem = (item) => {
    const calcMetadata = getCalculatorById(item.calculatorId);
    if (!calcMetadata || !calcMetadata.route) {
      Alert.alert(
        'Calculator Unavailable',
        'This calculator is no longer available in the app catalog.',
      );
      return;
    }
    navigation.navigate(calcMetadata.route, {
      savedCalculation: item,
    });
  };

  const handleToggleFavorite = (id) => {
    dispatch(toggleFavorite(id));
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Calculation?',
      `"${item.title || 'Calculation'}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteSavedCalculation(item.id)),
        },
      ],
    );
  };

  const renderHeader = () => (
    <View
      style={[
        styles.headerWrapper,
        {
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.border,
        },
      ]}
    >
      <AppHeader
        title="Saved Calculations"
        subtitle="Bookmarked snapshots & quick restore"
        style={styles.headerNoBorder}
      />
      {savedCalculations.length > 0 && (
        <View style={styles.segmentRow}>
          <TouchableOpacity
            onPress={() => setFilterMode('all')}
            activeOpacity={0.7}
            style={[
              styles.segmentChip,
              {
                backgroundColor: filterMode === 'all' ? currentTheme.primary : currentTheme.surface,
                borderColor: filterMode === 'all' ? currentTheme.primary : currentTheme.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              color={filterMode === 'all' ? '#FFFFFF' : currentTheme.textPrimary}
              style={styles.segmentText}
            >
              All ({savedCalculations.length})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterMode('favorites')}
            activeOpacity={0.7}
            style={[
              styles.segmentChip,
              {
                backgroundColor: filterMode === 'favorites' ? currentTheme.primary : currentTheme.surface,
                borderColor: filterMode === 'favorites' ? currentTheme.primary : currentTheme.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              color={filterMode === 'favorites' ? '#FFFFFF' : currentTheme.textPrimary}
              style={styles.segmentText}
            >
              Favorites ({savedCalculations.filter((i) => i.isFavorite).length})
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      paddingHorizontal={0}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title={filterMode === 'favorites' ? 'No favorite calculations' : 'No saved calculations'}
            description={
              filterMode === 'favorites'
                ? 'Star a saved calculation to pin it to your favorites list.'
                : 'Save calculations from any tool to quickly return to them later.'
            }
            icon={filterMode === 'favorites' ? Star : Bookmark}
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SavedCalculationCard
              item={item}
              onPress={() => handleOpenSavedItem(item)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteItem}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  headerWrapper: {
    borderBottomWidth: 1,
  },
  headerNoBorder: {
    borderBottomWidth: 0,
  },
  segmentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  segmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  segmentText: {
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});

export default SavedScreen;

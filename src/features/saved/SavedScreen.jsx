import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Star } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
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

import {
  getExportModelForCalculator,
  shareCalculationText,
  generateCalculationPdf,
  shareCalculationPdfFile,
  ExportPdfModal,
} from '../share';

export const SavedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites'

  const [selectedSavedItemForPdf, setSelectedSavedItemForPdf] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleShareSavedItem = async (item) => {
    try {
      const exportModel = getExportModelForCalculator(
        item.calculatorId,
        item.inputs,
        item.result,
        { customTitle: item.title, date: item.savedAt || item.updatedAt }
      );
      await shareCalculationText(exportModel);
    } catch (err) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const handlePdfSavedItem = (item) => {
    setSelectedSavedItemForPdf(item);
    setPdfModalVisible(true);
  };

  const handlePdfExportConfirm = async (mode) => {
    if (!selectedSavedItemForPdf) return;
    setIsGeneratingPdf(true);
    const targetItem = selectedSavedItemForPdf;
    try {
      const exportModel = getExportModelForCalculator(
        targetItem.calculatorId,
        targetItem.inputs,
        targetItem.result,
        {
          customTitle: targetItem.title,
          date: targetItem.savedAt || targetItem.updatedAt,
          mode,
        }
      );
      const pdfPath = await generateCalculationPdf({ exportModel, mode });
      setPdfModalVisible(false);
      setIsGeneratingPdf(false);
      setSelectedSavedItemForPdf(null);

      setTimeout(async () => {
        try {
          await shareCalculationPdfFile(pdfPath, exportModel.title);
        } catch (err) {
          Alert.alert('Share PDF Failed', err.message);
        }
      }, 350);
    } catch (err) {
      setIsGeneratingPdf(false);
      Alert.alert('PDF Export Failed', err.message);
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerGroup, { paddingTop: Math.max(insets.top + 12, 24) }]}>
      <AppText variant="screenTitle">Saved Calculations</AppText>
      <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.subtitleMargin}>
        Bookmarked snapshots & quick restore
      </AppText>

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
              onShare={handleShareSavedItem}
              onPdf={handlePdfSavedItem}
            />
          )}
        />
      )}

      <ExportPdfModal
        visible={pdfModalVisible}
        isGenerating={isGeneratingPdf}
        onClose={() => {
          setPdfModalVisible(false);
          setSelectedSavedItemForPdf(null);
        }}
        onExport={handlePdfExportConfirm}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  headerGroup: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subtitleMargin: {
    marginTop: 2,
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
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
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default SavedScreen;

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import SavedCalculationCard from '../saved/components/SavedCalculationCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';
import { getPopularCalculators, getCalculatorCategories, getCalculatorById } from '../../calculators';
import {
  selectSavedCalculations,
  toggleFavorite,
  deleteSavedCalculation,
} from '../../store/slices/savedCalculationsSlice';

export const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const popularCalculators = getPopularCalculators();
  const categories = getCalculatorCategories();
  const savedCalculations = useSelector(selectSavedCalculations);
  const recentSavedCalculations = savedCalculations.slice(0, 3);

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

  const handleDeleteSavedItem = (item) => {
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
    <View style={[styles.heroSection, { paddingTop: Math.max(insets.top, 8), backgroundColor: currentTheme.background }]}>
      <AppText variant="caption" color={currentTheme.primary} style={styles.brandTitle}>
        FINZO
      </AppText>
      <AppText variant="screenTitle" style={styles.greetingTitle}>
        Good day
      </AppText>
      <AppText variant="bodySmall" color={currentTheme.textSecondary}>
        What would you like to calculate today?
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
      {/* Prominent Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate(ROUTES.CALCULATOR_SEARCH)}
        accessibilityRole="search"
        accessibilityLabel="Search calculators"
        style={[
          styles.searchBar,
          { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
        ]}
      >
        <AppIcon icon={Search} size={20} color={currentTheme.textMuted} style={styles.searchIcon} />
        <AppText variant="bodySmall" color={currentTheme.textMuted}>
          Search calculators (EMI, SIP, GST, FD...)
        </AppText>
      </TouchableOpacity>

      {/* Recently Saved Section (Shown only if saved calculations exist) */}
      {recentSavedCalculations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="sectionTitle">Recently Saved</AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.SAVED)}
              activeOpacity={0.7}
              style={styles.viewAllRow}
            >
              <AppText variant="caption" color={currentTheme.primary} style={styles.viewAllText}>
                View All ({savedCalculations.length})
              </AppText>
              <AppIcon icon={ChevronRight} size={16} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>

          {recentSavedCalculations.map((item) => (
            <SavedCalculationCard
              key={item.id}
              item={item}
              onPress={() => handleOpenSavedItem(item)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteSavedItem}
            />
          ))}
        </View>
      )}

      {/* Popular Calculators Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Popular Calculators
        </AppText>
        {popularCalculators.map((calc) => (
          <CalculatorCard
            key={calc.id}
            title={calc.name}
            description={calc.description}
            icon={calc.icon}
            status={calc.status}
            onPress={
              calc.route ? () => navigation.navigate(calc.route) : null
            }
            style={styles.cardMargin}
          />
        ))}
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Explore Categories
        </AppText>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              variant="grid"
              title={cat.name}
              count={cat.count}
              icon={cat.icon}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  brandTitle: {
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  greetingTitle: {
    marginBottom: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontWeight: '600',
    marginRight: 2,
  },
  cardMargin: {
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 12,
  },
});

export default HomeScreen;

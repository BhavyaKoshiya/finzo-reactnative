import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import CalculatorCard from '../../components/cards/CalculatorCard';
import InfoCard from '../../components/cards/InfoCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getCalculatorCategories } from '../../calculators';
import { ROUTES } from '../../navigation/routes';

export const CalculatorsScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const categories = getCalculatorCategories();

  const renderHeader = () => (
    <View style={[styles.headerGroup, { paddingTop: Math.max(insets.top + 12, 24), backgroundColor: currentTheme.background }]}>
      <AppText variant="screenTitle">Calculators</AppText>
      <AppText variant="bodySmall" color={currentTheme.textSecondary}>
        Select a category to explore available financial tools.
      </AppText>
    </View>
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      contentContainerStyle={{ paddingBottom: 0 }}
      style={styles.container}
    >
      {/* Search Bar Entry */}
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

      {/* Category Groups & Calculators */}
      {categories.map((cat, idx) => {
        const isLast = idx === categories.length - 1;
        return (
          <View key={cat.id} style={[styles.categorySection, isLast && styles.lastCategorySection]}>
            <AppText variant="sectionTitle" style={styles.categoryTitle}>
              {cat.name}
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.categoryDesc}>
              {cat.description}
            </AppText>

            <View style={styles.calculatorList}>
              {cat.calculators.map((calc) => (
                <CalculatorCard
                  key={calc.id}
                  title={calc.name}
                  description={calc.description}
                  icon={calc.icon}
                  status={calc.status}
                  badgeText={calc.badgeText}
                  onPress={
                    calc.route ? () => navigation.navigate(calc.route) : null
                  }
                  style={styles.calcCardMargin}
                />
              ))}
            </View>
          </View>
        );
      })}

      {/* Info Card Banner */}
      <InfoCard
        type="info"
        title="More Calculators Coming Soon"
        message="We are working on adding RD, CAGR, Tax, and Goal planners in upcoming updates."
        style={styles.infoCard}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGroup: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  categorySection: {
    marginTop: 8,
    marginBottom: 16,
  },
  lastCategorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    marginBottom: 2,
  },
  categoryDesc: {
    marginBottom: 12,
  },
  calculatorList: {
    marginTop: 4,
  },
  calcCardMargin: {
    marginBottom: 10,
  },
  infoCard: {
    marginTop: 8,
    marginBottom: 8,
  },
});

export default CalculatorsScreen;

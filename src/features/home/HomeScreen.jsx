import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';
import { getPopularCalculators, getCalculatorCategories } from '../../calculators';

export const HomeScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  const popularCalculators = getPopularCalculators();
  const categories = getCalculatorCategories();

  return (
    <ScreenContainer
      scrollable
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Hero Greeting Section */}
      <View style={styles.heroSection}>
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

      {/* Search Placeholder */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
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
    paddingTop: 8,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
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

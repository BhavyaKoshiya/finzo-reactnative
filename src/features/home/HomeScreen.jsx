import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calculator, TrendingUp, Briefcase, Calendar, Search } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';

export const HomeScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  const renderHeader = () => (
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
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
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
        <CalculatorCard
          title="Home Loan EMI"
          description="Calculate monthly installments & interest split"
          icon={Calculator}
          onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
          style={styles.cardMargin}
        />
        <CalculatorCard
          title="SIP Investment"
          description="Project wealth growth from regular SIPs"
          icon={TrendingUp}
          onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
          style={styles.cardMargin}
        />
        <CalculatorCard
          title="Fixed Deposit (FD)"
          description="Calculate maturity value with compound interest"
          icon={Briefcase}
          onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
          style={styles.cardMargin}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Explore Categories
        </AppText>
        <View style={styles.categoryGrid}>
          <CategoryCard
            variant="grid"
            title="Loans"
            count={4}
            icon={Calculator}
            onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
            style={styles.gridCard}
          />
          <CategoryCard
            variant="grid"
            title="Investments"
            count={5}
            icon={TrendingUp}
            onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
            style={styles.gridCard}
          />
          <CategoryCard
            variant="grid"
            title="Business"
            count={3}
            icon={Briefcase}
            onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
            style={styles.gridCard}
          />
          <CategoryCard
            variant="grid"
            title="Everyday"
            count={3}
            icon={Calendar}
            onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
            style={styles.gridCard}
          />
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
    paddingBottom: 12,
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
    marginTop: 4,
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

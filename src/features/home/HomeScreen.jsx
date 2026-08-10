import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calculator, TrendingUp, Briefcase, Calendar, Search } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import AppHeader from '../../components/navigation/AppHeader';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';

export const HomeScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: currentTheme.background }]}>
      <AppHeader
        title="Finzo"
        subtitle="Financial Planning & Calculators"
      />

      <ScreenContainer scrollable style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <AppText variant="screenTitle">Good day</AppText>
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
              title="Loans"
              count={4}
              icon={Calculator}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
            <CategoryCard
              title="Investments"
              count={5}
              icon={TrendingUp}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
            <CategoryCard
              title="Business"
              count={3}
              icon={Briefcase}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
            <CategoryCard
              title="Everyday"
              count={3}
              icon={Calendar}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingBottom: 24,
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

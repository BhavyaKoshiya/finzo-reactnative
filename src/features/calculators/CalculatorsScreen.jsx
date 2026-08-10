import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calculator, TrendingUp, Briefcase, Calendar } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppHeader from '../../components/navigation/AppHeader';
import CategoryCard from '../../components/cards/CategoryCard';
import InfoCard from '../../components/cards/InfoCard';
import { useAppTheme } from '../../hooks/useAppTheme';

export const CalculatorsScreen = () => {
  const { currentTheme } = useAppTheme();

  const categories = [
    { id: 'loans', title: 'Loans', count: 4, icon: Calculator, desc: 'EMI, Prepayment, Comparison, Tenure' },
    { id: 'investments', title: 'Investments', count: 5, icon: TrendingUp, desc: 'SIP, Lumpsum, FD, RD, PPF' },
    { id: 'business', title: 'Business', count: 3, icon: Briefcase, desc: 'GST, Profit Margin, Break-even' },
    { id: 'everyday', title: 'Everyday', count: 3, icon: Calendar, desc: 'Inflation, Simple & Compound Interest' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: currentTheme.background }]}>
      <AppHeader title="Calculators" subtitle="Browse all financial tools" />

      <ScreenContainer scrollable style={styles.container}>
        <View style={styles.headerGroup}>
          <AppText variant="screenTitle">Calculator Categories</AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary}>
            Select a category to view available calculators.
          </AppText>
        </View>

        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <CategoryCard
              title={cat.title}
              count={cat.count}
              icon={cat.icon}
              onPress={() => {}}
            />
            <AppText variant="caption" color={currentTheme.textMuted} style={styles.desc}>
              Includes: {cat.desc}
            </AppText>
          </View>
        ))}

        <InfoCard
          title="Offline First"
          message="All calculators perform 100% offline calculations on your device."
          type="info"
          style={styles.infoCard}
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
    paddingBottom: 24,
  },
  headerGroup: {
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 16,
  },
  desc: {
    marginTop: 6,
    marginLeft: 4,
  },
  infoCard: {
    marginTop: 12,
  },
});

export default CalculatorsScreen;

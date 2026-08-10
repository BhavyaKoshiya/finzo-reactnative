import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calculator, TrendingUp, Briefcase, Calendar } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
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

  const renderHeader = () => (
    <View style={styles.headerGroup}>
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
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Category List */}
      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <CategoryCard
              variant="row"
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
      </View>

      <InfoCard
        title="100% Offline Calculations"
        message="All calculation formulas execute locally on your device with complete privacy."
        type="info"
        style={styles.infoCard}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  headerGroup: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  list: {
    marginTop: 4,
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 16,
  },
  desc: {
    marginTop: 6,
    marginLeft: 4,
  },
  infoCard: {
    marginTop: 8,
  },
});

export default CalculatorsScreen;

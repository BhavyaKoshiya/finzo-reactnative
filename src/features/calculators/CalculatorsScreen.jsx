import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calculator, TrendingUp, Briefcase, Calendar } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import CategoryCard from '../../components/cards/CategoryCard';
import InfoCard from '../../components/cards/InfoCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';

export const CalculatorsScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();

  const categories = [
    { id: 'loans', title: 'Loans', count: 4, icon: Calculator, desc: 'EMI, Prepayment, Comparison, Tenure', route: ROUTES.EMI_CALCULATOR },
    { id: 'investments', title: 'Investments', count: 5, icon: TrendingUp, desc: 'SIP, Lumpsum, FD, RD, PPF', route: null },
    { id: 'business', title: 'Business', count: 3, icon: Briefcase, desc: 'GST, Profit Margin, Break-even', route: null },
    { id: 'everyday', title: 'Everyday', count: 3, icon: Calendar, desc: 'Inflation, Simple & Compound Interest', route: null },
  ];

  return (
    <ScreenContainer
      scrollable
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Header Title Section */}
      <View style={styles.headerGroup}>
        <AppText variant="screenTitle">Calculators</AppText>
        <AppText variant="bodySmall" color={currentTheme.textSecondary}>
          Select a category to explore available financial tools.
        </AppText>
      </View>

      {/* Category List */}
      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <CategoryCard
              variant="row"
              title={cat.title}
              count={cat.count}
              icon={cat.icon}
              onPress={() => {
                if (cat.route) {
                  navigation.navigate(cat.route);
                }
              }}
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
    paddingBottom: 16,
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

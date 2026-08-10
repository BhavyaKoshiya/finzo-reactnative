import React from 'react';
import { View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import CalculatorCard from '../../components/cards/CalculatorCard';
import InfoCard from '../../components/cards/InfoCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getCalculatorCategories } from '../../calculators';

export const CalculatorsScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();
  const categories = getCalculatorCategories();

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

      {/* Category Groups & Calculators */}
      {categories.map((cat) => (
        <View key={cat.id} style={styles.categorySection}>
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
                onPress={
                  calc.route ? () => navigation.navigate(calc.route) : null
                }
                style={styles.calcCardMargin}
              />
            ))}
          </View>
        </View>
      ))}

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
  categorySection: {
    marginBottom: 20,
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
  },
});

export default CalculatorsScreen;

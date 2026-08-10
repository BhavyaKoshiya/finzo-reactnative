import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';

import { useROICalculator } from './hooks/useROICalculator';
import ROIResultCard from './components/ROIResultCard';

export const ROICalculatorScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    initialInvestment,
    setInitialInvestment,
    finalValue,
    setFinalValue,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  } = useROICalculator();

  const onCalculatePress = () => {
    const success = handleCalculate();
    if (success) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: resultsYRef.current > 0 ? Math.max(resultsYRef.current - 12, 0) : 280,
          animated: true,
        });
      }, 60);
    }
  };

  const renderHeader = () => (
    <AppHeader
      title="ROI Calculator"
      subtitle="Return on Investment"
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
    />
  );

  return (
    <ScreenContainer
      scrollable
      scrollViewRef={scrollViewRef}
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      <CalculatorInputSection
        title="Investment Values"
        subtitle="Enter initial cost and final value returned"
      >
        <MoneyInput
          label="Initial Investment (Cost)"
          value={initialInvestment}
          onChangeText={setInitialInvestment}
          error={fieldErrors.initialInvestment}
        />

        <MoneyInput
          label="Final Value Returned"
          value={finalValue}
          onChangeText={setFinalValue}
          error={fieldErrors.finalValue}
        />

        <CalculatorActionBar
          primaryTitle="Calculate ROI"
          onPrimaryPress={onCalculatePress}
          secondaryTitle="Reset"
          onSecondaryPress={handleReset}
        />
      </CalculatorInputSection>

      {isCalculated && result && (
        <View
          onLayout={(e) => {
            resultsYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <CalculatorResultSection title="Percentage Return Result">
            <ROIResultCard result={result} style={styles.cardMargin} />
          </CalculatorResultSection>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  cardMargin: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ROICalculatorScreen;

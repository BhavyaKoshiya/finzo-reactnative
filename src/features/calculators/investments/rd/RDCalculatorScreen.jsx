import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import PercentageInput from '../../../../components/forms/PercentageInput';
import DurationInput from '../../../../components/forms/DurationInput';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';

import { useRDCalculator } from './hooks/useRDCalculator';
import RDResultCard from './components/RDResultCard';
import RDBreakdownChart from './components/RDBreakdownChart';

export const RDCalculatorScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    monthlyDeposit,
    setMonthlyDeposit,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  } = useRDCalculator();

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
      title="RD Calculator"
      subtitle="Recurring Deposit Payout"
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
        title="RD Details"
        subtitle="Calculated using standard quarterly compounding model"
      >
        <MoneyInput
          label="Monthly Deposit"
          value={monthlyDeposit}
          onChangeText={setMonthlyDeposit}
          error={fieldErrors.monthlyDeposit}
        />

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={annualInterestRate}
          onChangeText={setAnnualInterestRate}
          error={fieldErrors.annualInterestRate}
        />

        <DurationInput
          label="Deposit Tenure"
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureMonths}
        />

        <CalculatorActionBar
          primaryTitle="Calculate RD"
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
          <CalculatorResultSection title="RD Maturity Summary">
            <RDResultCard result={result} style={styles.cardMargin} />
            <RDBreakdownChart result={result} style={styles.cardMargin} />
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

export default RDCalculatorScreen;

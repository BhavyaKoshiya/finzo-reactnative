import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import MoneyInput from '../../../components/forms/MoneyInput';
import PercentageInput from '../../../components/forms/PercentageInput';
import DurationInput from '../../../components/forms/DurationInput';
import CalculatorInputSection from '../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../components/calculator/CalculatorActionBar';

import { useLoanCalculator } from './hooks/useLoanCalculator';
import EMIResultCard from '../emi/components/EMIResultCard';
import EMIBreakdownChart from '../emi/components/EMIBreakdownChart';
import AmortizationSection from '../emi/components/AmortizationSection';

export const LoanCalculatorScreen = ({ config, navigation }) => {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    fieldErrors,
    result,
    amortizationSchedule,
    isCalculated,
    isAmortizationExpanded,
    setIsAmortizationExpanded,
    scheduleViewMode,
    setScheduleViewMode,
    handleCalculate,
    handleReset,
  } = useLoanCalculator(config);

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
      title={config.title}
      subtitle={config.subtitle}
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
      {/* Loan Input Section */}
      <CalculatorInputSection
        title={`${config.title} Inputs`}
        subtitle="Adjust loan details to estimate your monthly EMI"
      >
        <MoneyInput
          label={config.amountLabel || 'Loan Amount'}
          value={loanAmount}
          onChangeText={setLoanAmount}
          error={fieldErrors.loanAmount}
        />

        <PercentageInput
          label={config.rateLabel || 'Interest Rate (% p.a.)'}
          value={interestRate}
          onChangeText={setInterestRate}
          error={fieldErrors.interestRate}
        />

        <DurationInput
          label={config.tenureLabel || 'Loan Tenure'}
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureMonths}
        />

        <CalculatorActionBar
          primaryTitle="Calculate EMI"
          onPrimaryPress={onCalculatePress}
          secondaryTitle="Reset"
          onSecondaryPress={handleReset}
        />
      </CalculatorInputSection>

      {/* Results Section */}
      {isCalculated && result && (
        <View
          onLayout={(e) => {
            resultsYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <CalculatorResultSection title="Calculation Results">
            <EMIResultCard result={result} style={styles.cardMargin} />

            <EMIBreakdownChart result={result} style={styles.cardMargin} />

            <AmortizationSection
              schedule={amortizationSchedule}
              isExpanded={isAmortizationExpanded}
              onToggleExpand={() => setIsAmortizationExpanded(!isAmortizationExpanded)}
              viewMode={scheduleViewMode}
              onToggleViewMode={setScheduleViewMode}
              onViewModeChange={setScheduleViewMode}
              style={styles.cardMargin}
            />
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

export default LoanCalculatorScreen;

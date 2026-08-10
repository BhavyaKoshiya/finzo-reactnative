import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calculator, RotateCcw, ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import MoneyInput from '../../../components/forms/MoneyInput';
import PercentageInput from '../../../components/forms/PercentageInput';
import DurationInput from '../../../components/forms/DurationInput';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';

import useEMICalculator from './hooks/useEMICalculator';
import EMIResultCard from './components/EMIResultCard';
import EMIBreakdownChart from './components/EMIBreakdownChart';
import AmortizationSection from './components/AmortizationSection';

export const EMICalculatorScreen = ({ navigation }) => {
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
  } = useEMICalculator();

  const renderHeader = () => (
    <AppHeader
      title="EMI Calculator"
      subtitle="Home, Personal & Auto Loans"
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back to previous screen',
      }}
    />
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={true}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Input Section */}
      <View style={styles.formSection}>
        <MoneyInput
          label="Loan Amount"
          value={loanAmount}
          onChangeValue={setLoanAmount}
          error={fieldErrors.principal || fieldErrors.loanAmount}
          placeholder="e.g. 10,00,000"
          style={styles.inputSpacing}
        />

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={interestRate}
          onChangeValue={setInterestRate}
          error={fieldErrors.annualInterestRate || fieldErrors.interestRate}
          placeholder="e.g. 8.5"
          style={styles.inputSpacing}
        />

        <DurationInput
          label="Loan Tenure"
          value={tenureValue}
          onChangeValue={setTenureValue}
          unit={tenureUnit}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureMonths}
          style={styles.inputSpacing}
        />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Calculate EMI"
            icon={Calculator}
            onPress={() => handleCalculate()}
            style={styles.calcButton}
          />

          <SecondaryButton
            title="Reset"
            icon={RotateCcw}
            onPress={() => handleReset()}
            style={styles.resetButton}
          />
        </View>
      </View>

      {/* Results Section */}
      {isCalculated && result && (
        <View style={styles.resultsSection}>
          <View style={styles.divider} />
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            Calculation Results
          </AppText>

          <EMIResultCard result={result} style={styles.resultCardMargin} />

          <EMIBreakdownChart result={result} style={styles.chartMargin} />

          <AmortizationSection
            schedule={amortizationSchedule}
            isExpanded={isAmortizationExpanded}
            onToggleExpand={() => setIsAmortizationExpanded((prev) => !prev)}
            viewMode={scheduleViewMode}
            onToggleViewMode={setScheduleViewMode}
            style={styles.amortizationMargin}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  formSection: {
    marginBottom: 8,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  calcButton: {
    flex: 2,
    marginRight: 8,
  },
  resetButton: {
    flex: 1,
  },
  resultsSection: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  resultCardMargin: {
    marginBottom: 16,
  },
  chartMargin: {
    marginBottom: 16,
  },
  amortizationMargin: {
    marginBottom: 16,
  },
});

export default EMICalculatorScreen;

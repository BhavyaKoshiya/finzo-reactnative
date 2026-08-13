import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import MoneyInput from '../../../components/forms/MoneyInput';
import PercentageInput from '../../../components/forms/PercentageInput';
import DurationInput from '../../../components/forms/DurationInput';
import CalculatorInputSection from '../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../components/calculator/CalculatorActionBar';
import StaleResultBanner from '../../../components/calculator/StaleResultBanner';
import SaveModal from '../../../components/modals/SaveModal';

import { useEMICalculator } from './hooks/useEMICalculator';
import EMIResultCard from './components/EMIResultCard';
import EMIBreakdownChart from './components/EMIBreakdownChart';
import AmortizationSection from './components/AmortizationSection';

import { createCalculationSnapshot } from '../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../store/slices/savedCalculationsSlice';
import AdPlacement from '../../../components/ads/AdPlacement';
import { AD_PLACEMENTS } from '../../../services/ads/adPlacementConstants';

export const EMICalculatorScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const restoredInputs = route?.params?.savedCalculation
    ? restoreSavedCalculationInputs(route.params.savedCalculation)
    : {};

  const {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    editingSavedCalculationId,
    savedTitle,
    fieldErrors,
    result,
    amortizationSchedule,
    isCalculated,
    isResultStale,
    isAmortizationExpanded,
    setIsAmortizationExpanded,
    scheduleViewMode,
    setScheduleViewMode,
    handleCalculate,
    handleReset,
  } = useEMICalculator(restoredInputs);

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

  const onSaveConfirm = ({ title, saveMode }) => {
    setSaveModalVisible(false);
    if (saveMode === 'update' && editingSavedCalculationId) {
      dispatch(
        updateSavedCalculation({
          id: editingSavedCalculationId,
          title,
          inputs: { loanAmount, interestRate, tenureValue, tenureUnit },
          result,
        }),
      );
      Alert.alert('Saved', 'Calculation updated successfully!');
    } else {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'home-loan-emi',
        title,
        inputs: { loanAmount, interestRate, tenureValue, tenureUnit },
        result,
      });
      dispatch(addSavedCalculation(snapshot));
      Alert.alert('Saved', 'Calculation saved successfully!');
    }
  };

  const renderHeader = () => (
    <AppHeader
      title="Home Loan EMI Calculator"
      subtitle="Estimate monthly EMI payments, total interest & schedule"
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
        title="Loan Inputs"
        subtitle="Adjust amount, interest rate & tenure to calculate EMI"
      >
        <MoneyInput
          label="Loan Amount"
          value={loanAmount}
          onChangeText={setLoanAmount}
          error={fieldErrors.loanAmount}
        />

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={interestRate}
          onChangeText={setInterestRate}
          error={fieldErrors.interestRate}
        />

        <DurationInput
          label="Loan Tenure"
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
          onSavePress={() => setSaveModalVisible(true)}
          isSaveDisabled={!isCalculated || isResultStale}
        />
      </CalculatorInputSection>

      {isCalculated && result && (
        <View
          onLayout={(e) => {
            resultsYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <CalculatorResultSection title="Calculation Results">
            {isResultStale && <StaleResultBanner style={styles.cardMargin} />}

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

            <AdPlacement
              screen="calculators"
              placementId={AD_PLACEMENTS.CALCULATOR_BANNER}
              adType="banner"
              style={{ marginTop: 12 }}
            />
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle="Home Loan EMI"
        isEditing={Boolean(editingSavedCalculationId)}
        existingTitle={savedTitle}
        onClose={() => setSaveModalVisible(false)}
        onSave={onSaveConfirm}
      />

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

export default EMICalculatorScreen;

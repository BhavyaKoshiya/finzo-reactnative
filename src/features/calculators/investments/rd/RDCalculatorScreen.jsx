import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import PercentageInput from '../../../../components/forms/PercentageInput';
import DurationInput from '../../../../components/forms/DurationInput';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';
import StaleResultBanner from '../../../../components/calculator/StaleResultBanner';
import SaveModal from '../../../../components/modals/SaveModal';

import { useRDCalculator } from './hooks/useRDCalculator';
import RDResultCard from './components/RDResultCard';
import RDBreakdownChart from './components/RDBreakdownChart';

import { createCalculationSnapshot } from '../../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../../store/slices/savedCalculationsSlice';

export const RDCalculatorScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const restoredInputs = route?.params?.savedCalculation
    ? restoreSavedCalculationInputs(route.params.savedCalculation)
    : {};

  const {
    monthlyDeposit,
    setMonthlyDeposit,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    editingSavedCalculationId,
    savedTitle,
    fieldErrors,
    result,
    isCalculated,
    isResultStale,
    handleCalculate,
    handleReset,
  } = useRDCalculator(restoredInputs);

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
          inputs: { monthlyDeposit, annualInterestRate, tenureValue, tenureUnit },
          result,
        }),
      );
      Alert.alert('Saved', 'Calculation updated successfully!');
    } else {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'rd',
        title,
        inputs: { monthlyDeposit, annualInterestRate, tenureValue, tenureUnit },
        result,
      });
      dispatch(addSavedCalculation(snapshot));
      Alert.alert('Saved', 'Calculation saved successfully!');
    }
  };

  const renderHeader = () => (
    <AppHeader
      title="RD Calculator"
      subtitle="Recurring Deposit Quarterly Compounding Savings"
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
        title="Recurring Deposit Inputs"
        subtitle="Specify monthly installment, interest rate & deposit duration"
      >
        <MoneyInput
          label="Monthly Installment Amount"
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
          label="Deposit Duration"
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
          <CalculatorResultSection title="RD Maturity Breakdown">
            {isResultStale && <StaleResultBanner style={styles.cardMargin} />}

            <RDResultCard result={result} style={styles.cardMargin} />

            <RDBreakdownChart result={result} style={styles.cardMargin} />
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle="RD Calculator"
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

export default RDCalculatorScreen;

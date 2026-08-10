import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import PercentageInput from '../../../../components/forms/PercentageInput';
import DurationInput from '../../../../components/forms/DurationInput';
import SelectField from '../../../../components/forms/SelectField';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';
import StaleResultBanner from '../../../../components/calculator/StaleResultBanner';
import SaveModal from '../../../../components/modals/SaveModal';

import {
  useCompoundInterestCalculator,
  COMPOUNDING_FREQUENCY_OPTIONS,
} from './hooks/useCompoundInterestCalculator';
import CompoundInterestResultCard from './components/CompoundInterestResultCard';
import CompoundInterestChart from './components/CompoundInterestChart';

import { createCalculationSnapshot } from '../../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../../store/slices/savedCalculationsSlice';

export const CompoundInterestCalculatorScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const restoredInputs = route?.params?.savedCalculation
    ? restoreSavedCalculationInputs(route.params.savedCalculation)
    : {};

  const {
    principal,
    setPrincipal,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    compoundingFrequency,
    setCompoundingFrequency,
    editingSavedCalculationId,
    savedTitle,
    fieldErrors,
    result,
    isCalculated,
    isResultStale,
    handleCalculate,
    handleReset,
  } = useCompoundInterestCalculator(restoredInputs);

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
          inputs: { principal, annualInterestRate, tenureValue, tenureUnit, compoundingFrequency },
          result,
        }),
      );
      Alert.alert('Saved', 'Calculation updated successfully!');
    } else {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'compound-interest',
        title,
        inputs: { principal, annualInterestRate, tenureValue, tenureUnit, compoundingFrequency },
        result,
      });
      dispatch(addSavedCalculation(snapshot));
      Alert.alert('Saved', 'Calculation saved successfully!');
    }
  };

  const renderHeader = () => (
    <AppHeader
      title="Compound Interest Calculator"
      subtitle="Exponential Wealth & Compounded Growth"
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
        title="Compound Interest Inputs"
        subtitle="Select compounding frequency, interest rate & principal"
      >
        <MoneyInput
          label="Principal Amount"
          value={principal}
          onChangeText={setPrincipal}
          error={fieldErrors.principal}
        />

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={annualInterestRate}
          onChangeText={setAnnualInterestRate}
          error={fieldErrors.annualInterestRate}
        />

        <DurationInput
          label="Investment Duration"
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureInYears}
        />

        <SelectField
          label="Compounding Frequency"
          value={compoundingFrequency}
          options={COMPOUNDING_FREQUENCY_OPTIONS}
          onValueChange={setCompoundingFrequency}
        />

        <CalculatorActionBar
          primaryTitle="Calculate Returns"
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
          <CalculatorResultSection title="Compounded Growth Breakdown">
            {isResultStale && <StaleResultBanner style={styles.cardMargin} />}

            <CompoundInterestResultCard result={result} style={styles.cardMargin} />

            <CompoundInterestChart result={result} style={styles.cardMargin} />
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle="Compound Interest Calculator"
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

export default CompoundInterestCalculatorScreen;

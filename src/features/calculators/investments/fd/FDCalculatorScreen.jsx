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

import { useFDCalculator, COMPOUNDING_OPTIONS } from './hooks/useFDCalculator';
import FDResultCard from './components/FDResultCard';
import FDBreakdownChart from './components/FDBreakdownChart';

import { createCalculationSnapshot } from '../../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../../store/slices/savedCalculationsSlice';

export const FDCalculatorScreen = ({ route, navigation }) => {
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
  } = useFDCalculator(restoredInputs);

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
        calculatorId: 'fd',
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
      title="FD Calculator"
      subtitle="Fixed Deposit Interest & Maturity Amount"
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
        title="Fixed Deposit Details"
        subtitle="Enter principal deposit, interest rate & compounding interval"
      >
        <MoneyInput
          label="Total Investment Amount"
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
          label="Deposit Tenure"
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureInYears}
        />

        <SelectField
          label="Compounding Frequency"
          value={compoundingFrequency}
          options={COMPOUNDING_OPTIONS}
          onValueChange={setCompoundingFrequency}
        />

        <CalculatorActionBar
          primaryTitle="Calculate Maturity"
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
          <CalculatorResultSection title="Maturity Breakdown">
            {isResultStale && <StaleResultBanner style={styles.cardMargin} />}

            <FDResultCard result={result} style={styles.cardMargin} />

            <FDBreakdownChart result={result} style={styles.cardMargin} />
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle="FD Calculator"
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

export default FDCalculatorScreen;

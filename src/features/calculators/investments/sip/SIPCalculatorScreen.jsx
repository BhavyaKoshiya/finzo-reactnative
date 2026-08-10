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

import { useSIPCalculator } from './hooks/useSIPCalculator';
import SIPResultCard from './components/SIPResultCard';
import SIPBreakdownChart from './components/SIPBreakdownChart';

import { createCalculationSnapshot } from '../../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../../store/slices/savedCalculationsSlice';

export const SIPCalculatorScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const restoredInputs = route?.params?.savedCalculation
    ? restoreSavedCalculationInputs(route.params.savedCalculation)
    : {};

  const {
    monthlyInvestment,
    setMonthlyInvestment,
    annualReturnRate,
    setAnnualReturnRate,
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
  } = useSIPCalculator(restoredInputs);

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
          inputs: { monthlyInvestment, annualReturnRate, tenureValue, tenureUnit },
          result,
        }),
      );
      Alert.alert('Saved', 'Calculation updated successfully!');
    } else {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'sip',
        title,
        inputs: { monthlyInvestment, annualReturnRate, tenureValue, tenureUnit },
        result,
      });
      dispatch(addSavedCalculation(snapshot));
      Alert.alert('Saved', 'Calculation saved successfully!');
    }
  };

  const renderHeader = () => (
    <AppHeader
      title="SIP Calculator"
      subtitle="Systematic Investment Plan Wealth Growth"
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
        title="SIP Investment Details"
        subtitle="Specify monthly deposit, expected return rate & tenure"
      >
        <MoneyInput
          label="Monthly Investment Amount"
          value={monthlyInvestment}
          onChangeText={setMonthlyInvestment}
          error={fieldErrors.monthlyInvestment}
        />

        <PercentageInput
          label="Expected Annual Return Rate (% p.a.)"
          value={annualReturnRate}
          onChangeText={setAnnualReturnRate}
          error={fieldErrors.annualReturnRate}
        />

        <DurationInput
          label="Investment Period"
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureMonths}
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
          <CalculatorResultSection title="Investment Growth Projection">
            {isResultStale && <StaleResultBanner style={styles.cardMargin} />}

            <SIPResultCard result={result} style={styles.cardMargin} />

            <SIPBreakdownChart result={result} style={styles.cardMargin} />
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle="SIP Calculator"
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

export default SIPCalculatorScreen;

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

import { useLoanCalculator } from './hooks/useLoanCalculator';
import EMIResultCard from '../emi/components/EMIResultCard';
import EMIBreakdownChart from '../emi/components/EMIBreakdownChart';
import AmortizationSection from '../emi/components/AmortizationSection';

import { createCalculationSnapshot } from '../../saved/types/savedTypes';
import { restoreSavedCalculationInputs } from '../../saved/utils/calculationRestoreAdapters';
import { addSavedCalculation, updateSavedCalculation } from '../../../store/slices/savedCalculationsSlice';

import {
  getExportModelForCalculator,
  shareCalculationText,
  generateCalculationPdf,
  shareCalculationPdfFile,
  ExportPdfModal,
} from '../../share';
import useInterstitialAd from '../../../hooks/useInterstitialAd';

export const LoanCalculatorScreen = ({ config, route, navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { handleBackWithAd } = useInterstitialAd({
    screen: 'calculators',
  });

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
  } = useLoanCalculator(config, restoredInputs);

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
        calculatorId: config.id,
        title,
        inputs: { loanAmount, interestRate, tenureValue, tenureUnit },
        result,
      });
      dispatch(addSavedCalculation(snapshot));
      Alert.alert('Saved', 'Calculation saved successfully!');
    }
  };

  const handleSharePress = async () => {
    if (!isCalculated || isResultStale || !result) return;
    const exportModel = getExportModelForCalculator(
      config.id,
      { loanAmount, interestRate, tenureValue, tenureUnit, savedTitle },
      result,
      { customTitle: savedTitle }
    );
    try {
      await shareCalculationText(exportModel);
    } catch (err) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const handlePdfExportConfirm = async (mode) => {
    if (!isCalculated || isResultStale || !result) return;
    setIsGeneratingPdf(true);
    try {
      const exportModel = getExportModelForCalculator(
        config.id,
        { loanAmount, interestRate, tenureValue, tenureUnit, savedTitle },
        result,
        { customTitle: savedTitle, mode }
      );
      const pdfPath = await generateCalculationPdf({ exportModel, mode });
      setPdfModalVisible(false);
      setIsGeneratingPdf(false);

      setTimeout(async () => {
        try {
          await shareCalculationPdfFile(pdfPath, exportModel.title);
        } catch (err) {
          Alert.alert('Share PDF Failed', err.message);
        }
      }, 350);
    } catch (err) {
      setIsGeneratingPdf(false);
      Alert.alert('PDF Export Failed', err.message);
    }
  };

  const renderHeader = () => (
    <AppHeader
      title={config.title || 'Loan Calculator'}
      subtitle={config.description || 'Calculate EMI and repayment details'}
      leftAction={{
        icon: ArrowLeft,
        onPress: handleBackWithAd,
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
        title="Loan Parameters"
        subtitle="Enter loan details to calculate your monthly EMI"
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
          onSavePress={() => setSaveModalVisible(true)}
          isSaveDisabled={!isCalculated || isResultStale}
          onSharePress={handleSharePress}
          isShareDisabled={!isCalculated || isResultStale}
          onPdfPress={() => setPdfModalVisible(true)}
          isPdfDisabled={!isCalculated || isResultStale}
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
          </CalculatorResultSection>
        </View>
      )}

      <SaveModal
        visible={saveModalVisible}
        defaultTitle={config.title}
        isEditing={Boolean(editingSavedCalculationId)}
        existingTitle={savedTitle}
        onClose={() => setSaveModalVisible(false)}
        onSave={onSaveConfirm}
      />

      <ExportPdfModal
        visible={pdfModalVisible}
        isGenerating={isGeneratingPdf}
        onClose={() => setPdfModalVisible(false)}
        onExport={handlePdfExportConfirm}
      />

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  cardMargin: {
    marginBottom: 16,
  },
});

export default LoanCalculatorScreen;

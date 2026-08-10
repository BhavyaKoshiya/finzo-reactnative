import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import PercentageInput from '../../../../components/forms/PercentageInput';
import SelectField from '../../../../components/forms/SelectField';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';

import {
  usePercentageCalculator,
  PERCENTAGE_MODE_OPTIONS,
} from './hooks/usePercentageCalculator';
import PercentageResultCard from './components/PercentageResultCard';

export const PercentageCalculatorScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    mode,
    handleModeChange,
    percentage,
    setPercentage,
    totalValue,
    setTotalValue,
    oldValue,
    setOldValue,
    newValue,
    setNewValue,
    valA,
    setValA,
    valB,
    setValB,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  } = usePercentageCalculator();

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
      title="Percentage Calculator"
      subtitle="Percentage Of, Change & Relative Difference"
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
        title="Percentage Calculation Type"
        subtitle="Select calculation mode and enter required values"
      >
        <SelectField
          label="Calculation Type"
          value={mode}
          options={PERCENTAGE_MODE_OPTIONS}
          onValueChange={handleModeChange}
        />

        {mode === 'percentage-of' && (
          <>
            <PercentageInput
              label="Percentage Rate (% p.a.)"
              value={percentage}
              onChangeText={setPercentage}
              error={fieldErrors.percentage}
            />

            <MoneyInput
              label="Amount / Total Value"
              value={totalValue}
              onChangeText={setTotalValue}
              error={fieldErrors.value}
            />
          </>
        )}

        {mode === 'percentage-change' && (
          <>
            <MoneyInput
              label="Original Value (Old)"
              value={oldValue}
              onChangeText={setOldValue}
              error={fieldErrors.oldValue}
            />

            <MoneyInput
              label="New Value"
              value={newValue}
              onChangeText={setNewValue}
              error={fieldErrors.newValue}
            />
          </>
        )}

        {mode === 'percentage-difference' && (
          <>
            <MoneyInput
              label="First Value (Value A)"
              value={valA}
              onChangeText={setValA}
              error={fieldErrors.valA}
            />

            <MoneyInput
              label="Second Value (Value B)"
              value={valB}
              onChangeText={setValB}
              error={fieldErrors.valB}
            />
          </>
        )}

        <CalculatorActionBar
          primaryTitle="Calculate %"
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
          <CalculatorResultSection title="Percentage Result">
            <PercentageResultCard result={result} style={styles.cardMargin} />
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

export default PercentageCalculatorScreen;

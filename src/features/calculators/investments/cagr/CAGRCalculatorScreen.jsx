import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import MoneyInput from '../../../../components/forms/MoneyInput';
import DurationInput from '../../../../components/forms/DurationInput';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';

import { useCAGRCalculator } from './hooks/useCAGRCalculator';
import CAGRResultCard from './components/CAGRResultCard';

export const CAGRCalculatorScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    beginningValue,
    setBeginningValue,
    endingValue,
    setEndingValue,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  } = useCAGRCalculator();

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
      title="CAGR Calculator"
      subtitle="Compound Annual Growth Rate"
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
        title="Investment Period & Values"
        subtitle="Calculate annual return rate over multiple years"
      >
        <MoneyInput
          label="Initial Investment (Beginning Value)"
          value={beginningValue}
          onChangeText={setBeginningValue}
          error={fieldErrors.beginningValue}
        />

        <MoneyInput
          label="Final Value (Ending Value)"
          value={endingValue}
          onChangeText={setEndingValue}
          error={fieldErrors.endingValue}
        />

        <DurationInput
          label="Investment Period"
          value={tenureValue}
          unit={tenureUnit}
          onChangeText={setTenureValue}
          onUnitChange={setTenureUnit}
          error={fieldErrors.tenureYears}
        />

        <CalculatorActionBar
          primaryTitle="Calculate CAGR"
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
          <CalculatorResultSection title="Annualized Return Result">
            <CAGRResultCard result={result} style={styles.cardMargin} />
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

export default CAGRCalculatorScreen;

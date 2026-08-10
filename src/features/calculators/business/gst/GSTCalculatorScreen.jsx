import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../../components/containers/ScreenContainer';
import AppHeader from '../../../../components/navigation/AppHeader';
import AppText from '../../../../components/common/AppText';
import MoneyInput from '../../../../components/forms/MoneyInput';
import PercentageInput from '../../../../components/forms/PercentageInput';
import SelectField from '../../../../components/forms/SelectField';
import CalculatorInputSection from '../../../../components/calculator/CalculatorInputSection';
import CalculatorResultSection from '../../../../components/calculator/CalculatorResultSection';
import CalculatorActionBar from '../../../../components/calculator/CalculatorActionBar';
import { useAppTheme } from '../../../../hooks/useAppTheme';

import {
  useGSTCalculator,
  GST_MODE_OPTIONS,
  GST_RATE_PRESETS,
} from './hooks/useGSTCalculator';
import GSTResultCard from './components/GSTResultCard';

export const GSTCalculatorScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  const {
    amount,
    setAmount,
    gstRate,
    setGstRate,
    mode,
    handleModeChange,
    selectedRatePreset,
    handleRatePresetChange,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  } = useGSTCalculator();

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
      title="GST Calculator"
      subtitle="Goods & Services Tax Payout & Breakdown"
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
        title="GST Calculation Details"
        subtitle="Select GST mode, rate percentage & enter amount"
      >
        <SelectField
          label="GST Calculation Mode"
          value={mode}
          options={GST_MODE_OPTIONS}
          onValueChange={handleModeChange}
        />

        <MoneyInput
          label={mode === 'inclusive' ? 'Total Amount (Inclusive of GST)' : 'Base Amount (Exclusive of GST)'}
          value={amount}
          onChangeText={setAmount}
          error={fieldErrors.amount}
        />

        {/* GST Rate Presets Row */}
        <View style={styles.presetGroup}>
          <AppText variant="resultLabel" color={currentTheme.textPrimary} style={styles.presetLabel}>
            Select Standard GST Rate
          </AppText>
          <View style={styles.presetRow}>
            {GST_RATE_PRESETS.map((preset) => {
              const isSelected = selectedRatePreset === preset.value;
              return (
                <TouchableOpacity
                  key={preset.value}
                  onPress={() => handleRatePresetChange(preset.value)}
                  activeOpacity={0.7}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                    style={styles.chipText}
                  >
                    {preset.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <PercentageInput
          label="GST Rate (% p.a.)"
          value={gstRate}
          onChangeText={(val) => {
            handleRatePresetChange('custom');
            setGstRate(val);
          }}
          error={fieldErrors.gstRate}
        />

        <CalculatorActionBar
          primaryTitle="Calculate GST"
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
          <CalculatorResultSection title="GST Breakdown & Summary">
            <GSTResultCard result={result} style={styles.cardMargin} />
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
  presetGroup: {
    marginBottom: 16,
  },
  presetLabel: {
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  chipText: {
    fontWeight: '600',
  },
  cardMargin: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default GSTCalculatorScreen;

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calculator, Sun, Moon, Sparkles, TrendingUp, Layers } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppImage from '../../components/images/AppImage';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import TertiaryButton from '../../components/buttons/TertiaryButton';
import IconButton from '../../components/buttons/IconButton';
import TextButton from '../../components/buttons/TextButton';
import AppCard from '../../components/cards/AppCard';
import ResultCard from '../../components/cards/ResultCard';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import InfoCard from '../../components/cards/InfoCard';
import MoneyInput from '../../components/forms/MoneyInput';
import PercentageInput from '../../components/forms/PercentageInput';
import NumberInput from '../../components/forms/NumberInput';
import DurationInput from '../../components/forms/DurationInput';
import SelectField from '../../components/forms/SelectField';
import SliderField from '../../components/forms/SliderField';
import DateInput from '../../components/forms/DateInput';
import ErrorMessage from '../../components/feedback/ErrorMessage';
import InfoMessage from '../../components/feedback/InfoMessage';
import SuccessMessage from '../../components/feedback/SuccessMessage';
import EmptyState from '../../components/feedback/EmptyState';
import LoadingState from '../../components/feedback/LoadingState';
import AppBottomSheet from '../../components/sheets/AppBottomSheet';
import useAppTheme from '../../hooks/useAppTheme';

export const ComponentShowcaseScreen = () => {
  const { currentTheme, isDark, setThemeMode } = useAppTheme();
  const bottomSheetRef = useRef(null);

  // Demo Form State
  const [money, setMoney] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [duration, setDuration] = useState(20);
  const [durationUnit, setDurationUnit] = useState('years');
  const [sliderValue, setSliderValue] = useState(50000);
  const [selectedOption, setSelectedOption] = useState('monthly');
  const [date, setDate] = useState(new Date());

  const handleToggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const options = [
    { label: 'Monthly Compounding', value: 'monthly' },
    { label: 'Quarterly Compounding', value: 'quarterly' },
    { label: 'Annual Compounding', value: 'annual' },
  ];

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <AppText variant="screenTitle">Design System Showcase</AppText>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Finzo Phase 1 Component Library
          </AppText>
        </View>
        <IconButton
          icon={isDark ? Sun : Moon}
          onPress={handleToggleTheme}
          accessibilityLabel="Toggle Theme"
        />
      </View>

      {/* 1. Typography Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          1. Typography Variants
        </AppText>
        <AppText variant="display">Display Title</AppText>
        <AppText variant="screenTitle">Screen Title (26px)</AppText>
        <AppText variant="sectionTitle">Section Title (20px)</AppText>
        <AppText variant="cardTitle">Card Title (17px)</AppText>
        <AppText variant="body">Body regular text sample</AppText>
        <AppText variant="bodyMedium">Body medium text sample</AppText>
        <AppText variant="bodySmall">Body small text sample</AppText>
        <AppText variant="caption">Caption label text</AppText>
        <AppText variant="resultValue" color={currentTheme.primary}>
          ₹12,45,678
        </AppText>
        <AppText variant="resultLabel">Result Label (14px)</AppText>
      </View>

      {/* 2. Buttons Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          2. Buttons
        </AppText>
        <View style={styles.buttonGrid}>
          <PrimaryButton title="Primary Button" onPress={() => {}} style={styles.btnMargin} />
          <PrimaryButton title="Primary Loading" loading onPress={() => {}} style={styles.btnMargin} />
          <PrimaryButton title="Primary Disabled" disabled onPress={() => {}} style={styles.btnMargin} />
          <SecondaryButton title="Secondary Button" onPress={() => {}} style={styles.btnMargin} />
          <TertiaryButton title="Tertiary Button" onPress={() => {}} style={styles.btnMargin} />
          <View style={styles.rowAlign}>
            <IconButton icon={Sparkles} onPress={() => {}} accessibilityLabel="Sparkles" />
            <TextButton title="Text Button" onPress={() => {}} style={styles.ml12} />
          </View>
        </View>
      </View>

      {/* 3. Cards Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          3. Card Surfaces
        </AppText>
        <AppCard style={styles.cardMargin}>
          <AppText variant="cardTitle">Canonical AppCard</AppText>
          <AppText variant="bodySmall" color={currentTheme.textSecondary}>
            Uses react-native-fast-shadow ShadowedView.
          </AppText>
        </AppCard>

        <ResultCard
          title="Estimated Maturity Amount"
          value="₹24,80,120"
          subtitle="Total Investment: ₹12,00,000"
          style={styles.cardMargin}
        />

        <CalculatorCard
          title="Home Loan EMI Calculator"
          description="Calculate monthly installments & interest"
          icon={Calculator}
          onPress={() => {}}
          style={styles.cardMargin}
        />

        <CategoryCard
          title="Loan Planning"
          count={4}
          icon={TrendingUp}
          onPress={() => {}}
          style={styles.cardMargin}
        />

        <InfoCard
          title="Important Notice"
          message="Finzo is an offline calculator utility."
          icon={Layers}
          type="info"
        />
      </View>

      {/* 4. Generic Form System */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          4. Generic Form Inputs
        </AppText>
        <MoneyInput
          label="Loan Amount (INR)"
          value={money}
          onChangeValue={setMoney}
          helperText="Format: ₹10,00,000"
        />

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={rate}
          onChangeValue={setRate}
        />

        <DurationInput
          label="Loan Tenure"
          value={duration}
          onChangeValue={setDuration}
          unit={durationUnit}
          onUnitChange={setDurationUnit}
        />

        <SliderField
          label="Monthly SIP Amount"
          value={sliderValue}
          min={500}
          max={100000}
          step={500}
          onChangeValue={setSliderValue}
          formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
        />

        <SelectField
          label="Compounding Frequency"
          value={selectedOption}
          options={options}
          onSelect={handleOpenSheet}
        />

        <DateInput
          label="Investment Start Date"
          value={date}
          onPress={() => setDate(new Date())}
        />

        <NumberInput
          label="Custom Decimal Number"
          value={123.45}
          onChangeValue={() => {}}
          suffix="units"
        />
      </View>

      {/* 5. Feedback Messages & States */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          5. Feedback States
        </AppText>
        <ErrorMessage message="Invalid interest rate specified." />
        <InfoMessage message="Calculations are indicative." />
        <SuccessMessage message="Calculation settings saved locally." />
        <EmptyState title="No Saved Records" description="Items saved will appear here." />
        <LoadingState message="Processing preview..." />
      </View>

      {/* 6. Image Wrapper */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          6. AppImage Component (@d11/react-native-fast-image)
        </AppText>
        <AppImage
          source={{ uri: 'https://picsum.photos/300/150' }}
          height={140}
          borderRadius={12}
          accessibilityLabel="Sample Banner"
        />
      </View>

      {/* Bottom Sheet Modal */}
      <AppBottomSheet ref={bottomSheetRef} title="Select Compounding Frequency">
        <View style={styles.sheetContent}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                setSelectedOption(opt.value);
                bottomSheetRef.current?.close();
              }}
              style={[
                styles.optionItem,
                selectedOption === opt.value && { backgroundColor: currentTheme.primaryLight },
              ]}
            >
              <AppText
                variant="bodyMedium"
                color={selectedOption === opt.value ? currentTheme.primary : currentTheme.textPrimary}
              >
                {opt.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </AppBottomSheet>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleGroup: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  buttonGrid: {
    gap: 10,
  },
  btnMargin: {
    marginBottom: 8,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ml12: {
    marginLeft: 12,
  },
  cardMargin: {
    marginBottom: 12,
  },
  sheetContent: {
    padding: 16,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
});

export default ComponentShowcaseScreen;

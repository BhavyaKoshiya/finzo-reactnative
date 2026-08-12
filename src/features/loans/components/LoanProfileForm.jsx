import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../../../components/common/AppText';
import TextInputField from '../../../components/forms/TextInputField';
import MoneyInput from '../../../components/forms/MoneyInput';
import PercentageInput from '../../../components/forms/PercentageInput';
import DurationInput from '../../../components/forms/DurationInput';
import SelectField from '../../../components/forms/SelectField';
import DatePickerField from '../../../components/forms/DatePickerField';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { LOAN_TYPE_OPTIONS } from '../constants/loanConstants';

export const LoanProfileForm = ({ form, onSave, onCancel }) => {
  const { currentTheme } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* SECTION 1: Loan Details */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          1. Loan Details
        </AppText>

        <TextInputField
          label="Loan Name"
          value={form.name}
          onChangeText={form.setName}
          placeholder="e.g. My Home Loan"
          errorText={form.errors.name}
          required
        />

        <SelectField
          label="Loan Type"
          value={form.loanType}
          options={LOAN_TYPE_OPTIONS}
          onValueChange={form.setLoanType}
          errorText={form.errors.loanType}
          required
        />

        <TextInputField
          label="Lender / Bank Name"
          value={form.lenderName}
          onChangeText={form.setLenderName}
          placeholder="e.g. HDFC Bank, SBI"
          errorText={form.errors.lenderName}
        />
      </AppCard>

      {/* SECTION 2: Loan Amount */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          2. Loan Amount
        </AppText>

        <MoneyInput
          label="Original Loan Amount"
          value={form.originalPrincipal}
          onChangeText={form.setOriginalPrincipal}
          error={form.errors.originalPrincipal}
          required
        />

        <MoneyInput
          label="Current Outstanding Principal"
          value={form.currentOutstandingPrincipal}
          onChangeText={form.setCurrentOutstandingPrincipal}
          error={form.errors.currentOutstandingPrincipal}
          required
        />
      </AppCard>

      {/* SECTION 3: Loan Terms */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          3. Loan Terms
        </AppText>

        <PercentageInput
          label="Interest Rate (% p.a.)"
          value={form.annualInterestRate}
          onChangeText={form.setAnnualInterestRate}
          error={form.errors.annualInterestRate}
          required
        />

        <MoneyInput
          label="Monthly EMI Amount"
          value={form.emiAmount}
          onChangeText={form.setEmiAmount}
          error={form.errors.emiAmount}
          required
        />

        <DurationInput
          label="Original Tenure"
          value={form.originalTenureValue}
          unit={form.originalTenureUnit}
          onChangeText={form.setOriginalTenureValue}
          onUnitChange={form.setOriginalTenureUnit}
          error={form.errors.originalTenure}
          required
        />

        <DurationInput
          label="Remaining Tenure"
          value={form.remainingTenureValue}
          unit={form.remainingTenureUnit}
          onChangeText={form.setRemainingTenureValue}
          onUnitChange={form.setRemainingTenureUnit}
          error={form.errors.remainingTenure}
          required
        />
      </AppCard>

      {/* SECTION 4: Dates */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          4. Key Dates
        </AppText>

        <DatePickerField
          label="Loan Start Date"
          value={form.loanStartDate}
          onDateChange={form.setLoanStartDate}
          errorText={form.errors.loanStartDate}
          required
        />

        <DatePickerField
          label="Next EMI Date"
          value={form.nextEmiDate}
          onDateChange={form.setNextEmiDate}
          errorText={form.errors.nextEmiDate}
          required
        />
      </AppCard>

      {/* SECTION 5: Optional Details */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          5. Optional Details
        </AppText>

        <MoneyInput
          label="Processing Fee / Charges"
          value={form.processingFee}
          onChangeText={form.setProcessingFee}
          error={form.errors.processingFee}
        />

        <TextInputField
          label="Notes / Reference"
          value={form.notes}
          onChangeText={form.setNotes}
          placeholder="Account number, branch details, etc."
        />
      </AppCard>

      {/* SECTION 6: Primary Loan Toggle */}
      <AppCard style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => form.setIsPrimary(!form.isPrimary)}
          activeOpacity={0.7}
          style={styles.checkboxRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.isPrimary }}
          accessibilityLabel="Make this my primary loan"
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: form.isPrimary ? currentTheme.primary : currentTheme.border,
                backgroundColor: form.isPrimary ? currentTheme.primary : 'transparent',
              },
            ]}
          >
            {form.isPrimary && <AppIcon icon={Check} size={14} color="#FFFFFF" />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
              Make this my Primary Loan
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary}>
              Featured on your Home Screen for quick tracking.
            </AppText>
          </View>
        </TouchableOpacity>
      </AppCard>

      {/* Actions */}
      <View style={styles.actionContainer}>
        <PrimaryButton
          title={form.isEditMode ? 'Save Changes' : 'Save Loan'}
          onPress={onSave}
          style={styles.saveBtn}
        />
        {onCancel && (
          <SecondaryButton
            title="Cancel"
            onPress={onCancel}
            style={styles.cancelBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  actionContainer: {
    marginTop: 8,
    gap: 12,
  },
  saveBtn: {
    width: '100%',
  },
  cancelBtn: {
    width: '100%',
  },
});

export default LoanProfileForm;

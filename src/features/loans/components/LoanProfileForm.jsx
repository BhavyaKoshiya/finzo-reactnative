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
import { Check, ShieldAlert, Scale, Bell } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { LOAN_TYPE_OPTIONS } from '../constants/loanConstants';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanProfileForm = ({
  form,
  onSave,
  onCancel,
  hasPayments = false,
  onOpenBalanceCorrection = null,
}) => {
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

      {/* SECTION 2: Loan Amount & Balance Protection */}
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

        {form.isEditMode && hasPayments && (
          <View style={[styles.inlineWarning, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <AppIcon icon={ShieldAlert} size={16} color="#B45309" style={{ marginRight: 8 }} />
            <AppText variant="bodySmall" color="#92400E" style={{ flex: 1 }}>
              Changing the original loan amount may affect your loan history and progress calculations.
            </AppText>
          </View>
        )}

        {form.isEditMode ? (
          <View style={[styles.protectedBalanceCard, { backgroundColor: currentTheme.surfaceSubtle || '#F8FAFC', borderColor: currentTheme.border }]}>
            <View style={styles.protectedHeader}>
              <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ fontWeight: '600' }}>
                CURRENT OUTSTANDING PRINCIPAL
              </AppText>
              <View style={[styles.protectedBadge, { backgroundColor: '#DBEAFE' }]}>
                <AppText variant="bodySmall" color="#1E40AF" style={{ fontSize: 11, fontWeight: '700' }}>
                  Ledger Protected
                </AppText>
              </View>
            </View>

            <AppText variant="screenTitle" color={currentTheme.textPrimary} style={{ marginVertical: 4 }}>
              {formatCurrency(form.currentOutstandingPrincipal)}
            </AppText>

            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 10 }}>
              To update current balance safely without corrupting past payment history, use Balance Correction.
            </AppText>

            {onOpenBalanceCorrection && (
              <TouchableOpacity
                onPress={onOpenBalanceCorrection}
                activeOpacity={0.8}
                style={[styles.correctBalanceBtn, { borderColor: currentTheme.primary }]}
              >
                <AppIcon icon={Scale} size={14} color={currentTheme.primary} style={{ marginRight: 6 }} />
                <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  Correct Current Balance
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <MoneyInput
            label="Current Outstanding Principal"
            value={form.currentOutstandingPrincipal}
            onChangeText={form.setCurrentOutstandingPrincipal}
            error={form.errors.currentOutstandingPrincipal}
            required
          />
        )}
      </AppCard>

      {/* SECTION 3: Financial Terms */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          3. Financial Terms
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
      </AppCard>

      {/* SECTION 4: Schedule & Key Dates */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          4. Payment Schedule & Key Dates
        </AppText>

        <DatePickerField
          label="Loan Start Date"
          value={form.loanStartDate}
          onDateChange={form.setLoanStartDate}
          errorText={form.errors.loanStartDate}
          required
        />

        <TextInputField
          label="EMI Due Day of Month (1–31)"
          value={form.dueDay}
          onChangeText={form.setDueDay}
          placeholder="5"
          keyboardType="numeric"
          errorText={form.errors.dueDay}
          required
        />

        <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.dueDayHint}>
          If a month has fewer days, Finzo automatically uses the last available day of that month.
        </AppText>
      </AppCard>

      {/* SECTION 5: Reminders & Preferences */}
      <AppCard style={styles.sectionCard}>
        <View style={styles.reminderTitleRow}>
          <AppIcon icon={Bell} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <AppText variant="cardTitle">
            5. Payment Reminders
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => form.setRemindersEnabled(!form.remindersEnabled)}
          activeOpacity={0.7}
          style={[styles.checkboxRow, { marginBottom: 12 }]}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: form.remindersEnabled ? currentTheme.primary : currentTheme.border,
                backgroundColor: form.remindersEnabled ? currentTheme.primary : 'transparent',
              },
            ]}
          >
            {form.remindersEnabled && <AppIcon icon={Check} size={14} color="#FFFFFF" />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
              Enable Payment Reminders
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary}>
              Receive local notifications before due date
            </AppText>
          </View>
        </TouchableOpacity>

        {form.remindersEnabled && (
          <View style={styles.reminderDetailsGroup}>
            <SelectField
              label="Remind Me"
              value={String(form.reminderDaysBefore)}
              options={[
                { label: 'On due date (0 days)', value: '0' },
                { label: '1 day before due date', value: '1' },
                { label: '3 days before due date', value: '3' },
                { label: '5 days before due date', value: '5' },
                { label: '7 days before due date', value: '7' },
              ]}
              onValueChange={form.setReminderDaysBefore}
            />
          </View>
        )}
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
  inlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  protectedBalanceCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  protectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  protectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  correctBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dueDayHint: {
    marginTop: 4,
    fontSize: 12,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reminderDetailsGroup: {
    marginTop: 8,
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

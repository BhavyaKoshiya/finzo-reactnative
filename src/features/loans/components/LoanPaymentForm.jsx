import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../../../components/common/AppText';
import MoneyInput from '../../../components/forms/MoneyInput';
import SelectField from '../../../components/forms/SelectField';
import DatePickerField from '../../../components/forms/DatePickerField';
import TextInputField from '../../../components/forms/TextInputField';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import { CheckSquare, Square, Calculator, Sparkles, Building2, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PAYMENT_TYPE_OPTIONS, PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanPaymentForm = ({ form, onSave, onCancel, currentLoanOutstanding = 0 }) => {
  const { currentTheme } = useAppTheme();
  const [showBankDetails, setShowBankDetails] = useState(
    Boolean(form.actualInterest || form.actualPrincipal || form.actualClosingBalance || form.isBankConfirmed)
  );

  const setEmiAmount = form.setEmiAmount || 0;
  const preview = form.preview || {};
  const numAmount = Number(form.amount) || 0;
  const isOverpayment = preview.isOverpayment;

  return (
    <View style={styles.container}>
      {/* SECTION 1: Payment Type & Amount */}
      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          1. Payment Type & Amount
        </AppText>

        <SelectField
          label="Payment Type"
          value={form.paymentType}
          options={PAYMENT_TYPE_OPTIONS}
          onValueChange={form.setPaymentType}
          errorText={form.errors.paymentType}
          required
        />

        {form.paymentType === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0 && (
          <TouchableOpacity
            onPress={() => form.setUseScheduledEmi(!form.useScheduledEmi)}
            activeOpacity={0.7}
            style={styles.checkboxRow}
          >
            <AppIcon
              icon={form.useScheduledEmi ? CheckSquare : Square}
              size={18}
              color={currentTheme.primary}
              style={{ marginRight: 8 }}
            />
            <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
              Use scheduled EMI ({formatCurrency(setEmiAmount)})
            </AppText>
          </TouchableOpacity>
        )}

        <MoneyInput
          label="Payment Amount"
          value={form.amount}
          onChangeValue={form.setAmount}
          errorText={form.errors.amount}
          required
        />

        {isOverpayment && (
          <View style={styles.warningRow}>
            <AppIcon icon={AlertTriangle} size={14} color={currentTheme.warning} style={{ marginRight: 6 }} />
            <AppText variant="caption" color={currentTheme.warning} style={{ fontWeight: '600', flex: 1 }}>
              Payment exceeds Finzo's estimated outstanding balance.
            </AppText>
          </View>
        )}

        <DatePickerField
          label="Payment Date"
          value={form.paymentDate}
          onDateChange={form.setPaymentDate}
          errorText={form.errors.paymentDate}
          required
        />

        <DatePickerField
          label="Due Date (Optional)"
          value={form.dueDate || ''}
          onDateChange={form.setDueDate}
          placeholder="Select due date if applicable"
        />
      </AppCard>

      {/* SECTION 2: Payment Preview Card */}
      <AppCard style={[styles.sectionCard, { backgroundColor: currentTheme.primaryLight }]}>
        <View style={styles.previewHeaderRow}>
          <AppIcon icon={Calculator} size={16} color={currentTheme.primary} style={{ marginRight: 6 }} />
          <AppText variant="cardTitle" color={currentTheme.primary} style={{ fontSize: 15, fontWeight: '700' }}>
            Finzo Calculation Preview
          </AppText>
        </View>

        <View style={styles.previewRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Opening Balance:
          </AppText>
          <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
            {formatCurrency(preview.openingBalance || currentLoanOutstanding)}
          </AppText>
        </View>

        <View style={styles.previewRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Payment Amount:
          </AppText>
          <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
            {formatCurrency(numAmount)}
          </AppText>
        </View>

        {form.paymentType === PAYMENT_TYPES.PREPAYMENT ? (
          <View style={styles.previewRow}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Principal Reduction (100%):
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
              {formatCurrency(numAmount)}
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.previewRow}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Estimated Interest:
              </AppText>
              <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                {formatCurrency(preview.estimatedInterest)}
              </AppText>
            </View>

            <View style={styles.previewRow}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Estimated Principal:
              </AppText>
              <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                {formatCurrency(preview.estimatedPrincipal)}
              </AppText>
            </View>
          </>
        )}

        <View style={[styles.previewRow, styles.closingRow]}>
          <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
            Estimated Balance After Payment:
          </AppText>
          <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={{ fontWeight: '800' }}>
            {formatCurrency(preview.estimatedClosingBalance)}
          </AppText>
        </View>

        <AppText variant="caption" color={currentTheme.textMuted} style={styles.disclaimerText}>
          Based on Finzo's estimate. Exact bank figures may vary slightly.
        </AppText>
      </AppCard>

      {/* SECTION 3: Optional Actual Bank Values */}
      <AppCard style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => setShowBankDetails(!showBankDetails)}
          activeOpacity={0.7}
          style={styles.bankHeaderRow}
        >
          <AppIcon icon={Building2} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
              Have your bank's statement?
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Enter exact bank interest, principal, or closing balance
            </AppText>
          </View>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
            {showBankDetails ? 'Hide' : 'Enter Bank Values'}
          </AppText>
        </TouchableOpacity>

        {showBankDetails && (
          <View style={styles.bankBoxContent}>
            <MoneyInput
              label="Actual Bank Interest"
              value={form.actualInterest}
              onChangeValue={form.setActualInterest}
              placeholder="e.g. 5180"
            />

            <MoneyInput
              label="Actual Bank Principal"
              value={form.actualPrincipal}
              onChangeValue={form.setActualPrincipal}
              placeholder="e.g. 16270"
            />

            <MoneyInput
              label="Actual Bank Closing Balance"
              value={form.actualClosingBalance}
              onChangeValue={form.setActualClosingBalance}
              placeholder="e.g. 709980"
            />

            <TouchableOpacity
              onPress={() => form.setIsBankConfirmed(!form.isBankConfirmed)}
              activeOpacity={0.7}
              style={[styles.checkboxRow, { marginTop: 8 }]}
            >
              <AppIcon
                icon={form.isBankConfirmed ? CheckSquare : Square}
                size={18}
                color={currentTheme.primary}
                style={{ marginRight: 8 }}
              />
              <AppText variant="caption" style={{ fontWeight: '600', flex: 1 }}>
                Is this the balance shown by your bank? (Sets active balance anchor)
              </AppText>
            </TouchableOpacity>

            {form.isBankConfirmed && (
              <View style={styles.confirmedBadgeRow}>
                <AppIcon icon={CheckCircle2} size={14} color={currentTheme.success} style={{ marginRight: 4 }} />
                <AppText variant="caption" color={currentTheme.success} style={{ fontWeight: '600' }}>
                  Bank-confirmed balance will serve as starting anchor for future calculations
                </AppText>
              </View>
            )}
          </View>
        )}
      </AppCard>

      {/* SECTION 4: Notes / Reference */}
      <AppCard style={styles.sectionCard}>
        <TextInputField
          label="Notes / Reference (Optional)"
          value={form.note}
          onChangeText={form.setNote}
          placeholder="Receipt #, UTR, cheque number, or bank notes..."
        />
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <PrimaryButton
          title={form.isEditMode ? 'Save Payment Changes' : 'Record Payment'}
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
    marginBottom: 12,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  closingRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
    paddingTop: 8,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankBoxContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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

export default LoanPaymentForm;

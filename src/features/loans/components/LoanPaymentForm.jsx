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
import { Check, AlertTriangle, Calculator, Sparkles, Building2, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PAYMENT_TYPE_OPTIONS, PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanPaymentForm = ({ form, onSave, onCancel, currentLoanOutstanding = 0 }) => {
  const { currentTheme } = useAppTheme();
  const [showBankBalanceBox, setShowBankBalanceBox] = useState(false);

  const setEmiAmount = form.setEmiAmount || 0;
  const numAmount = Number(form.amount) || 0;
  const numInterest = Number(form.interestAmount) || 0;
  const numPrincipal = Number(form.principalAmount) || 0;
  const numEstBalance = Number(form.outstandingAfter) || 0;
  const numBank = Number(form.actualClosingBalance);
  const hasBankBalance = !isNaN(numBank) && form.actualClosingBalance !== null && form.actualClosingBalance !== '';
  const diffBank = hasBankBalance ? numBank - numEstBalance : 0;

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

        <MoneyInput
          label="Payment Amount"
          value={form.amount}
          onChangeValue={form.setAmount}
          errorText={form.errors.amount}
          required
        />

        {form.paymentType === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0 && (
          <View style={styles.emiHelperRow}>
            <AppIcon icon={Sparkles} size={14} color={currentTheme.primary} style={{ marginRight: 6 }} />
            <AppText variant="caption" color={currentTheme.textSecondary} style={{ flex: 1 }}>
              Using your configured EMI ({formatCurrency(setEmiAmount)})
            </AppText>
            {Number(form.amount) !== setEmiAmount && (
              <TouchableOpacity onPress={form.handleQuickFillEmi} activeOpacity={0.7}>
                <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  Reset to {formatCurrency(setEmiAmount)}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        <DatePickerField
          label="Payment Date"
          value={form.paymentDate}
          onDateChange={form.setPaymentDate}
          errorText={form.errors.paymentDate}
          required
        />
      </AppCard>

      {/* SECTION 2: Payment Summary Preview Card */}
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
            {formatCurrency(currentLoanOutstanding)}
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
                {formatCurrency(numInterest)}
              </AppText>
            </View>

            <View style={styles.previewRow}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Principal Reduction:
              </AppText>
              <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                {formatCurrency(numPrincipal)}
              </AppText>
            </View>
          </>
        )}

        <View style={[styles.previewRow, styles.closingRow]}>
          <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
            Estimated Balance After Payment:
          </AppText>
          <AppText variant="bodyMedium" color={currentTheme.textPrimary} style={{ fontWeight: '800' }}>
            {formatCurrency(numEstBalance)}
          </AppText>
        </View>

        <AppText variant="caption" color={currentTheme.textMuted} style={styles.disclaimerText}>
          Based on Finzo's estimated calculation. Exact bank figures may vary slightly.
        </AppText>
      </AppCard>

      {/* SECTION 3: Optional Actual Bank Balance Correction */}
      <AppCard style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => setShowBankBalanceBox(!showBankBalanceBox)}
          activeOpacity={0.7}
          style={styles.bankHeaderRow}
        >
          <AppIcon icon={Building2} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
              Does your bank show a different balance?
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Enter your exact lender receipt balance if available
            </AppText>
          </View>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
            {showBankBalanceBox ? 'Hide' : 'Update Balance'}
          </AppText>
        </TouchableOpacity>

        {showBankBalanceBox && (
          <View style={styles.bankBoxContent}>
            <MoneyInput
              label="Actual Bank Balance"
              value={form.actualClosingBalance || ''}
              onChangeValue={form.setActualClosingBalance}
              placeholder="e.g. 726050"
            />

            {hasBankBalance && (
              <View style={styles.bankDiffCard}>
                <View style={styles.diffRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Finzo Estimate:</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600' }}>{formatCurrency(numEstBalance)}</AppText>
                </View>
                <View style={styles.diffRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Your Bank Balance:</AppText>
                  <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>{formatCurrency(numBank)}</AppText>
                </View>
                <View style={[styles.diffRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 4, marginTop: 4 }]}>
                  <AppText variant="caption" style={{ fontWeight: '600' }}>Difference:</AppText>
                  <AppText variant="caption" color={diffBank !== 0 ? currentTheme.warning : currentTheme.success} style={{ fontWeight: '700' }}>
                    {diffBank > 0 ? `+${formatCurrency(diffBank)}` : formatCurrency(diffBank)}
                  </AppText>
                </View>

                <View style={styles.confirmedBadgeRow}>
                  <AppIcon icon={CheckCircle2} size={14} color={currentTheme.success} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={currentTheme.success} style={{ fontWeight: '600' }}>
                    Bank-confirmed balance will be used for future calculations
                  </AppText>
                </View>
              </View>
            )}
          </View>
        )}
      </AppCard>

      {/* SECTION 4: Notes / Reference */}
      <AppCard style={styles.sectionCard}>
        <TextInputField
          label="Notes / Reference"
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
  emiHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 12,
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
  bankDiffCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
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

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
import { CheckSquare, Square, Calculator, Sparkles, Building2, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PAYMENT_TYPE_OPTIONS, PAYMENT_TYPES, PREPAYMENT_STRATEGIES, PREPAYMENT_STRATEGY_OPTIONS } from '../constants/loanPaymentConstants';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanPaymentForm = ({ form, onSave, onCancel, currentLoanOutstanding = 0 }) => {
  const { currentTheme } = useAppTheme();
  const [showBankDetails, setShowBankDetails] = useState(
    Boolean(
      form.actualInterest ||
      form.actualPrincipal ||
      form.actualClosingBalance ||
      form.isBankConfirmed ||
      form.penaltyAmount ||
      form.feesAmount ||
      form.isLatePayment
    )
  );

  const setEmiAmount = form.setEmiAmount || 0;
  const preview = form.preview || {};
  const numAmount = Number(form.amount) || 0;
  const numBrokenPeriod = Number(form.brokenPeriodInterest) || 0;
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

        {/* Prepayment Strategy Picker — only when paymentType is Prepayment */}
        {form.paymentType === PAYMENT_TYPES.PREPAYMENT && (
          <View style={styles.strategySection}>
            <AppText variant="bodySmall" style={styles.strategyLabel}>
              Prepayment Strategy
            </AppText>
            <View style={styles.strategyRow}>
              {PREPAYMENT_STRATEGY_OPTIONS.map((opt) => {
                const isSelected = form.prepaymentStrategy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => form.setPrepaymentStrategy(opt.value)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${opt.label}: ${opt.description}`}
                    style={[
                      styles.strategyTile,
                      {
                        backgroundColor: isSelected ? `${currentTheme.primary}15` : currentTheme.surfaceSubtle,
                        borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? currentTheme.primary : currentTheme.textPrimary}
                      style={{ fontWeight: '700', marginBottom: 2 }}
                    >
                      {opt.label}
                    </AppText>
                    <AppText variant="caption" color={currentTheme.textMuted} numberOfLines={1}>
                      {opt.description}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Exact Bank Value Override */}
            {form.prepaymentStrategy === PREPAYMENT_STRATEGIES.REDUCE_EMI ? (
              <View style={styles.overrideContainer}>
                <MoneyInput
                  label="Bank's Exact New EMI (Optional)"
                  value={form.exactNewEmi}
                  onChangeValue={form.setExactNewEmi}
                  placeholder="Leave blank for Finzo's estimate"
                />
                <View style={styles.brokenPeriodHint}>
                  <AppIcon icon={Info} size={12} color={currentTheme.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
                  <AppText variant="caption" color={currentTheme.textMuted} style={{ flex: 1, fontSize: 11 }}>
                    Leave blank to auto-calculate. Fill only if your bank rounded your new EMI differently.
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={styles.overrideContainer}>
                <TextInputField
                  label="Bank's Exact Remaining Months (Optional)"
                  value={form.exactNewTenureMonths}
                  onChangeText={form.setExactNewTenureMonths}
                  keyboardType="numeric"
                  placeholder="e.g. 42 (Leave blank for Finzo's estimate)"
                />
                <View style={styles.brokenPeriodHint}>
                  <AppIcon icon={Info} size={12} color={currentTheme.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
                  <AppText variant="caption" color={currentTheme.textMuted} style={{ flex: 1, fontSize: 11 }}>
                    Leave blank to auto-calculate. Fill only if your bank schedule specifies exact remaining months.
                  </AppText>
                </View>
              </View>
            )}
          </View>
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

        {/* Broken Period Interest — only for Prepayments */}
        {form.paymentType === PAYMENT_TYPES.PREPAYMENT && (
          <View style={styles.brokenPeriodSection}>
            <MoneyInput
              label="Broken Period Interest (Optional)"
              value={form.brokenPeriodInterest}
              onChangeValue={form.setBrokenPeriodInterest}
              placeholder="e.g. 1847"
            />
            <View style={styles.brokenPeriodHint}>
              <AppIcon icon={Info} size={12} color={currentTheme.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
              <AppText variant="caption" color={currentTheme.textMuted} style={{ flex: 1, fontSize: 11 }}>
                Interest charged by bank for days between last EMI date and prepayment date
              </AppText>
            </View>
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
          <>
            {numBrokenPeriod > 0 ? (
              <>
                <View style={styles.previewRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Broken Period Interest:
                  </AppText>
                  <AppText variant="bodySmall" color={currentTheme.warning} style={{ fontWeight: '600' }}>
                    {formatCurrency(numBrokenPeriod)}
                  </AppText>
                </View>
                <View style={styles.previewRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Principal Reduction:
                  </AppText>
                  <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {formatCurrency(Math.max(0, numAmount - numBrokenPeriod))}
                  </AppText>
                </View>
              </>
            ) : (
              <View style={styles.previewRow}>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Principal Reduction (100%):
                </AppText>
                <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  {formatCurrency(numAmount)}
                </AppText>
              </View>
            )}
          </>
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

      {/* Late Payment Notice */}
      {form.isLatePayment && (
        <View style={styles.lateAlertBanner}>
          <AppIcon icon={Clock} size={16} color="#B45309" style={{ marginRight: 8, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption" style={{ color: '#92400E', fontWeight: '700' }}>
              Late Payment Detected ({form.daysLate} day{form.daysLate > 1 ? 's' : ''} overdue)
            </AppText>
            <AppText variant="caption" style={{ color: '#B45309', marginTop: 2 }}>
              Did your bank charge an overdue penalty or bounce fee? You can record it under Bank Details below.
            </AppText>
          </View>
        </View>
      )}

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
              Enter exact bank interest, principal, balance, or penalties
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

            <MoneyInput
              label="Penalty / Charges from Bank (Optional)"
              value={form.penaltyAmount}
              onChangeValue={form.setPenaltyAmount}
              placeholder="e.g. 500"
            />
            <View style={[styles.brokenPeriodHint, { marginBottom: 12 }]}>
              <AppIcon icon={Info} size={12} color={currentTheme.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
              <AppText variant="caption" color={currentTheme.textMuted} style={{ flex: 1, fontSize: 11 }}>
                EMI bounce fee, late charges, or prepayment penalty from bank
              </AppText>
            </View>

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
  strategySection: {
    marginBottom: 14,
  },
  strategyLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  strategyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  strategyTile: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  overrideContainer: {
    marginTop: 12,
  },
  brokenPeriodSection: {
    marginBottom: 4,
  },
  brokenPeriodHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
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
  lateAlertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
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

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp, Info, ShieldCheck, Plus } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import AppCard from '../../../components/cards/AppCard';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import MoneyInput from '../../../components/forms/MoneyInput';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ROUTES } from '../../../navigation/routes';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { formatCurrency } from '../../../utils/financeFormatters';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import {
  simulateLoanPrepayment,
  SIMULATION_STRATEGIES,
} from '../utils/loanPrepaymentSimulation';

const PRESET_AMOUNTS = [
  { label: '₹10K', value: 10000 },
  { label: '₹25K', value: 25000 },
  { label: '₹50K', value: 50000 },
  { label: '₹1L', value: 100000 },
];

export const LoanPrepaymentSimulatorScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));

  const [prepaymentAmount, setPrepaymentAmount] = useState(50000);
  const [strategy, setStrategy] = useState(SIMULATION_STRATEGIES.REDUCE_TENURE);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const simulation = useMemo(() => {
    if (!loan) return null;
    return simulateLoanPrepayment({
      loan,
      payments,
      prepaymentAmount,
      strategy,
    });
  }, [loan, payments, prepaymentAmount, strategy]);

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Prepayment Simulator"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFoundContainer}>
          <AppText variant="bodyMedium">Target loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const isBankConfirmed = simulation?.assumptions?.isBankConfirmed;

  const handleRecordPrepayment = () => {
    const numAmount = Number(prepaymentAmount) || 0;
    navigation.navigate(ROUTES.ADD_PAYMENT, {
      loanId: loan.id,
      initialValues: {
        paymentType: PAYMENT_TYPES.PREPAYMENT,
        amount: numAmount > 0 ? String(numAmount) : '',
      },
    });
  };

  const bottomListPadding = Math.max(insets.bottom + 24, 34);

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Prepayment Simulator"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack(), accessibilityLabel: 'Go back' }}
        />
      }
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomListPadding }]}
    >
      {/* Read-Only Disclaimer Banner */}
      <View style={[styles.disclaimerBanner, { backgroundColor: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
        <AppIcon icon={Sparkles} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
        <AppText variant="caption" color={currentTheme.textSecondary} style={{ flex: 1 }}>
          <AppText variant="caption" style={{ fontWeight: '700', color: currentTheme.primary }}>What-If Simulation: </AppText>
          Hypothetical scenario only. Your actual loan will not be modified unless you tap "Record this prepayment".
        </AppText>
      </View>

      {/* Current Loan State Summary Card */}
      <AppCard style={styles.stateCard}>
        <View style={styles.stateHeaderRow}>
          <AppText variant="caption" color={currentTheme.textSecondary}>
            Starting Outstanding Balance
          </AppText>
          <View style={[styles.badge, { backgroundColor: isBankConfirmed ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.15)' }]}>
            <AppIcon icon={isBankConfirmed ? ShieldCheck : Info} size={12} color={isBankConfirmed ? currentTheme.success : currentTheme.textSecondary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={isBankConfirmed ? currentTheme.success : currentTheme.textSecondary} style={styles.badgeText}>
              {isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}
            </AppText>
          </View>
        </View>

        <AppText variant="screenTitle" color={currentTheme.textPrimary} style={styles.outstandingAmount}>
          {formatCurrency(simulation?.before?.outstandingBalance || 0)}
        </AppText>

        <View style={[styles.metricsStrip, { borderColor: currentTheme.border }]}>
          <View style={styles.metricItem}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Monthly EMI</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              {formatCurrency(loan.emiAmount)}
            </AppText>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Interest Rate</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              {loan.annualInterestRate}% p.a.
            </AppText>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <AppText variant="caption" color={currentTheme.textSecondary}>Remaining</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              {simulation?.before?.remainingMonths || loan.remainingTenureMonths} mo
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Input Section: Prepayment Amount & Strategy Selection */}
      <AppCard style={styles.inputCard}>
        <AppText variant="sectionTitle" style={styles.cardHeading}>
          Hypothetical Prepayment
        </AppText>

        <MoneyInput
          label="Prepayment Amount"
          value={prepaymentAmount}
          onChangeValue={(val) => setPrepaymentAmount(val)}
          placeholder="0"
          accessibilityLabel="Enter hypothetical prepayment amount"
        />

        {/* Quick Amount Chips */}
        <View style={styles.chipRow}>
          {PRESET_AMOUNTS.map((preset) => {
            const isSelected = Number(prepaymentAmount) === Number(preset.value);
            return (
              <TouchableOpacity
                key={preset.value}
                onPress={() => setPrepaymentAmount(preset.value)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? currentTheme.primary : currentTheme.surfaceVariant,
                    borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                  style={{ fontWeight: isSelected ? '700' : '500' }}
                >
                  {preset.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Strategy Switcher: [ Reduce Tenure ] [ Reduce EMI ] */}
        <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.strategyLabel}>
          Prepayment Strategy
        </AppText>

        <View style={[styles.strategySegmentBg, { backgroundColor: currentTheme.surfaceVariant }]}>
          <TouchableOpacity
            onPress={() => setStrategy(SIMULATION_STRATEGIES.REDUCE_TENURE)}
            activeOpacity={0.7}
            style={[
              styles.strategySegmentBtn,
              strategy === SIMULATION_STRATEGIES.REDUCE_TENURE && [styles.strategySegmentActive, { backgroundColor: currentTheme.surface }],
            ]}
          >
            <AppText
              variant="bodySmall"
              color={strategy === SIMULATION_STRATEGIES.REDUCE_TENURE ? currentTheme.primary : currentTheme.textSecondary}
              style={{ fontWeight: strategy === SIMULATION_STRATEGIES.REDUCE_TENURE ? '700' : '500' }}
            >
              Reduce Tenure
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStrategy(SIMULATION_STRATEGIES.REDUCE_EMI)}
            activeOpacity={0.7}
            style={[
              styles.strategySegmentBtn,
              strategy === SIMULATION_STRATEGIES.REDUCE_EMI && [styles.strategySegmentActive, { backgroundColor: currentTheme.surface }],
            ]}
          >
            <AppText
              variant="bodySmall"
              color={strategy === SIMULATION_STRATEGIES.REDUCE_EMI ? currentTheme.primary : currentTheme.textSecondary}
              style={{ fontWeight: strategy === SIMULATION_STRATEGIES.REDUCE_EMI ? '700' : '500' }}
            >
              Reduce EMI
            </AppText>
          </TouchableOpacity>
        </View>
      </AppCard>

      {/* Simulation Result Hero Card */}
      {simulation && simulation.success && (
        <AppCard style={[styles.resultCard, { backgroundColor: currentTheme.primaryLight }]}>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            ESTIMATED SAVINGS
          </AppText>

          <View style={styles.savingsRow}>
            <AppText variant="screenTitle" color={currentTheme.primary} style={{ fontWeight: '800', fontSize: 32 }}>
              {formatCurrency(simulation.savings.interestSaved)}
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginLeft: 8 }}>
              saved in interest
            </AppText>
          </View>

          <View style={styles.savingsSubGrid}>
            {strategy === SIMULATION_STRATEGIES.REDUCE_TENURE ? (
              <View style={styles.savingsSubItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Tenure Reduction</AppText>
                <AppText variant="titleMedium" color={currentTheme.textPrimary} style={{ fontWeight: '700' }}>
                  {simulation.savings.monthsSaved} months saved
                </AppText>
              </View>
            ) : (
              <>
                <View style={styles.savingsSubItem}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>New Monthly EMI</AppText>
                  <AppText variant="titleMedium" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {formatCurrency(simulation.after.emi)} / mo
                  </AppText>
                </View>
                <View style={styles.savingsSubItem}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Monthly Cashflow Saving</AppText>
                  <AppText variant="titleMedium" color={currentTheme.success} style={{ fontWeight: '700' }}>
                    {formatCurrency(simulation.savings.monthlyEmiSavings)} / mo
                  </AppText>
                </View>
              </>
            )}
          </View>

          {simulation.warning && (
            <View style={styles.warningBox}>
              <AppText variant="caption" color="#B45309">
                ⚠️ {simulation.warning}
              </AppText>
            </View>
          )}
        </AppCard>
      )}

      {/* Before / After Comparison Table */}
      {simulation && simulation.success && (
        <AppCard style={styles.comparisonCard}>
          <AppText variant="sectionTitle" style={styles.cardHeading}>
            Before vs After Comparison
          </AppText>

          <View style={styles.tableHeaderRow}>
            <AppText variant="caption" style={[styles.colLeft, { fontWeight: '700' }]}>Metric</AppText>
            <AppText variant="caption" style={[styles.colMid, { fontWeight: '700' }]}>Current</AppText>
            <AppText variant="caption" style={[styles.colRight, { fontWeight: '700' }]}>After Prepayment</AppText>
          </View>

          <View style={[styles.tableRow, { borderColor: currentTheme.border }]}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.colLeft}>Outstanding</AppText>
            <AppText variant="bodySmall" style={styles.colMid}>{formatCurrency(simulation.before.outstandingBalance)}</AppText>
            <AppText variant="bodySmall" style={[styles.colRight, { fontWeight: '700' }]}>{formatCurrency(simulation.after.outstandingBalance)}</AppText>
          </View>

          <View style={[styles.tableRow, { borderColor: currentTheme.border }]}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.colLeft}>Monthly EMI</AppText>
            <AppText variant="bodySmall" style={styles.colMid}>{formatCurrency(simulation.before.emi)}</AppText>
            <AppText variant="bodySmall" style={[styles.colRight, { fontWeight: '700', color: strategy === SIMULATION_STRATEGIES.REDUCE_EMI ? currentTheme.primary : currentTheme.textPrimary }]}>
              {formatCurrency(simulation.after.emi)}
            </AppText>
          </View>

          <View style={[styles.tableRow, { borderColor: currentTheme.border }]}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.colLeft}>Remaining Tenure</AppText>
            <AppText variant="bodySmall" style={styles.colMid}>{simulation.before.remainingMonths} mo</AppText>
            <AppText variant="bodySmall" style={[styles.colRight, { fontWeight: '700', color: strategy === SIMULATION_STRATEGIES.REDUCE_TENURE ? currentTheme.primary : currentTheme.textPrimary }]}>
              {simulation.after.remainingMonths} mo
            </AppText>
          </View>

          <View style={[styles.tableRow, { borderColor: currentTheme.border }]}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.colLeft}>Total Interest</AppText>
            <AppText variant="bodySmall" style={styles.colMid}>{formatCurrency(simulation.before.remainingInterest)}</AppText>
            <AppText variant="bodySmall" style={[styles.colRight, { fontWeight: '700' }]}>{formatCurrency(simulation.after.remainingInterest)}</AppText>
          </View>

          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <AppText variant="bodySmall" style={[styles.colLeft, { fontWeight: '700' }]}>Interest Saved</AppText>
            <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.colMid}>—</AppText>
            <AppText variant="bodySmall" color={currentTheme.primary} style={[styles.colRight, { fontWeight: '800' }]}>
              {formatCurrency(simulation.savings.interestSaved)}
            </AppText>
          </View>
        </AppCard>
      )}

      {/* Expandable "How this simulation works" */}
      <AppCard style={styles.howCard}>
        <TouchableOpacity
          onPress={() => setShowHowItWorks(!showHowItWorks)}
          activeOpacity={0.7}
          style={styles.howHeaderRow}
        >
          <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
            How this simulation works
          </AppText>
          <AppIcon icon={showHowItWorks ? ChevronUp : ChevronDown} size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {showHowItWorks && (
          <View style={styles.howBody}>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.howParagraph}>
              • Starts from your active balance ({isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}).
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.howParagraph}>
              • Applies hypothetical prepayment 100% to principal reduction.
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.howParagraph}>
              • Assumes the annual interest rate ({loan.annualInterestRate}%) remains unchanged.
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.howParagraph}>
              • In Reduce Tenure mode, keeps monthly EMI unchanged and calculates earlier payoff.
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.howParagraph}>
              • In Reduce EMI mode, keeps target tenure constant and recalculates lower monthly payment.
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textMuted} style={styles.howParagraph}>
              • Actual lender prepayment processing or fees may vary. This tool does not mutate your stored loan until recorded.
            </AppText>
          </View>
        )}
      </AppCard>

      {/* Action Button: Record this prepayment */}
      <View style={styles.actionContainer}>
        <PrimaryButton
          title="Record this prepayment"
          icon={Plus}
          onPress={handleRecordPrepayment}
          accessibilityLabel="Record this prepayment into loan payment history"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  notFoundContainer: {
    padding: 32,
    alignItems: 'center',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  stateCard: {
    padding: 16,
    marginBottom: 16,
  },
  stateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
  },
  outstandingAmount: {
    fontWeight: '800',
    marginBottom: 14,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  inputCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  strategyLabel: {
    marginTop: 8,
    marginBottom: 8,
  },
  strategySegmentBg: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  strategySegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  strategySegmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 12,
  },
  savingsSubGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
  },
  savingsSubItem: {
    flex: 1,
  },
  warningBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  comparisonCard: {
    padding: 16,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  colLeft: {
    flex: 1.2,
  },
  colMid: {
    flex: 1,
    textAlign: 'center',
  },
  colRight: {
    flex: 1.2,
    textAlign: 'right',
  },
  howCard: {
    padding: 16,
    marginBottom: 20,
  },
  howHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  howBody: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  howParagraph: {
    marginBottom: 6,
    lineHeight: 18,
  },
  actionContainer: {
    marginBottom: 16,
  },
});

export default LoanPrepaymentSimulatorScreen;

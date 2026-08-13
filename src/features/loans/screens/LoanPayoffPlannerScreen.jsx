import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingDown,
  Layers,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import AppCard from '../../../components/cards/AppCard';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import MoneyInput from '../../../components/forms/MoneyInput';
import TextInputField from '../../../components/forms/TextInputField';
import SelectField from '../../../components/forms/SelectField';
import SaveGoalModal from '../components/SaveGoalModal';
import { ROUTES } from '../../../navigation/routes';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { formatCurrency } from '../../../utils/financeFormatters';
import { getCurrentLoanBalance } from '../utils/paymentBalanceUtils';
import {
  simulateLoanScenario,
  SCENARIO_TYPES,
} from '../utils/loanScenarioEngine';
import { getLoanReportAdapter, generateAndShareReport } from '../../reports';

const PRESET_EXTRA_EMIS = [
  { label: '+₹1,000', value: 1000 },
  { label: '+₹2,000', value: 2000 },
  { label: '+₹5,000', value: 5000 },
  { label: '+₹10,000', value: 10000 },
];

const SCENARIO_TABS = [
  { id: SCENARIO_TYPES.EXTRA_MONTHLY, label: 'Extra Monthly' },
  { id: SCENARIO_TYPES.INCREASED_EMI, label: 'New EMI' },
  { id: SCENARIO_TYPES.ONE_TIME_PREPAYMENT, label: '1-Time Prepay' },
  { id: SCENARIO_TYPES.MULTIPLE_PREPAYMENTS, label: 'Multi Prepay' },
  { id: SCENARIO_TYPES.TARGET_PAYOFF_DATE, label: 'Target Date' },
];

export const LoanPayoffPlannerScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));

  const [activeTab, setActiveTab] = useState(SCENARIO_TYPES.EXTRA_MONTHLY);
  const [extraMonthlyAmount, setExtraMonthlyAmount] = useState(5000);
  const [newEmi, setNewEmi] = useState(loan ? loan.emiAmount + 5000 : 25000);
  const [oneTimeAmount, setOneTimeAmount] = useState(100000);
  const [oneTimeMonthIndex, setOneTimeMonthIndex] = useState(6);
  const [multiplePrepayments, setMultiplePrepayments] = useState([
    { id: '1', monthIndex: 6, amount: 50000, label: 'Annual Bonus' },
    { id: '2', monthIndex: 12, amount: 50000, label: 'Tax Refund' },
  ]);
  const [targetMonths, setTargetMonths] = useState(36);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [comparedScenarios, setComparedScenarios] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [saveGoalModalVisible, setSaveGoalModalVisible] = useState(false);

  const balanceState = useMemo(() => {
    if (!loan) return null;
    return getCurrentLoanBalance(loan, payments);
  }, [loan, payments]);

  const activeScenarioConfig = useMemo(() => {
    switch (activeTab) {
      case SCENARIO_TYPES.EXTRA_MONTHLY:
        return { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount };
      case SCENARIO_TYPES.INCREASED_EMI:
        return { type: SCENARIO_TYPES.INCREASED_EMI, newEmi };
      case SCENARIO_TYPES.ONE_TIME_PREPAYMENT:
        return { type: SCENARIO_TYPES.ONE_TIME_PREPAYMENT, amount: oneTimeAmount, monthIndex: oneTimeMonthIndex };
      case SCENARIO_TYPES.MULTIPLE_PREPAYMENTS:
        return { type: SCENARIO_TYPES.MULTIPLE_PREPAYMENTS, prepayments: multiplePrepayments };
      case SCENARIO_TYPES.TARGET_PAYOFF_DATE:
        return { type: SCENARIO_TYPES.TARGET_PAYOFF_DATE, targetMonths };
      default:
        return { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount };
    }
  }, [activeTab, extraMonthlyAmount, newEmi, oneTimeAmount, oneTimeMonthIndex, multiplePrepayments, targetMonths]);

  const simulation = useMemo(() => {
    if (!loan) return null;
    return simulateLoanScenario({
      loan,
      payments,
      scenario: activeScenarioConfig,
    });
  }, [loan, payments, activeScenarioConfig]);

  if (!loan || !balanceState) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Payoff Planner"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleAddPrepaymentRow = () => {
    const nextId = String(Date.now());
    setMultiplePrepayments([
      ...multiplePrepayments,
      { id: nextId, monthIndex: 12, amount: 25000, label: 'Planned Prepayment' },
    ]);
  };

  const handleRemovePrepaymentRow = (id) => {
    setMultiplePrepayments(multiplePrepayments.filter((p) => p.id !== id));
  };

  const handleUpdatePrepaymentRow = (id, key, value) => {
    setMultiplePrepayments(
      multiplePrepayments.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
  };

  const handleAddScenarioToComparison = () => {
    if (!simulation || !simulation.success) return;
    if (comparedScenarios.length >= 3) {
      Alert.alert('Comparison Full', 'You can compare up to 3 scenarios at a time.');
      return;
    }
    const nameMap = {
      [SCENARIO_TYPES.EXTRA_MONTHLY]: `+${formatCurrency(extraMonthlyAmount)}/mo`,
      [SCENARIO_TYPES.INCREASED_EMI]: `EMI ${formatCurrency(newEmi)}`,
      [SCENARIO_TYPES.ONE_TIME_PREPAYMENT]: `Prepay ${formatCurrency(oneTimeAmount)}`,
      [SCENARIO_TYPES.MULTIPLE_PREPAYMENTS]: `${multiplePrepayments.length} Prepayments`,
      [SCENARIO_TYPES.TARGET_PAYOFF_DATE]: `Target ${targetMonths} mos`,
    };

    setComparedScenarios([
      ...comparedScenarios,
      {
        id: String(Date.now()),
        name: nameMap[activeTab] || 'Scenario',
        simulation,
      },
    ]);
  };

  const handleExportScenarioPdf = async () => {
    if (!simulation || !simulation.success) return;
    setIsExporting(true);
    try {
      const reportModel = {
        title: `Payoff Scenario — ${loan.name}`,
        subtitle: `Hypothetical What-If Plan (${simulation.tenureReduction.formattedTenureReduction})`,
        reportType: 'calculator',
        calculatorType: 'emi',
        generatedAt: new Date().toISOString(),
        summaryCards: [
          { label: 'Current Balance', value: formatCurrency(simulation.startingBalance) },
          { label: 'Simulated EMI', value: formatCurrency(simulation.simulatedEmi), highlight: true },
          { label: 'Potential Interest Avoided', value: simulation.interestImpact.formattedInterestAvoided, color: '#10B981' },
          { label: 'Estimated Payoff Date', value: simulation.estimatedPayoffDate, color: '#2563EB' },
        ],
        sections: [
          {
            title: 'Hypothetical Scenario Details',
            type: 'key_value',
            items: [
              { label: 'Scenario Strategy', value: activeTab.replace('_', ' ').toUpperCase() },
              { label: 'Baseline Remaining Tenure', value: `${simulation.baseline.estimatedRemainingMonths} months` },
              { label: 'Simulated Remaining Tenure', value: `${simulation.estimatedRemainingMonths} months` },
              { label: 'Estimated Tenure Reduction', value: simulation.tenureReduction.formattedTenureReduction, highlight: true },
              { label: 'Baseline Remaining Interest', value: formatCurrency(simulation.baseline.totalInterest) },
              { label: 'Simulated Total Interest', value: formatCurrency(simulation.totalSimulatedInterest) },
              { label: 'Potential Interest Avoided', value: simulation.interestImpact.formattedInterestAvoided, highlight: true },
            ],
          },
        ],
        assumptions: [
          'Hypothetical Scenario Report — Not an actual payment record.',
          'Future projections assume interest rate remains constant at ' + loan.annualInterestRate + '% p.a.',
          'Calculations are 100% read-only and do not mutate your actual loan balance or payment history.',
        ],
        disclaimer: 'Finzo Scenario Planner — Informational estimates only.',
      };

      await generateAndShareReport(reportModel);
    } catch (err) {
      Alert.alert('PDF Generation Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Loan Payoff Planner"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      {/* Current Loan Baseline Banner */}
      <AppCard style={styles.baselineCard}>
        <View style={styles.baselineHeader}>
          <AppIcon icon={Compass} size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
          <AppText variant="cardTitle">Current Baseline Plan</AppText>
        </View>

        <View style={styles.baselineGrid}>
          <View style={styles.baselineItem}>
            <AppText variant="caption" color={currentTheme.textMuted}>Outstanding Balance</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>{formatCurrency(balanceState.currentBalance)}</AppText>
          </View>
          <View style={styles.baselineItem}>
            <AppText variant="caption" color={currentTheme.textMuted}>Configured EMI</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>{formatCurrency(loan.emiAmount)}</AppText>
          </View>
          <View style={styles.baselineItem}>
            <AppText variant="caption" color={currentTheme.textMuted}>Estimated Payoff</AppText>
            <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
              {simulation?.baseline?.estimatedPayoffDate || 'N/A'}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Scenario Type Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabsRow}>
          {SCENARIO_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isActive ? currentTheme.primary : currentTheme.surface,
                    borderColor: isActive ? currentTheme.primary : currentTheme.border,
                  },
                ]}
              >
                <AppText
                  variant="bodySmall"
                  color={isActive ? '#FFFFFF' : currentTheme.textSecondary}
                  style={{ fontWeight: isActive ? '700' : '500' }}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Scenario Inputs */}
      <AppCard style={styles.inputCard}>
        {activeTab === SCENARIO_TYPES.EXTRA_MONTHLY && (
          <View>
            <AppText variant="sectionTitle" style={styles.inputTitle}>Extra Monthly Payment</AppText>
            <MoneyInput
              label="Additional Monthly Commitment"
              value={extraMonthlyAmount}
              onChangeText={setExtraMonthlyAmount}
            />
            <View style={styles.presetRow}>
              {PRESET_EXTRA_EMIS.map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => setExtraMonthlyAmount(preset.value)}
                  style={[styles.presetChip, { borderColor: currentTheme.border }]}
                >
                  <AppText variant="caption" color={currentTheme.primary}>{preset.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === SCENARIO_TYPES.INCREASED_EMI && (
          <View>
            <AppText variant="sectionTitle" style={styles.inputTitle}>Simulated EMI Amount</AppText>
            <MoneyInput
              label="New Monthly EMI Amount"
              value={newEmi}
              onChangeText={setNewEmi}
            />
          </View>
        )}

        {activeTab === SCENARIO_TYPES.ONE_TIME_PREPAYMENT && (
          <View>
            <AppText variant="sectionTitle" style={styles.inputTitle}>One-Time Lump Sum Prepayment</AppText>
            <MoneyInput
              label="Prepayment Amount"
              value={oneTimeAmount}
              onChangeText={setOneTimeAmount}
            />
            <TextInputField
              label="Prepayment Month (e.g. Month 6)"
              value={String(oneTimeMonthIndex)}
              onChangeText={(val) => setOneTimeMonthIndex(Number(val) || 1)}
              keyboardType="numeric"
            />
          </View>
        )}

        {activeTab === SCENARIO_TYPES.MULTIPLE_PREPAYMENTS && (
          <View>
            <View style={styles.prepaymentHeaderRow}>
              <AppText variant="sectionTitle">Planned Prepayments</AppText>
              <TouchableOpacity onPress={handleAddPrepaymentRow} style={styles.addRowBtn}>
                <AppIcon icon={Plus} size={16} color={currentTheme.primary} />
                <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700', marginLeft: 4 }}>
                  Add Prepayment
                </AppText>
              </TouchableOpacity>
            </View>

            {multiplePrepayments.map((prep, idx) => (
              <View key={prep.id} style={[styles.prepaymentRowCard, { borderColor: currentTheme.border }]}>
                <View style={styles.rowTop}>
                  <AppText variant="bodySmall" style={{ fontWeight: '700' }}>Prepayment #{idx + 1}</AppText>
                  {multiplePrepayments.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemovePrepaymentRow(prep.id)}>
                      <AppIcon icon={Trash2} size={16} color={currentTheme.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInputField
                  label="Label / Purpose"
                  value={prep.label}
                  onChangeText={(val) => handleUpdatePrepaymentRow(prep.id, 'label', val)}
                />
                <MoneyInput
                  label="Amount"
                  value={prep.amount}
                  onChangeText={(val) => handleUpdatePrepaymentRow(prep.id, 'amount', Number(val) || 0)}
                />
                <TextInputField
                  label="Month Number (e.g. 6)"
                  value={String(prep.monthIndex)}
                  onChangeText={(val) => handleUpdatePrepaymentRow(prep.id, 'monthIndex', Number(val) || 1)}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === SCENARIO_TYPES.TARGET_PAYOFF_DATE && (
          <View>
            <AppText variant="sectionTitle" style={styles.inputTitle}>Target Payoff Duration</AppText>
            <TextInputField
              label="Target Time Horizon (Months)"
              value={String(targetMonths)}
              onChangeText={(val) => setTargetMonths(Number(val) || 1)}
              keyboardType="numeric"
            />
          </View>
        )}
      </AppCard>

      {/* Simulation Results & Impact Hero */}
      {simulation && simulation.success ? (
        <View style={styles.resultsContainer}>
          <AppCard style={[styles.heroImpactCard, { borderColor: currentTheme.primary }]}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroBadge}>
                <AppIcon icon={Sparkles} size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  What-If Potential Impact
                </AppText>
              </View>
              <AppText variant="caption" color={currentTheme.textMuted}>Read-Only Estimate</AppText>
            </View>

            <View style={styles.impactGrid}>
              <View style={styles.impactItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Estimated Tenure Savings</AppText>
                <AppText variant="cardTitle" color="#10B981" style={{ fontWeight: '800', marginTop: 2 }}>
                  {simulation.tenureReduction.formattedTenureReduction}
                </AppText>
              </View>

              <View style={styles.impactItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Potential Interest Avoided</AppText>
                <AppText variant="cardTitle" color="#10B981" style={{ fontWeight: '800', marginTop: 2 }}>
                  {simulation.interestImpact.formattedInterestAvoided}
                </AppText>
              </View>
            </View>

            <View style={[styles.payoffComparisonRow, { borderTopColor: currentTheme.border }]}>
              <View>
                <AppText variant="caption" color={currentTheme.textMuted}>Simulated Payoff Date</AppText>
                <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>{simulation.estimatedPayoffDate}</AppText>
              </View>
              <AppIcon icon={ArrowRight} size={16} color={currentTheme.textMuted} />
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="caption" color={currentTheme.textMuted}>Simulated Monthly EMI</AppText>
                <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>{formatCurrency(simulation.simulatedEmi)}</AppText>
              </View>
            </View>

            <View style={styles.disclaimerNote}>
              <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ fontSize: 11 }}>
                * Calculated as a read-only scenario. Does not alter your real loan profile, recorded payments, or bank reminders.
              </AppText>
            </View>
          </AppCard>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <PrimaryButton
              title="Save as Personal Goal"
              icon={Target}
              onPress={() => setSaveGoalModalVisible(true)}
              style={styles.actionBtn}
            />
            <SecondaryButton
              title="Add to Comparison Matrix"
              icon={Layers}
              onPress={handleAddScenarioToComparison}
              style={styles.actionBtn}
            />
            <SecondaryButton
              title={isExporting ? 'Preparing Report...' : 'Export Scenario (PDF)'}
              icon={FileText}
              onPress={handleExportScenarioPdf}
              disabled={isExporting}
              style={styles.actionBtn}
            />
          </View>

          {/* Side-by-Side Comparison Matrix */}
          {comparedScenarios.length > 0 && (
            <AppCard style={styles.matrixCard}>
              <AppText variant="sectionTitle" style={styles.matrixTitle}>
                Scenario Comparison Matrix ({comparedScenarios.length}/3)
              </AppText>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.matrixTable}>
                  <View style={styles.matrixHeaderRow}>
                    <AppText variant="caption" style={[styles.matrixCell, { fontWeight: '700' }]}>Scenario</AppText>
                    <AppText variant="caption" style={[styles.matrixCell, { fontWeight: '700' }]}>Simulated EMI</AppText>
                    <AppText variant="caption" style={[styles.matrixCell, { fontWeight: '700' }]}>Payoff Date</AppText>
                    <AppText variant="caption" style={[styles.matrixCell, { fontWeight: '700' }]}>Interest Avoided</AppText>
                    <AppText variant="caption" style={[styles.matrixCell, { fontWeight: '700' }]}>Tenure Savings</AppText>
                  </View>

                  {comparedScenarios.map((item) => (
                    <View key={item.id} style={styles.matrixBodyRow}>
                      <AppText variant="bodySmall" style={[styles.matrixCell, { fontWeight: '600' }]}>{item.name}</AppText>
                      <AppText variant="bodySmall" style={styles.matrixCell}>{formatCurrency(item.simulation.simulatedEmi)}</AppText>
                      <AppText variant="bodySmall" style={styles.matrixCell}>{item.simulation.estimatedPayoffDate}</AppText>
                      <AppText variant="bodySmall" color="#10B981" style={[styles.matrixCell, { fontWeight: '700' }]}>
                        {item.simulation.interestImpact.formattedInterestAvoided}
                      </AppText>
                      <AppText variant="bodySmall" color="#10B981" style={[styles.matrixCell, { fontWeight: '700' }]}>
                        {item.simulation.tenureReduction.formattedTenureReduction}
                      </AppText>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </AppCard>
          )}

          {/* Compact Schedule Preview */}
          <AppCard style={styles.scheduleCard}>
            <TouchableOpacity
              onPress={() => setIsScheduleExpanded(!isScheduleExpanded)}
              activeOpacity={0.8}
              style={styles.scheduleHeaderRow}
            >
              <AppText variant="cardTitle">Simulated Amortization Schedule</AppText>
              <AppIcon icon={isScheduleExpanded ? ChevronUp : ChevronDown} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>

            {(isScheduleExpanded ? simulation.schedule : simulation.compactSchedule).map((row) => (
              <View key={row.month} style={[styles.scheduleRow, { borderBottomColor: currentTheme.border }]}>
                <AppText variant="bodySmall" style={{ width: 60 }}>{row.monthLabel}</AppText>
                <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ flex: 1, textAlign: 'right' }}>
                  Interest: {formatCurrency(row.interest)}
                </AppText>
                <AppText variant="bodySmall" color={currentTheme.primary} style={{ flex: 1, textAlign: 'right', fontWeight: '600' }}>
                  Principal: {formatCurrency(row.principal + row.prepayment)}
                </AppText>
                <AppText variant="bodySmall" style={{ flex: 1, textAlign: 'right', fontWeight: '700' }}>
                  {formatCurrency(row.closingBalance)}
                </AppText>
              </View>
            ))}

            {!isScheduleExpanded && (
              <TouchableOpacity
                onPress={() => setIsScheduleExpanded(true)}
                style={styles.expandScheduleBtn}
              >
                <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  View Full Schedule ({simulation.schedule.length} Months)
                </AppText>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>
      ) : (
        <AppCard style={[styles.errorCard, { borderColor: currentTheme.error }]}>
          <AppIcon icon={AlertCircle} size={24} color={currentTheme.error} style={{ marginBottom: 8 }} />
          <AppText variant="bodyMedium" color={currentTheme.error} style={{ fontWeight: '700' }}>
            {simulation?.error || 'Unable to calculate scenario.'}
          </AppText>
        </AppCard>
      )}

      <SaveGoalModal
        visible={saveGoalModalVisible}
        onClose={() => setSaveGoalModalVisible(false)}
        loan={loan}
        payments={payments}
        activeTab={activeTab}
        simulation={simulation}
        scenarioConfig={activeScenarioConfig}
        onGoalSaved={(savedGoal) => {
          navigation.navigate(ROUTES.LOAN_GOALS, { loanId: loan.id });
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  notFound: {
    alignItems: 'center',
    padding: 32,
  },
  baselineCard: {
    padding: 16,
    marginBottom: 14,
  },
  baselineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  baselineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  baselineItem: {
    flex: 1,
  },
  tabsScroll: {
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputCard: {
    padding: 16,
    marginBottom: 16,
  },
  inputTitle: {
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  prepaymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepaymentRowCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsContainer: {
    gap: 14,
    paddingBottom: 40,
  },
  heroImpactCard: {
    padding: 18,
    borderWidth: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  impactItem: {
    flex: 1,
  },
  payoffComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    marginBottom: 10,
  },
  disclaimerNote: {
    marginTop: 4,
  },
  actionRow: {
    gap: 10,
  },
  actionBtn: {
    width: '100%',
  },
  matrixCard: {
    padding: 16,
  },
  matrixTitle: {
    marginBottom: 12,
  },
  matrixTable: {
    minWidth: 480,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  matrixBodyRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  matrixCell: {
    width: 95,
  },
  scheduleCard: {
    padding: 16,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  expandScheduleBtn: {
    alignItems: 'center',
    paddingTop: 14,
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default LoanPayoffPlannerScreen;

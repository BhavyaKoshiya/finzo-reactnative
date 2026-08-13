import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Target,
  PauseCircle,
  PlayCircle,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import {
  selectLoanGoalById,
  deleteLoanGoal,
  pauseLoanGoal,
  resumeLoanGoal,
} from '../../../store/slices/loanGoalsSlice';
import { GOAL_STATUS } from '../types/loanGoalTypes';
import { deriveGoalProgress } from '../utils/loanGoalUtils';
import { formatCurrency } from '../../../utils/financeFormatters';
import { formatLoanDate } from '../utils/loanDateUtils';
import { generateAndShareReport } from '../../reports';

export const LoanGoalDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const [isExporting, setIsExporting] = useState(false);

  const goalId = route?.params?.goalId;
  const loanId = route?.params?.loanId;

  const goal = useSelector((state) => selectLoanGoalById(state, goalId));
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));

  if (!goal || !loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Goal Details"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Goal or loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const derived = deriveGoalProgress({ goal, loan, payments });
  const isPaused = goal.status === GOAL_STATUS.PAUSED;

  const handleTogglePause = () => {
    if (isPaused) {
      dispatch(resumeLoanGoal(goal.id));
      Alert.alert('Goal Resumed', 'Your goal progress tracking has been reactivated.');
    } else {
      dispatch(pauseLoanGoal(goal.id));
      Alert.alert('Goal Paused', 'Your goal is now paused. Projections and alerts are suspended.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this personal goal? Your actual loan balance and payment records will NOT be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteLoanGoal(goal.id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const reportModel = {
        title: `Loan Goal Report — ${goal.title}`,
        subtitle: `Personal Payoff Goal for ${loan.name}`,
        reportType: 'calculator',
        calculatorType: 'emi',
        generatedAt: new Date().toISOString(),
        summaryCards: [
          { label: 'Current Progress', value: `${derived.progressPercentage}%` },
          { label: 'Goal Status', value: derived.statusText, highlight: true },
          { label: 'Baseline Balance', value: formatCurrency(goal.baselineSnapshot.outstandingBalance) },
          { label: 'Current Balance', value: formatCurrency(derived.currentBalance), color: '#2563EB' },
        ],
        sections: [
          {
            title: 'Goal Configuration & Baseline Snapshot',
            type: 'key_value',
            items: [
              { label: 'Goal Type', value: goal.type.replace('_', ' ').toUpperCase() },
              { label: 'Goal Created Date', value: formatLoanDate(goal.createdAt) },
              { label: 'Baseline Outstanding Balance', value: formatCurrency(goal.baselineSnapshot.outstandingBalance) },
              { label: 'Baseline Configured EMI', value: formatCurrency(goal.baselineSnapshot.currentEmi) },
              { label: 'Baseline Interest Rate', value: `${goal.baselineSnapshot.interestRate}% p.a.` },
              { label: 'Baseline Estimated Payoff', value: goal.baselineSnapshot.estimatedPayoffDate },
            ],
          },
        ],
        assumptions: [
          'Personal Goal — Not an actual payment instruction or bank transaction.',
          'Goal progress is calculated from actual recorded payments in Finzo.',
          'Calculations run 100% locally and do not alter your real loan profile or interest rates.',
        ],
        disclaimer: 'Finzo Goal Tracker — Informational personal planning tool.',
      };

      await generateAndShareReport(reportModel);
    } catch (err) {
      Alert.alert('PDF Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Goal Details"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      <View style={styles.container}>
        {/* Goal Hero Header */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.titleWrapper}>
              <AppIcon icon={Target} size={22} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="cardTitle" style={{ flex: 1 }}>{goal.title}</AppText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isPaused ? currentTheme.warning + '20' : '#10B98120' }]}>
              <AppText variant="caption" color={isPaused ? currentTheme.warning : '#10B981'} style={{ fontWeight: '700' }}>
                {isPaused ? 'PAUSED' : derived.statusText}
              </AppText>
            </View>
          </View>

          {goal.description ? (
            <AppText variant="bodySmall" color={currentTheme.textSecondary} style={styles.descText}>
              {goal.description}
            </AppText>
          ) : null}

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: currentTheme.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${derived.progressPercentage}%`, backgroundColor: isPaused ? currentTheme.warning : '#10B981' },
              ]}
            />
          </View>

          <View style={styles.progressMetricsRow}>
            <AppText variant="bodySmall" style={{ fontWeight: '700' }}>{derived.formattedProgress}</AppText>
            <AppText variant="caption" color={currentTheme.textMuted}>{derived.progressPercentage}% Complete</AppText>
          </View>
        </AppCard>

        {/* Baseline Comparison Card ("What changed since you set this goal") */}
        <AppCard style={styles.baselineCard}>
          <AppText variant="sectionTitle" style={styles.sectionTitleText}>
            Baseline Snapshot Comparison
          </AppText>
          <AppText variant="caption" color={currentTheme.textMuted} style={{ marginBottom: 12 }}>
            Goal set on {formatLoanDate(goal.createdAt)} (Ledger v{goal.baselineSnapshot.baselineLedgerVersion})
          </AppText>

          <View style={styles.comparisonGrid}>
            <View style={styles.gridItem}>
              <AppText variant="caption" color={currentTheme.textMuted}>Baseline Balance</AppText>
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                {formatCurrency(goal.baselineSnapshot.outstandingBalance)}
              </AppText>
            </View>

            <View style={styles.gridItem}>
              <AppText variant="caption" color={currentTheme.textMuted}>Current Balance</AppText>
              <AppText variant="bodyMedium" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                {formatCurrency(derived.currentBalance)}
              </AppText>
            </View>

            <View style={styles.gridItem}>
              <AppText variant="caption" color={currentTheme.textMuted}>Baseline Payoff</AppText>
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                {goal.baselineSnapshot.estimatedPayoffDate}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Action Controls */}
        <View style={styles.actionsGroup}>
          <SecondaryButton
            title={isPaused ? 'Resume Goal' : 'Pause Goal'}
            icon={isPaused ? PlayCircle : PauseCircle}
            onPress={handleTogglePause}
          />

          <SecondaryButton
            title={isExporting ? 'Preparing PDF...' : 'Export Goal Report (PDF)'}
            icon={FileText}
            onPress={handleExportPdf}
            disabled={isExporting}
          />

          <SecondaryButton
            title="Delete Goal"
            icon={Trash2}
            onPress={handleDelete}
            style={{ borderColor: currentTheme.error }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  notFound: {
    alignItems: 'center',
    padding: 32,
  },
  container: {
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  descText: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baselineCard: {
    padding: 16,
  },
  sectionTitleText: {
    marginBottom: 4,
  },
  comparisonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  actionsGroup: {
    gap: 10,
    marginTop: 6,
  },
});

export default LoanGoalDetailsScreen;

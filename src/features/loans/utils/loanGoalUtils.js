import { GOAL_TYPES, GOAL_STATUS } from '../types/loanGoalTypes';
import { getCurrentLoanBalance } from './paymentBalanceUtils';
import { simulateLoanScenario, SCENARIO_TYPES } from './loanScenarioEngine';
import { formatCurrency } from '../../../utils/financeFormatters';
import { parseLocalDateStr, formatLoanDate } from './loanDateUtils';

/**
 * Creates an informational baseline snapshot when a goal is established.
 */
export const createGoalBaselineSnapshot = (loan, payments = []) => {
  if (!loan) return {};

  const balanceState = getCurrentLoanBalance(loan, payments);
  const baselineSim = simulateLoanScenario({
    loan,
    payments,
    scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 0 },
  });

  return {
    outstandingBalance: balanceState.currentBalance,
    currentEmi: Number(loan.emiAmount) || 0,
    interestRate: Number(loan.annualInterestRate) || 0,
    estimatedPayoffDate: baselineSim?.baseline?.estimatedPayoffDate || 'N/A',
    estimatedRemainingInterest: baselineSim?.baseline?.totalInterest || 0,
    baselineLedgerVersion: Number(loan.ledgerVersion) || 1,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Pure function to derive goal progress, status, and comparative metrics from authoritative loan ledger state.
 */
export const deriveGoalProgress = ({ goal, loan, payments = [] }) => {
  if (!goal || !loan) {
    return {
      progressPercentage: 0,
      formattedProgress: 'N/A',
      remainingAmount: 0,
      onTrackStatus: 'behind',
      statusText: 'No data',
      isCompleted: false,
    };
  }

  const balanceState = getCurrentLoanBalance(loan, payments);
  const currentBalance = balanceState.currentBalance;

  // Filter payments relevant to this loan (excluding balance corrections from payment contributions)
  const validPayments = payments.filter(
    (p) => p.loanId === loan.id && p.paymentType !== 'balance_correction'
  );

  let progressPercentage = 0;
  let formattedProgress = '';
  let remainingAmount = 0;
  let onTrackStatus = 'on_track';
  let statusText = 'On Track';
  let isCompleted = goal.status === GOAL_STATUS.COMPLETED;

  switch (goal.type) {
    case GOAL_TYPES.EXTRA_MONTHLY_PAYMENT: {
      const targetExtra = Number(goal.scenario.extraMonthlyAmount) || 0;
      const scheduledEmi = Number(loan.emiAmount) || 0;

      // Evaluate payments recorded in current month
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const currentMonthPayments = validPayments.filter((p) => {
        const pDate = p.paymentDate || p.createdAt;
        return pDate && String(pDate).startsWith(currentYearMonth);
      });

      const totalPaidThisMonth = currentMonthPayments.reduce(
        (sum, p) => sum + (Number(p.paymentAmount) || 0),
        0
      );

      const actualExtraPaid = Math.max(0, totalPaidThisMonth - scheduledEmi);
      progressPercentage = targetExtra > 0 ? Math.min(100, Math.round((actualExtraPaid / targetExtra) * 100)) : 0;
      remainingAmount = Math.max(0, targetExtra - actualExtraPaid);

      formattedProgress = `${formatCurrency(actualExtraPaid)} / ${formatCurrency(targetExtra)} extra this month`;

      if (progressPercentage >= 100) {
        onTrackStatus = 'ahead';
        statusText = 'Monthly Goal Met';
      } else if (progressPercentage > 0) {
        onTrackStatus = 'on_track';
        statusText = 'Partial Extra Paid';
      } else {
        onTrackStatus = 'behind';
        statusText = 'Pending Extra Payment';
      }
      break;
    }

    case GOAL_TYPES.PREPAYMENT_TARGET: {
      const targetAmount = Number(goal.scenario.amount) || 0;
      const goalCreatedAtDate = goal.createdAt ? new Date(goal.createdAt) : new Date(0);

      // Sum prepayments recorded on or after goal creation
      const prepaymentsMade = validPayments
        .filter((p) => {
          if (p.paymentType !== 'prepayment') return false;
          const pDate = new Date(p.paymentDate || p.createdAt);
          return pDate >= goalCreatedAtDate;
        })
        .reduce((sum, p) => sum + (Number(p.paymentAmount) || 0), 0);

      progressPercentage = targetAmount > 0 ? Math.min(100, Math.round((prepaymentsMade / targetAmount) * 100)) : 0;
      remainingAmount = Math.max(0, targetAmount - prepaymentsMade);
      formattedProgress = `${formatCurrency(prepaymentsMade)} / ${formatCurrency(targetAmount)} prepayments`;

      if (progressPercentage >= 100) {
        isCompleted = true;
        onTrackStatus = 'completed';
        statusText = 'Prepayment Goal Achieved';
      } else if (progressPercentage >= 50) {
        onTrackStatus = 'on_track';
        statusText = `${progressPercentage}% Achieved`;
      } else {
        onTrackStatus = 'behind';
        statusText = `${formatCurrency(remainingAmount)} remaining`;
      }
      break;
    }

    case GOAL_TYPES.TARGET_BALANCE: {
      const targetBal = Number(goal.scenario.targetBalance) || 0;
      const baselineBal = Number(goal.baselineSnapshot.outstandingBalance) || currentBalance;

      const totalTargetReduction = Math.max(1, baselineBal - targetBal);
      const actualReductionAchieved = Math.max(0, baselineBal - currentBalance);

      progressPercentage = Math.min(100, Math.max(0, Math.round((actualReductionAchieved / totalTargetReduction) * 100)));
      remainingAmount = Math.max(0, currentBalance - targetBal);
      formattedProgress = `Current ${formatCurrency(currentBalance)} → Target ${formatCurrency(targetBal)}`;

      if (currentBalance <= targetBal) {
        isCompleted = true;
        onTrackStatus = 'completed';
        statusText = 'Target Balance Reached';
      } else if (progressPercentage >= 50) {
        onTrackStatus = 'on_track';
        statusText = 'On Track';
      } else {
        onTrackStatus = 'behind';
        statusText = `${formatCurrency(remainingAmount)} to reach target`;
      }
      break;
    }

    case GOAL_TYPES.TARGET_PAYOFF_DATE: {
      const targetMonths = Number(goal.scenario.targetMonths) || 36;
      const sim = simulateLoanScenario({
        loan,
        payments,
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 0 },
      });

      const currentRemainingMonths = sim.estimatedRemainingMonths;
      remainingAmount = Math.max(0, currentRemainingMonths - targetMonths);

      if (currentRemainingMonths <= targetMonths) {
        onTrackStatus = 'ahead';
        statusText = 'Ahead of Target Date';
        progressPercentage = 100;
      } else if (currentRemainingMonths - targetMonths <= 6) {
        onTrackStatus = 'on_track';
        statusText = `~${remainingAmount} months gap`;
        progressPercentage = 75;
      } else {
        onTrackStatus = 'behind';
        statusText = `~${remainingAmount} months behind target`;
        progressPercentage = 40;
      }

      formattedProgress = `Current ${sim.estimatedPayoffDate} (Target: ${targetMonths} mos)`;
      break;
    }

    default:
      break;
  }

  return {
    progressPercentage,
    formattedProgress,
    remainingAmount,
    onTrackStatus,
    statusText,
    isCompleted: isCompleted || currentBalance <= 0,
    currentBalance,
    baselineBalance: goal.baselineSnapshot.outstandingBalance,
  };
};

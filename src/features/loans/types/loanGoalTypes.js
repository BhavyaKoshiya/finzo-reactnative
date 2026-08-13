export const GOAL_TYPES = {
  EXTRA_MONTHLY_PAYMENT: 'extra_monthly_payment',
  TARGET_PAYOFF_DATE: 'target_payoff_date',
  PREPAYMENT_TARGET: 'prepayment_target',
  MULTIPLE_PREPAYMENT_PLAN: 'multiple_prepayment_plan',
  TARGET_BALANCE: 'target_balance',
};

export const GOAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const MAX_ACTIVE_GOALS_PER_LOAN = 5;

/**
 * Normalizes and creates a standard Loan Goal object entity with baseline snapshot.
 */
export const createLoanGoal = ({
  loanId,
  type = GOAL_TYPES.EXTRA_MONTHLY_PAYMENT,
  title = 'My Payoff Goal',
  description = '',
  scenario = {},
  baselineSnapshot = {},
  remindersEnabled = false,
  reminderDay = 5,
  reminderTime = '09:00',
}) => {
  const now = new Date().toISOString();
  return {
    id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    schemaVersion: 1,
    loanId,
    type,
    title: String(title).trim() || 'My Payoff Goal',
    description: String(description).trim(),
    scenario: scenario || {},
    baselineSnapshot: {
      outstandingBalance: Number(baselineSnapshot.outstandingBalance) || 0,
      currentEmi: Number(baselineSnapshot.currentEmi) || 0,
      interestRate: Number(baselineSnapshot.interestRate) || 0,
      estimatedPayoffDate: baselineSnapshot.estimatedPayoffDate || 'N/A',
      estimatedRemainingInterest: Number(baselineSnapshot.estimatedRemainingInterest) || 0,
      baselineLedgerVersion: Number(baselineSnapshot.baselineLedgerVersion) || 1,
      createdAt: now,
    },
    remindersEnabled: Boolean(remindersEnabled),
    reminderDay: Number(reminderDay) || 5,
    reminderTime: reminderTime || '09:00',
    status: GOAL_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
};

import {
  createGoalBaselineSnapshot,
  deriveGoalProgress,
} from '../utils/loanGoalUtils';
import { GOAL_TYPES, GOAL_STATUS } from '../types/loanGoalTypes';

describe('Loan Goal Utilities & Progress Engine', () => {
  const sampleLoan = {
    id: 'loan_goal_1',
    name: 'Home Loan Goal Test',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 800000,
    annualInterestRate: 8.5,
    emiAmount: 12000,
    ledgerVersion: 4,
  };

  const samplePayments = [
    {
      id: 'pay_1',
      loanId: 'loan_goal_1',
      paymentAmount: 17000, // 12000 EMI + 5000 extra
      paymentType: 'regular_emi',
      paymentDate: new Date().toISOString(),
    },
    {
      id: 'pay_prep',
      loanId: 'loan_goal_1',
      paymentAmount: 60000,
      paymentType: 'prepayment',
      paymentDate: new Date().toISOString(),
    },
  ];

  describe('createGoalBaselineSnapshot', () => {
    it('creates an informational baseline snapshot capturing initial state', () => {
      const snapshot = createGoalBaselineSnapshot(sampleLoan, samplePayments);
      expect(snapshot.outstandingBalance).toBe(800000);
      expect(snapshot.currentEmi).toBe(12000);
      expect(snapshot.interestRate).toBe(8.5);
      expect(snapshot.baselineLedgerVersion).toBe(4);
    });
  });

  describe('deriveGoalProgress', () => {
    it('derives progress for Extra Monthly Payment Goal', () => {
      const goal = {
        id: 'g_extra',
        loanId: 'loan_goal_1',
        type: GOAL_TYPES.EXTRA_MONTHLY_PAYMENT,
        scenario: { extraMonthlyAmount: 5000 },
        baselineSnapshot: { outstandingBalance: 800000 },
        status: GOAL_STATUS.ACTIVE,
      };

      const progress = deriveGoalProgress({ goal, loan: sampleLoan, payments: samplePayments });
      expect(progress.progressPercentage).toBe(100); // 5000 paid / 5000 target
      expect(progress.onTrackStatus).toBe('ahead');
    });

    it('derives progress for Prepayment Target Goal', () => {
      const goal = {
        id: 'g_prep',
        loanId: 'loan_goal_1',
        type: GOAL_TYPES.PREPAYMENT_TARGET,
        scenario: { amount: 100000 },
        createdAt: '2026-01-01T00:00:00.000Z',
        baselineSnapshot: { outstandingBalance: 800000 },
        status: GOAL_STATUS.ACTIVE,
      };

      const progress = deriveGoalProgress({ goal, loan: sampleLoan, payments: samplePayments });
      expect(progress.progressPercentage).toBe(60); // 60000 / 100000
      expect(progress.remainingAmount).toBe(40000);
    });

    it('derives progress for Target Balance Goal', () => {
      const goal = {
        id: 'g_bal',
        loanId: 'loan_goal_1',
        type: GOAL_TYPES.TARGET_BALANCE,
        scenario: { targetBalance: 500000 },
        baselineSnapshot: { outstandingBalance: 1000000 },
        status: GOAL_STATUS.ACTIVE,
      };

      // Current balance = 800000. Target = 500000. Baseline = 1000000.
      // Total target reduction = 500000. Actual reduction = 200000.
      // Progress = 200000 / 500000 = 40%
      const progress = deriveGoalProgress({ goal, loan: sampleLoan, payments: samplePayments });
      expect(progress.progressPercentage).toBe(40);
    });
  });

  describe('Strict Non-Mutation Compliance', () => {
    it('calculating goal progress leaves loan and payment objects 100% byte-for-byte unchanged', () => {
      const initialLoanJson = JSON.stringify(sampleLoan);
      const initialPaymentsJson = JSON.stringify(samplePayments);

      const goal = {
        id: 'g_extra',
        loanId: 'loan_goal_1',
        type: GOAL_TYPES.EXTRA_MONTHLY_PAYMENT,
        scenario: { extraMonthlyAmount: 5000 },
        baselineSnapshot: { outstandingBalance: 800000 },
        status: GOAL_STATUS.ACTIVE,
      };

      deriveGoalProgress({ goal, loan: sampleLoan, payments: samplePayments });

      expect(JSON.stringify(sampleLoan)).toBe(initialLoanJson);
      expect(JSON.stringify(samplePayments)).toBe(initialPaymentsJson);
    });
  });
});

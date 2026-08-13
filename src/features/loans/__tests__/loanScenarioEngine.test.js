import {
  simulateLoanScenario,
  calculateRequiredEmiForTargetMonths,
  SCENARIO_TYPES,
} from '../utils/loanScenarioEngine';

describe('Loan Scenario Engine & Payoff Planner', () => {
  const sampleLoan = {
    id: 'loan_plan_1',
    name: 'Home Loan Plan',
    loanType: 'home_loan',
    lenderName: 'HDFC Bank',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 800000,
    userConfirmedBalance: 800000,
    balanceSource: 'bank_confirmed',
    annualInterestRate: 8.5,
    emiAmount: 12000,
    originalTenure: { value: 120, unit: 'months' },
    loanStartDate: '2026-01-01',
    dueDay: 5,
    ledgerVersion: 3,
  };

  const samplePayments = [
    {
      id: 'pay_1',
      loanId: 'loan_plan_1',
      paymentAmount: 12000,
      actualPrincipal: 6333,
      actualInterest: 5667,
      calculationSnapshot: { annualRate: 8.5, estimatedInterest: 5667, estimatedPrincipal: 6333 },
    },
  ];

  const loanB = {
    id: 'loan_plan_b',
    name: 'Car Loan B',
    originalPrincipal: 500000,
    currentOutstandingPrincipal: 400000,
    annualInterestRate: 10,
    emiAmount: 10000,
    ledgerVersion: 1,
  };

  describe('Baseline Calculation', () => {
    it('runs baseline standard amortization starting from authoritative current balance', () => {
      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 0 },
      });

      expect(result.success).toBe(true);
      expect(result.startingBalance).toBe(800000);
      expect(result.estimatedRemainingMonths).toBeGreaterThan(0);
      expect(result.tenureReduction.monthsEarlier).toBe(0);
      expect(result.interestImpact.estimatedInterestAvoided).toBe(0);
    });
  });

  describe('Extra Monthly Payment Scenario', () => {
    it('simulates paying +₹5,000 extra per month', () => {
      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 5000 },
      });

      expect(result.success).toBe(true);
      expect(result.simulatedEmi).toBe(17000); // 12000 + 5000
      expect(result.tenureReduction.monthsEarlier).toBeGreaterThan(0);
      expect(result.interestImpact.estimatedInterestAvoided).toBeGreaterThan(0);
    });
  });

  describe('Increased EMI Scenario', () => {
    it('simulates increasing monthly EMI commitment', () => {
      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.INCREASED_EMI, newEmi: 18000 },
      });

      expect(result.success).toBe(true);
      expect(result.simulatedEmi).toBe(18000);
      expect(result.tenureReduction.monthsEarlier).toBeGreaterThan(0);
    });
  });

  describe('One-Time Lump Sum Prepayment Scenario', () => {
    it('simulates ₹1,00,000 prepayment at month 6', () => {
      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.ONE_TIME_PREPAYMENT, amount: 100000, monthIndex: 6 },
      });

      expect(result.success).toBe(true);
      expect(result.tenureReduction.monthsEarlier).toBeGreaterThan(0);

      // Check month 6 row in schedule
      const month6Row = result.schedule.find((r) => r.month === 6);
      expect(month6Row).toBeDefined();
      expect(month6Row.prepayment).toBe(100000);
    });
  });

  describe('Multiple Prepayments Scenario', () => {
    it('simulates multiple planned lump sum prepayments with deterministic ordering', () => {
      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: {
          type: SCENARIO_TYPES.MULTIPLE_PREPAYMENTS,
          prepayments: [
            { id: '1', monthIndex: 6, amount: 50000, label: 'Bonus' },
            { id: '2', monthIndex: 12, amount: 50000, label: 'Tax Refund' },
          ],
        },
      });

      expect(result.success).toBe(true);
      expect(result.interestImpact.estimatedInterestAvoided).toBeGreaterThan(0);

      const m6 = result.schedule.find((r) => r.month === 6);
      const m12 = result.schedule.find((r) => r.month === 12);

      expect(m6.prepayment).toBe(50000);
      expect(m12.prepayment).toBe(50000);
    });
  });

  describe('Target Payoff Date Scenario', () => {
    it('calculates required EMI for target 36 months horizon', () => {
      const requiredEmi = calculateRequiredEmiForTargetMonths(800000, 8.5, 36);
      expect(requiredEmi).toBeGreaterThan(12000);

      const result = simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.TARGET_PAYOFF_DATE, targetMonths: 36 },
      });

      expect(result.success).toBe(true);
      expect(result.estimatedRemainingMonths).toBeLessThanOrEqual(36);
    });
  });

  describe('Edge Cases & Safety Guards', () => {
    it('supports 0% interest rate without division by zero', () => {
      const zeroRateLoan = { ...sampleLoan, annualInterestRate: 0 };
      const result = simulateLoanScenario({
        loan: zeroRateLoan,
        payments: [],
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 2000 },
      });

      expect(result.success).toBe(true);
      expect(result.totalSimulatedInterest).toBe(0);
    });

    it('handles EMI too low to cover monthly interest charge gracefully', () => {
      const lowEmiLoan = { ...sampleLoan, currentOutstandingPrincipal: 1000000, annualInterestRate: 12, emiAmount: 5000 };
      // Monthly interest = 1000000 * 0.01 = 10000. EMI = 5000 <= 10000
      const result = simulateLoanScenario({
        loan: lowEmiLoan,
        payments: [],
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 0 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('estimated balance would not decrease');
    });
  });

  describe('Strict Non-Mutation Compliance', () => {
    it('never mutates real loan profiles, payments, snapshots, or other loans', () => {
      const initialLoanJson = JSON.stringify(sampleLoan);
      const initialPaymentsJson = JSON.stringify(samplePayments);
      const initialLoanBJson = JSON.stringify(loanB);

      simulateLoanScenario({
        loan: sampleLoan,
        payments: samplePayments,
        scenario: { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 10000 },
      });

      expect(JSON.stringify(sampleLoan)).toBe(initialLoanJson);
      expect(JSON.stringify(samplePayments)).toBe(initialPaymentsJson);
      expect(JSON.stringify(loanB)).toBe(initialLoanBJson);
    });
  });
});

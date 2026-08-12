import {
  simulateLoanPrepayment,
  SIMULATION_STRATEGIES,
  simulateSchedule,
  calculateNewEmiForTenure,
} from '../utils/loanPrepaymentSimulation';
import { BALANCE_SOURCES } from '../constants/loanPaymentConstants';
import { roundCurrency } from '../../../calculations/core/rounding';

describe('Phase 16.5 — Loan Prepayment Simulation Utility Engine', () => {
  const sampleLoan = {
    id: 'loan_home_123',
    name: 'Home Loan',
    lenderName: 'HDFC Bank',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 742500,
    annualInterestRate: 8.5,
    emiAmount: 21450,
    remainingTenureMonths: 48,
    balanceSource: BALANCE_SOURCES.ESTIMATED,
    userConfirmedBalance: 742500,
    ledgerVersion: 1,
  };

  const samplePayments = [
    {
      id: 'pay_1',
      loanId: 'loan_home_123',
      paymentAmount: 21450,
      paymentDate: '2026-07-01',
      paymentType: 'regular_emi',
      balanceSource: BALANCE_SOURCES.ESTIMATED,
      outstandingAfter: 742500,
    },
  ];

  describe('1. Non-Mutation & Isolation Guarantee', () => {
    test('must never mutate loan object or payments array during simulation', () => {
      const loanCopy = JSON.parse(JSON.stringify(sampleLoan));
      const paymentsCopy = JSON.parse(JSON.stringify(samplePayments));

      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        payments: samplePayments,
        prepaymentAmount: 50000,
        strategy: SIMULATION_STRATEGIES.REDUCE_TENURE,
      });

      expect(result.success).toBe(true);
      expect(sampleLoan).toEqual(loanCopy);
      expect(samplePayments).toEqual(paymentsCopy);
    });

    test('simulating Loan A does not affect Loan B', () => {
      const loanB = {
        id: 'loan_car_456',
        name: 'Car Loan',
        currentOutstandingPrincipal: 200000,
        annualInterestRate: 10,
        emiAmount: 5000,
        remainingTenureMonths: 48,
      };

      const resultA = simulateLoanPrepayment({
        loan: sampleLoan,
        prepaymentAmount: 100000,
      });

      expect(resultA.before.outstandingBalance).toBe(742500);
      expect(loanB.currentOutstandingPrincipal).toBe(200000);
    });
  });

  describe('2. Strategy A — Reduce Tenure Mode', () => {
    test('reduces tenure while keeping scheduled EMI unchanged', () => {
      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        payments: samplePayments,
        prepaymentAmount: 50000,
        strategy: SIMULATION_STRATEGIES.REDUCE_TENURE,
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(SIMULATION_STRATEGIES.REDUCE_TENURE);
      expect(result.before.outstandingBalance).toBe(742500);
      expect(result.after.outstandingBalance).toBe(692500);
      expect(result.after.emi).toBe(sampleLoan.emiAmount);
      expect(result.after.remainingMonths).toBeLessThan(result.before.remainingMonths);
      expect(result.savings.monthsSaved).toBe(result.before.remainingMonths - result.after.remainingMonths);
      expect(result.savings.interestSaved).toBeGreaterThan(0);
      expect(result.savings.monthlyEmiSavings).toBe(0);
    });
  });

  describe('3. Strategy B — Reduce EMI Mode', () => {
    test('reduces EMI while keeping remaining tenure approximately unchanged', () => {
      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        payments: samplePayments,
        prepaymentAmount: 50000,
        strategy: SIMULATION_STRATEGIES.REDUCE_EMI,
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(SIMULATION_STRATEGIES.REDUCE_EMI);
      expect(result.before.outstandingBalance).toBe(742500);
      expect(result.after.outstandingBalance).toBe(692500);
      expect(result.after.emi).toBeLessThan(result.before.emi);
      expect(result.after.remainingMonths).toBe(result.before.remainingMonths);
      expect(result.savings.monthlyEmiSavings).toBe(roundCurrency(result.before.emi - result.after.emi));
      expect(result.savings.interestSaved).toBeGreaterThan(0);
      expect(result.savings.monthsSaved).toBe(0);
    });
  });

  describe('4. Overpayment & Full Payoff Scenario', () => {
    test('handles prepayment equal to current balance', () => {
      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        prepaymentAmount: 742500,
      });

      expect(result.success).toBe(true);
      expect(result.isFullyPaidOff).toBe(true);
      expect(result.after.outstandingBalance).toBe(0);
      expect(result.after.remainingMonths).toBe(0);
      expect(result.after.remainingInterest).toBe(0);
      expect(result.savings.interestSaved).toBe(result.before.remainingInterest);
    });

    test('handles prepayment exceeding current balance with warning', () => {
      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        prepaymentAmount: 800000,
      });

      expect(result.success).toBe(true);
      expect(result.isFullyPaidOff).toBe(true);
      expect(result.after.outstandingBalance).toBe(0);
      expect(result.warning).toContain('exceeds current outstanding');
    });
  });

  describe('5. Zero-Interest (0%) Loans', () => {
    test('correctly calculates 0% interest prepayment reduction', () => {
      const zeroInterestLoan = {
        ...sampleLoan,
        annualInterestRate: 0,
        currentOutstandingPrincipal: 100000,
        emiAmount: 10000,
        remainingTenureMonths: 10,
      };

      const result = simulateLoanPrepayment({
        loan: zeroInterestLoan,
        prepaymentAmount: 40000,
        strategy: SIMULATION_STRATEGIES.REDUCE_TENURE,
      });

      expect(result.success).toBe(true);
      expect(result.before.remainingInterest).toBe(0);
      expect(result.after.remainingInterest).toBe(0);
      expect(result.after.outstandingBalance).toBe(60000);
      expect(result.after.remainingMonths).toBe(6);
      expect(result.savings.monthsSaved).toBe(4);
      expect(result.savings.interestSaved).toBe(0);
    });
  });

  describe('6. Edge Cases & Low EMI Handling', () => {
    test('returns warning when EMI cannot cover monthly interest', () => {
      const lowEmiLoan = {
        ...sampleLoan,
        currentOutstandingPrincipal: 1000000,
        annualInterestRate: 12, // Monthly interest = 10,000
        emiAmount: 5000, // Low EMI!
      };

      const schedule = simulateSchedule({
        balance: 1000000,
        annualRate: 12,
        monthlyEmi: 5000,
      });

      expect(schedule.warning).toContain('cover monthly interest');

      const result = simulateLoanPrepayment({
        loan: lowEmiLoan,
        prepaymentAmount: 50000,
      });

      expect(result.success).toBe(true);
      expect(result.warning).toContain('cover monthly interest');
    });

    test('returns error for invalid prepayment amounts', () => {
      const result = simulateLoanPrepayment({
        loan: sampleLoan,
        prepaymentAmount: -5000,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('7. Bank-Confirmed Anchor Priority', () => {
    test('resolves starting balance from bank-confirmed anchor when present', () => {
      const bankLoan = {
        ...sampleLoan,
        currentOutstandingPrincipal: 720000,
        balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
      };

      const result = simulateLoanPrepayment({
        loan: bankLoan,
        prepaymentAmount: 20000,
      });

      expect(result.success).toBe(true);
      expect(result.before.outstandingBalance).toBe(720000);
      expect(result.after.outstandingBalance).toBe(700000);
      expect(result.assumptions.isBankConfirmed).toBe(true);
      expect(result.assumptions.balanceSource).toBe(BALANCE_SOURCES.BANK_CONFIRMED);
    });
  });

  describe('8. Standalone Helpers', () => {
    test('calculateNewEmiForTenure accurately computes new EMI', () => {
      const newEmi = calculateNewEmiForTenure(500000, 10, 60);
      expect(newEmi).toBeGreaterThan(10000);
      expect(newEmi).toBeLessThan(12000);
    });
  });
});

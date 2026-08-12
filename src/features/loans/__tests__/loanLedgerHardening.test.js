import loanProfilesReducer, {
  addLoanProfile,
  updateLoanProfile,
  correctLoanBalance,
  incrementLedgerVersion,
} from '../../../store/slices/loanProfilesSlice';
import loanPaymentsReducer, {
  addPayment,
  deletePayment,
  deleteLoanPaymentWithRecalculation,
} from '../../../store/slices/loanPaymentsSlice';
import { createLoanProfile } from '../types/loanProfileTypes';
import { createLoanPayment } from '../types/loanPaymentTypes';
import {
  getPaymentBalanceAnchor,
  recalculateLoanBalanceFromPayments,
  getCurrentLoanBalance,
  sortPaymentsChronologically,
} from '../utils/paymentBalanceUtils';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

describe('Finzo Loan Ledger Hardening Tests', () => {
  let baseLoan;

  beforeEach(() => {
    baseLoan = createLoanProfile({
      id: 'loan_ledger_1',
      name: 'Ledger Test Loan',
      originalPrincipal: 1000000,
      currentOutstandingPrincipal: 1000000,
      annualInterestRate: 8.5,
      emiAmount: 20000,
      userConfirmedBalance: 1000000,
      balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
    });
  });

  // Section 39: Balance Anchors
  describe('Balance Anchors', () => {
    test('1. Initial balance anchor uses original/user confirmed balance', () => {
      const anchor = getPaymentBalanceAnchor({ loan: baseLoan, payments: [] });
      expect(anchor.startingBalance).toBe(1000000);
      expect(anchor.anchorSource).toBe(BALANCE_SOURCES.BANK_CONFIRMED);
      expect(anchor.anchorPaymentId).toBeNull();
    });

    test('2. Bank-confirmed payment record acts as balance anchor', () => {
      const p1 = createLoanPayment({
        id: 'p1',
        loanId: baseLoan.id,
        amount: 20000,
        paymentDate: '2026-08-01',
        balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
        actualClosingBalance: 980000,
      });

      const anchor = getPaymentBalanceAnchor({ loan: baseLoan, payments: [p1] });
      expect(anchor.startingBalance).toBe(980000);
      expect(anchor.anchorSource).toBe(BALANCE_SOURCES.BANK_CONFIRMED);
      expect(anchor.anchorPaymentId).toBe('p1');
    });

    test('3. Selects latest bank-confirmed anchor when multiple payments exist', () => {
      const p1 = createLoanPayment({ id: 'p1', loanId: baseLoan.id, paymentDate: '2026-08-01', balanceSource: BALANCE_SOURCES.ESTIMATED, actualClosingBalance: null });
      const p2 = createLoanPayment({ id: 'p2', loanId: baseLoan.id, paymentDate: '2026-09-01', balanceSource: BALANCE_SOURCES.BANK_CONFIRMED, actualClosingBalance: 950000 });
      const p3 = createLoanPayment({ id: 'p3', loanId: baseLoan.id, paymentDate: '2026-10-01', balanceSource: BALANCE_SOURCES.ESTIMATED, actualClosingBalance: null });

      const anchor = getPaymentBalanceAnchor({ loan: baseLoan, payments: [p1, p2, p3] });
      expect(anchor.startingBalance).toBe(950000);
      expect(anchor.anchorPaymentId).toBe('p2');
    });

    test('4. getCurrentLoanBalance returns central authoritative balance state', () => {
      const state = getCurrentLoanBalance(baseLoan, []);
      expect(state.currentBalance).toBe(1000000);
      expect(state.isBankConfirmed).toBe(true);
      expect(state.ledgerVersion).toBe(1);
    });
  });

  // Section 40: Payment Replay
  describe('Payment Replay', () => {
    test('1. Single EMI payment calculates interest/principal correctly', () => {
      const pay = createLoanPayment({ id: 'p1', loanId: baseLoan.id, amount: 20000, paymentDate: '2026-08-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });
      const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({ loan: baseLoan, payments: [pay] });

      // 10,00,000 @ 8.5% -> Int: round(1000000 * 0.085/12) = 7083, Prin: 12917, Bal: 987083
      expect(updatedPayments[0].interestAmount).toBe(7083);
      expect(updatedPayments[0].principalAmount).toBe(12917);
      expect(finalEstimatedBalance).toBe(987083);
    });

    test('2. Chronological sorting orders by date asc, createdAt asc, id asc', () => {
      const p1 = { id: 'b', paymentDate: '2026-08-01', createdAt: '2026-08-01T10:00:00.000Z' };
      const p2 = { id: 'a', paymentDate: '2026-08-01', createdAt: '2026-08-01T10:00:00.000Z' };
      const p3 = { id: 'c', paymentDate: '2026-07-01', createdAt: '2026-07-01T10:00:00.000Z' };

      const sorted = sortPaymentsChronologically([p1, p2, p3]);
      expect(sorted[0].id).toBe('c');
      expect(sorted[1].id).toBe('a');
      expect(sorted[2].id).toBe('b');
    });

    test('3. Zero interest loan allocates 100% of payment to principal', () => {
      const zeroLoan = createLoanProfile({ id: 'lZero', originalPrincipal: 100000, currentOutstandingPrincipal: 100000, annualInterestRate: 0, userConfirmedBalance: 100000 });
      const pay = createLoanPayment({ id: 'p1', loanId: zeroLoan.id, amount: 15000, paymentType: PAYMENT_TYPES.REGULAR_EMI });

      const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({ loan: zeroLoan, payments: [pay] });
      expect(finalEstimatedBalance).toBe(85000);
    });

    test('4. Balance never becomes negative when payment exceeds balance', () => {
      const smallLoan = createLoanProfile({ id: 'lSmall', originalPrincipal: 10000, currentOutstandingPrincipal: 10000, userConfirmedBalance: 10000 });
      const pay = createLoanPayment({ id: 'p1', loanId: smallLoan.id, amount: 50000, paymentType: PAYMENT_TYPES.PREPAYMENT });

      const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({ loan: smallLoan, payments: [pay] });
      expect(finalEstimatedBalance).toBe(0);
    });
  });

  // Section 42: Historical Snapshots
  describe('Historical Calculation Snapshots', () => {
    test('1. Historical payment snapshot preserves rate and calculation snapshot when profile rate changes', () => {
      const pay = createLoanPayment({
        id: 'p1',
        loanId: baseLoan.id,
        amount: 20000,
        paymentDate: '2026-08-01',
        calculationSnapshot: {
          annualRate: 8.5,
          interestMethod: 'monthly_reducing',
          openingBalance: 1000000,
          estimatedInterest: 7083,
          estimatedPrincipal: 12917,
          estimatedClosingBalance: 987083,
        },
      });

      // Update loan profile rate to 9.5%
      const updatedLoan = { ...baseLoan, annualInterestRate: 9.5 };
      expect(pay.calculationSnapshot.annualRate).toBe(8.5);
      expect(pay.calculationSnapshot.interestMethod).toBe('monthly_reducing');
      expect(updatedLoan.annualInterestRate).toBe(9.5);
    });
  });

  // Section 43: Balance Corrections & Anchors
  describe('Balance Corrections', () => {
    test('1. correctLoanBalance updates balance, source, confirmation date, and increments ledgerVersion', () => {
      const state = loanProfilesReducer({ profiles: [baseLoan] }, correctLoanBalance({ id: baseLoan.id, actualBankBalance: 726050 }));

      const updated = state.profiles[0];
      expect(updated.currentOutstandingPrincipal).toBe(726050);
      expect(updated.userConfirmedBalance).toBe(726050);
      expect(updated.balanceSource).toBe(BALANCE_SOURCES.BANK_CONFIRMED);
      expect(updated.ledgerVersion).toBe(2);
      expect(updated.lastBalanceConfirmationDate).toBeDefined();
    });
  });

  // Section 44: Multiple Loans Isolation
  describe('Multiple Loans Isolation', () => {
    test('1. Operations on Loan A do not affect Loan B', () => {
      const loanA = createLoanProfile({ id: 'loanA', name: 'Loan A', originalPrincipal: 500000, currentOutstandingPrincipal: 500000, userConfirmedBalance: 500000 });
      const loanB = createLoanProfile({ id: 'loanB', name: 'Loan B', originalPrincipal: 300000, currentOutstandingPrincipal: 300000, userConfirmedBalance: 300000 });

      const payA = createLoanPayment({ id: 'pA', loanId: 'loanA', amount: 20000 });
      const payB = createLoanPayment({ id: 'pB', loanId: 'loanB', amount: 10000 });

      const resA = recalculateLoanBalanceFromPayments({ loan: loanA, payments: [payA] });
      const resB = recalculateLoanBalanceFromPayments({ loan: loanB, payments: [payB] });

      expect(resA.finalEstimatedBalance).toBeLessThan(500000);
      expect(resB.finalEstimatedBalance).toBeLessThan(300000);
      expect(resA.finalEstimatedBalance).not.toBe(resB.finalEstimatedBalance);
    });
  });

  // Section 45: Ledger Versioning
  describe('Ledger Versioning', () => {
    test('1. Increments ledgerVersion on updateLoanProfile and incrementLedgerVersion', () => {
      let state = loanProfilesReducer({ profiles: [baseLoan] }, updateLoanProfile({ id: baseLoan.id, name: 'Updated Name' }));
      expect(state.profiles[0].ledgerVersion).toBe(2);

      state = loanProfilesReducer(state, incrementLedgerVersion(baseLoan.id));
      expect(state.profiles[0].ledgerVersion).toBe(3);
    });
  });
});

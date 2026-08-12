import loanProfilesReducer, {
  addLoanProfile,
} from '../../../store/slices/loanProfilesSlice';
import loanPaymentsReducer, {
  addPayment,
  deleteLoanPaymentWithRecalculation,
  selectPaymentsForLoan,
} from '../../../store/slices/loanPaymentsSlice';
import { createLoanProfile } from '../types/loanProfileTypes';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { recalculateLoanBalanceFromPayments } from '../utils/paymentBalanceUtils';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

describe('Finzo Payment Deletion Balance Recalculation Tests', () => {
  let initialLoan;

  beforeEach(() => {
    initialLoan = createLoanProfile({
      id: 'l1',
      name: 'Test Home Loan',
      originalPrincipal: 1000000,
      currentOutstandingPrincipal: 1000000,
      annualInterestRate: 8.5,
      emiAmount: 20000,
      userConfirmedBalance: 1000000,
    });
  });

  // 1. Delete last regular EMI
  test('1. Deleting last regular EMI restores previous opening balance and updates payment count', () => {
    // Payment 1: 20,000 EMI on 10,00,000 @ 8.5%
    // Interest = round(1000000 * 0.085/12) = 7083. Principal = 12917. Closing = 987083.
    const pay1 = createLoanPayment({
      id: 'p1',
      loanId: 'l1',
      amount: 20000,
      paymentDate: '2026-08-01',
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      outstandingBefore: 1000000,
      outstandingAfter: 987083,
    });

    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: initialLoan,
      payments: [],
    });

    expect(finalEstimatedBalance).toBe(1000000);
    expect(updatedPayments.length).toBe(0);
  });

  // 2. Delete middle payment (A, B, C -> delete B)
  test('2. Deleting middle payment recalculates subsequent payments from balance after A', () => {
    // Starting: 10,00,000 @ 8.5%
    // Pay A (2026-08-01): 20,000 EMI -> Int: 7083, Prin: 12917, Bal: 987083
    // Pay B (2026-09-01): 20,000 EMI -> Int: round(987083 * 0.085/12) = 6992. Prin: 13008, Bal: 974075
    // Pay C (2026-10-01): 20,000 EMI -> Int: round(974075 * 0.085/12) = 6900. Prin: 13100, Bal: 960975

    const payA = createLoanPayment({ id: 'pA', loanId: 'l1', amount: 20000, paymentDate: '2026-08-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });
    const payB = createLoanPayment({ id: 'pB', loanId: 'l1', amount: 20000, paymentDate: '2026-09-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });
    const payC = createLoanPayment({ id: 'pC', loanId: 'l1', amount: 20000, paymentDate: '2026-10-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });

    // Delete B -> remaining: [payA, payC]
    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: initialLoan,
      payments: [payA, payC],
    });

    expect(updatedPayments.length).toBe(2);
    expect(updatedPayments[0].id).toBe('pA');
    expect(updatedPayments[1].id).toBe('pC');

    // Pay A closing balance: 987083
    expect(updatedPayments[0].outstandingAfter).toBe(987083);
    // Pay C opening balance must now be 987083 (recalculated from A)
    expect(updatedPayments[1].outstandingBefore).toBe(987083);
    // Pay C Int: 6992, Prin: 13008, Closing: 974075
    expect(updatedPayments[1].interestAmount).toBe(6992);
    expect(updatedPayments[1].principalAmount).toBe(13008);
    expect(finalEstimatedBalance).toBe(974075);
  });

  // 3. Delete first payment (A, B, C -> delete A)
  test('3. Deleting first payment rebuilds all remaining payments from initial anchor', () => {
    const payA = createLoanPayment({ id: 'pA', loanId: 'l1', amount: 20000, paymentDate: '2026-08-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });
    const payB = createLoanPayment({ id: 'pB', loanId: 'l1', amount: 20000, paymentDate: '2026-09-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });
    const payC = createLoanPayment({ id: 'pC', loanId: 'l1', amount: 20000, paymentDate: '2026-10-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });

    // Delete A -> remaining: [payB, payC]
    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: initialLoan,
      payments: [payB, payC],
    });

    expect(updatedPayments.length).toBe(2);
    expect(updatedPayments[0].id).toBe('pB');
    // Pay B now opens at 10,00,000
    expect(updatedPayments[0].outstandingBefore).toBe(1000000);
    expect(updatedPayments[0].outstandingAfter).toBe(987083);
    // Pay C opens at 987083
    expect(updatedPayments[1].outstandingBefore).toBe(987083);
    expect(finalEstimatedBalance).toBe(974075);
  });

  // 4. Delete prepayment
  test('4. Deleting a prepayment recalculates loan balance correctly', () => {
    // Starting: 10,00,000
    // Prepayment: 1,00,000 -> Closing: 9,00,000
    // EMI: 20,000 -> Int: round(900000 * 0.085/12) = 6375. Prin: 13625. Closing: 886375
    const payPre = createLoanPayment({ id: 'pPre', loanId: 'l1', amount: 100000, paymentDate: '2026-08-01', paymentType: PAYMENT_TYPES.PREPAYMENT });
    const payEmi = createLoanPayment({ id: 'pEmi', loanId: 'l1', amount: 20000, paymentDate: '2026-09-01', paymentType: PAYMENT_TYPES.REGULAR_EMI });

    // Delete Prepayment -> remaining: [payEmi]
    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: initialLoan,
      payments: [payEmi],
    });

    expect(updatedPayments.length).toBe(1);
    expect(updatedPayments[0].outstandingBefore).toBe(1000000);
    expect(updatedPayments[0].outstandingAfter).toBe(987083);
    expect(finalEstimatedBalance).toBe(987083);
  });

  // 5. Delete custom payment
  test('5. Deleting custom payment recalculates remaining sequence without altering loan emiAmount', () => {
    const payCustom = createLoanPayment({ id: 'pCust', loanId: 'l1', amount: 50000, paymentDate: '2026-08-01', paymentType: PAYMENT_TYPES.CUSTOM_PAYMENT });

    const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({
      loan: initialLoan,
      payments: [],
    });

    expect(finalEstimatedBalance).toBe(1000000);
    expect(initialLoan.emiAmount).toBe(20000);
  });

  // 6. Bank-confirmed balance anchor preservation
  test('6. Deleting payment after bank confirmation replays from bank anchor without altering anchor', () => {
    const loanWithBankAnchor = createLoanProfile({
      id: 'l1',
      currentOutstandingPrincipal: 700000,
      userConfirmedBalance: 700000,
      balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
      annualInterestRate: 8.5,
    });

    const pay1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 20000, paymentDate: '2026-08-15', paymentType: PAYMENT_TYPES.REGULAR_EMI });
    const pay2 = createLoanPayment({ id: 'p2', loanId: 'l1', amount: 20000, paymentDate: '2026-09-15', paymentType: PAYMENT_TYPES.REGULAR_EMI });

    // Delete pay2 -> remaining [pay1]
    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: loanWithBankAnchor,
      payments: [pay1],
    });

    // 7,00,000 @ 8.5% -> Int: round(700000 * 0.085/12) = 4958. Prin: 15042. Closing: 684958
    expect(updatedPayments[0].outstandingBefore).toBe(700000);
    expect(finalEstimatedBalance).toBe(684958);
    expect(loanWithBankAnchor.userConfirmedBalance).toBe(700000);
  });

  // 7. Multi-loan isolation
  test('7. Deleting payment from Loan A does not alter Loan B balance or payments', () => {
    const loanA = createLoanProfile({ id: 'loanA', originalPrincipal: 500000, userConfirmedBalance: 500000 });
    const loanB = createLoanProfile({ id: 'loanB', originalPrincipal: 300000, userConfirmedBalance: 300000 });

    const payA = createLoanPayment({ id: 'payA', loanId: 'loanA', amount: 10000 });
    const payB = createLoanPayment({ id: 'payB', loanId: 'loanB', amount: 5000 });

    const resA = recalculateLoanBalanceFromPayments({ loan: loanA, payments: [] });
    const resB = recalculateLoanBalanceFromPayments({ loan: loanB, payments: [payB] });

    expect(resA.finalEstimatedBalance).toBe(500000);
    expect(resB.finalEstimatedBalance).toBeLessThan(300000);
  });

  // 8. Zero-interest loan deletion
  test('8. Deleting payment on 0% interest loan restores exact 100% payment principal', () => {
    const zeroLoan = createLoanProfile({ id: 'lZero', originalPrincipal: 100000, userConfirmedBalance: 100000, annualInterestRate: 0 });
    const pay = createLoanPayment({ id: 'pZero', loanId: 'lZero', amount: 15000, paymentType: PAYMENT_TYPES.REGULAR_EMI });

    const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({ loan: zeroLoan, payments: [] });
    expect(finalEstimatedBalance).toBe(100000);
  });

  // 9. Delete all payments returns balance to anchor
  test('9. Deleting all payments returns estimated balance to initial anchor', () => {
    const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({ loan: initialLoan, payments: [] });
    expect(finalEstimatedBalance).toBe(1000000);
  });
});

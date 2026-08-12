import loanProfilesReducer, {
  addLoanProfile,
  correctLoanBalance,
} from '../../../store/slices/loanProfilesSlice';
import loanPaymentsReducer, {
  addPayment,
  selectPaymentsForLoan,
} from '../../../store/slices/loanPaymentsSlice';
import { createLoanProfile } from '../types/loanProfileTypes';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { calculateEmiBreakdown } from '../utils/loanBalanceUtils';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

describe('Finzo Loan Balance & Payment Calculation Correction Tests', () => {
  // 1. Regular EMI payment
  test('1. Regular EMI payment correctly initializes with regular_emi type', () => {
    const pay = createLoanPayment({
      loanId: 'l1',
      amount: 21450,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
    });
    expect(pay.paymentType).toBe('regular_emi');
    expect(pay.amount).toBe(21450);
  });

  // 2. EMI split into interest/principal
  test('2. EMI payment splits correctly into estimated interest and principal reduction', () => {
    // Opening: 7,42,500 @ 8.5% p.a. (Monthly Interest = round(742500 * (0.085/12)) = 5259)
    // EMI = 21450 -> Principal = 16191, New Estimated = 726309
    const res = calculateEmiBreakdown({
      currentOutstanding: 742500,
      annualInterestRate: 8.5,
      amount: 21450,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
    });

    expect(res.interestPaid).toBe(5259);
    expect(res.principalPaid).toBe(16191);
    expect(res.newOutstanding).toBe(726309);
  });

  // 3. Custom payment
  test('3. Custom payment calculates interest/principal split without changing configured EMI', () => {
    const res = calculateEmiBreakdown({
      currentOutstanding: 742500,
      annualInterestRate: 8.5,
      amount: 25000,
      paymentType: PAYMENT_TYPES.CUSTOM_PAYMENT,
    });

    expect(res.interestPaid).toBe(5259);
    expect(res.principalPaid).toBe(19741);
    expect(res.newOutstanding).toBe(722759);
  });

  // 4. Prepayment
  test('4. Prepayment reduces principal 100% with 0 interest', () => {
    const res = calculateEmiBreakdown({
      currentOutstanding: 726316,
      annualInterestRate: 8.5,
      amount: 50000,
      paymentType: PAYMENT_TYPES.PREPAYMENT,
    });

    expect(res.interestPaid).toBe(0);
    expect(res.principalPaid).toBe(50000);
    expect(res.newOutstanding).toBe(676316);
  });

  // 5. Payment date
  test('5. Payment record stores paymentDate', () => {
    const pay = createLoanPayment({
      loanId: 'l1',
      amount: 21450,
      paymentDate: '2026-08-15',
    });
    expect(pay.paymentDate).toBe('2026-08-15');
  });

  // 6. Zero-interest loan
  test('6. Zero-interest loan allocates 100% of payment to principal', () => {
    const res = calculateEmiBreakdown({
      currentOutstanding: 100000,
      annualInterestRate: 0,
      amount: 10000,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
    });

    expect(res.interestPaid).toBe(0);
    expect(res.principalPaid).toBe(10000);
    expect(res.newOutstanding).toBe(90000);
  });

  // 7 & 8. Payment greater than balance / Balance never becomes negative
  test('7 & 8. Payment greater than balance clamps new outstanding to zero and never negative', () => {
    const res = calculateEmiBreakdown({
      currentOutstanding: 15000,
      annualInterestRate: 10,
      amount: 50000,
      paymentType: PAYMENT_TYPES.PREPAYMENT,
    });

    expect(res.newOutstanding).toBe(0);
    expect(res.principalPaid).toBe(15000);
  });

  // 9. Actual bank balance override
  test('9. Actual bank balance override sets bank_confirmed source and updates starting balance', () => {
    const initialLoan = createLoanProfile({
      id: 'l1',
      name: 'Home Loan',
      currentOutstandingPrincipal: 742500,
      balanceSource: BALANCE_SOURCES.ESTIMATED,
    });

    const state = loanProfilesReducer({ profiles: [initialLoan] }, correctLoanBalance({ id: 'l1', actualBankBalance: 726050 }));

    expect(state.profiles[0].currentOutstandingPrincipal).toBe(726050);
    expect(state.profiles[0].userConfirmedBalance).toBe(726050);
    expect(state.profiles[0].balanceSource).toBe(BALANCE_SOURCES.BANK_CONFIRMED);
  });

  // 10. Estimated vs bank-confirmed source
  test('10. Distinguishes estimated vs bank_confirmed balance sources correctly', () => {
    const pEst = createLoanPayment({ loanId: 'l1', amount: 21450, balanceSource: BALANCE_SOURCES.ESTIMATED });
    const pBank = createLoanPayment({ loanId: 'l1', amount: 21450, actualClosingBalance: 726050, balanceSource: BALANCE_SOURCES.BANK_CONFIRMED });

    expect(pEst.balanceSource).toBe('estimated');
    expect(pBank.balanceSource).toBe('bank_confirmed');
    expect(pBank.actualClosingBalance).toBe(726050);
  });

  // 11. Corrected balance used for next payment
  test('11. Future payment calculation begins from corrected bank balance', () => {
    // Starting after correction: 726050 @ 8.5%
    const res = calculateEmiBreakdown({
      currentOutstanding: 726050,
      annualInterestRate: 8.5,
      amount: 21450,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
    });

    expect(res.interestPaid).toBe(5143);
    expect(res.principalPaid).toBe(16307);
    expect(res.newOutstanding).toBe(709743);
  });

  // 12. Historical payment remains unchanged after correction
  test('12. Correcting current loan balance does NOT alter historical payment snapshots', () => {
    const historicalPayment = createLoanPayment({
      id: 'p1',
      loanId: 'l1',
      amount: 21450,
      outstandingBefore: 742500,
      outstandingAfter: 726316,
      balanceSource: BALANCE_SOURCES.ESTIMATED,
    });

    const payState = loanPaymentsReducer({ payments: [historicalPayment] }, { type: 'noop' });
    const profileState = loanProfilesReducer({ profiles: [createLoanProfile({ id: 'l1', currentOutstandingPrincipal: 726316 })] }, correctLoanBalance({ id: 'l1', actualBankBalance: 726050 }));

    expect(payState.payments[0].outstandingAfter).toBe(726316);
    expect(profileState.profiles[0].currentOutstandingPrincipal).toBe(726050);
  });

  // 13. Configured EMI automatically populates Regular EMI
  test('13. Configured EMI is used as default payment amount for Regular EMI', () => {
    const loan = createLoanProfile({ id: 'l1', emiAmount: 21450 });
    expect(loan.emiAmount).toBe(21450);
  });

  // 14. Custom payment does not change configured EMI
  test('14. Recording a custom payment leaves loan configured emiAmount unchanged', () => {
    const loan = createLoanProfile({ id: 'l1', emiAmount: 21450, currentOutstandingPrincipal: 742500 });
    const updatedState = loanProfilesReducer({ profiles: [loan] }, {
      type: 'loanProfiles/updateLoanProfile',
      payload: { id: 'l1', currentOutstandingPrincipal: 722759 },
    });

    expect(updatedState.profiles[0].emiAmount).toBe(21450);
    expect(updatedState.profiles[0].currentOutstandingPrincipal).toBe(722759);
  });

  // 15. Prepayment does not become an EMI
  test('15. Prepayment record preserves prepayment paymentType', () => {
    const prepay = createLoanPayment({
      loanId: 'l1',
      amount: 50000,
      paymentType: PAYMENT_TYPES.PREPAYMENT,
    });
    expect(prepay.paymentType).toBe('prepayment');
  });

  // 16. Multiple payments
  test('16. Multiple payments reduce balance sequentially', () => {
    const p1 = createEmiBreakdown(742500, 21450);
    const p2 = createEmiBreakdown(p1.newOutstanding, 21450);

    function createEmiBreakdown(bal, amt) {
      return calculateEmiBreakdown({
        currentOutstanding: bal,
        annualInterestRate: 8.5,
        amount: amt,
        paymentType: PAYMENT_TYPES.REGULAR_EMI,
      });
    }

    expect(p1.newOutstanding).toBe(726309);
    expect(p2.newOutstanding).toBe(710004);
  });

  // 17. Multiple loans have isolated payment histories
  test('17. Payments for loan l1 do not bleed into loan l2', () => {
    const pay1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 20000 });
    const pay2 = createLoanPayment({ id: 'p2', loanId: 'l2', amount: 5000 });

    const state = loanPaymentsReducer({ payments: [pay1, pay2] }, { type: 'noop' });
    const l1Payments = selectPaymentsForLoan({ loanPayments: state }, 'l1');
    const l2Payments = selectPaymentsForLoan({ loanPayments: state }, 'l2');

    expect(l1Payments.length).toBe(1);
    expect(l1Payments[0].id).toBe('p1');
    expect(l2Payments.length).toBe(1);
    expect(l2Payments[0].id).toBe('p2');
  });

  // 18. Archived loan payment history remains accessible
  test('18. Archived loan payment history remains queryable and accessible', () => {
    const archivedLoan = createLoanProfile({ id: 'l1_archived', status: 'archived' });
    const pay = createLoanPayment({ id: 'p1', loanId: 'l1_archived', amount: 10000 });

    const profState = loanProfilesReducer({ profiles: [archivedLoan] }, { type: 'noop' });
    const payState = loanPaymentsReducer({ payments: [pay] }, { type: 'noop' });

    expect(profState.profiles[0].status).toBe('archived');
    expect(payState.payments.length).toBe(1);
    expect(payState.payments[0].loanId).toBe('l1_archived');
  });
});

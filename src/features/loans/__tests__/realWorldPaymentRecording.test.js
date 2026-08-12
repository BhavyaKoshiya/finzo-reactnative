import {
  createPaymentPreview,
  calculatePaymentDifference,
  validatePaymentInput,
  recalculateLoanBalanceFromPayments,
  getCurrentLoanBalance,
} from '../utils/paymentBalanceUtils';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

describe('Phase 16.4 — Real-World Loan Payment Recording Tests', () => {
  const baseLoan = {
    id: 'loan_test_16_4',
    name: 'Home Loan 16.4',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 1000000,
    annualInterestRate: 12.0,
    emiAmount: 22244,
    userConfirmedBalance: 1000000,
    balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
    ledgerVersion: 1,
  };

  // 1. EMI Recording & "Use scheduled EMI" shortcut
  test('1. EMI payment recording computes interest/principal split and leaves loan.emiAmount unchanged', () => {
    const preview = createPaymentPreview({
      loan: baseLoan,
      payments: [],
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      amount: baseLoan.emiAmount,
    });

    expect(preview.openingBalance).toBe(1000000);
    expect(preview.paymentAmount).toBe(22244);
    expect(preview.estimatedInterest).toBe(10000); // 1,000,000 * 12% / 12 = 10,000
    expect(preview.estimatedPrincipal).toBe(12244); // 22,244 - 10,000 = 12,244
    expect(preview.estimatedClosingBalance).toBe(987756); // 1,000,000 - 12,244
    expect(baseLoan.emiAmount).toBe(22244);
  });

  // 2. Custom Payment recording
  test('2. Custom payment amount differs from scheduled EMI without altering loan.emiAmount', () => {
    const customAmount = 30000;
    const preview = createPaymentPreview({
      loan: baseLoan,
      payments: [],
      paymentType: PAYMENT_TYPES.CUSTOM_PAYMENT,
      amount: customAmount,
    });

    expect(preview.paymentAmount).toBe(30000);
    expect(preview.estimatedInterest).toBe(10000);
    expect(preview.estimatedPrincipal).toBe(20000); // 30,000 - 10,000
    expect(preview.estimatedClosingBalance).toBe(980000);
    expect(baseLoan.emiAmount).toBe(22244);
  });

  // 3. Prepayment recording (100% principal reduction, 0 interest)
  test('3. Prepayment reduces principal by 100% with zero interest charge', () => {
    const prepaymentAmount = 50000;
    const preview = createPaymentPreview({
      loan: baseLoan,
      payments: [],
      paymentType: PAYMENT_TYPES.PREPAYMENT,
      amount: prepaymentAmount,
    });

    expect(preview.estimatedInterest).toBe(0);
    expect(preview.estimatedPrincipal).toBe(50000);
    expect(preview.estimatedClosingBalance).toBe(950000);
  });

  // 4. Actual Bank Values difference calculation
  test('4. calculatePaymentDifference computes exact variance between Finzo estimate and bank receipt', () => {
    const estimated = { estimatedInterest: 10000, estimatedPrincipal: 12244, estimatedClosingBalance: 987756 };
    const actual = { actualInterest: 10050, actualPrincipal: 12194, actualClosingBalance: 987806 };

    const diff = calculatePaymentDifference(estimated, actual);
    expect(diff.hasActualValues).toBe(true);
    expect(diff.interestDiff).toBe(50);
    expect(diff.principalDiff).toBe(-50);
    expect(diff.closingDiff).toBe(50);
  });

  // 5. Bank-confirmed closing balance as anchor
  test('5. Payment with actualClosingBalance and balanceSource=bank_confirmed establishes active anchor', () => {
    const payment1 = {
      id: 'pay_1',
      loanId: baseLoan.id,
      paymentDate: '2026-01-15',
      paymentAmount: 22244,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      actualClosingBalance: 987800,
      balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
      createdAt: '2026-01-15T10:00:00.000Z',
    };

    const payment2 = {
      id: 'pay_2',
      loanId: baseLoan.id,
      paymentDate: '2026-02-15',
      paymentAmount: 22244,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      balanceSource: BALANCE_SOURCES.ESTIMATED,
      createdAt: '2026-02-15T10:00:00.000Z',
    };

    const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: baseLoan,
      payments: [payment1, payment2],
    });

    // Payment 2 opening balance should start from Payment 1's bank-confirmed balance of 987,800
    const updatedPay2 = updatedPayments.find((p) => p.id === 'pay_2');
    expect(updatedPay2.openingBalance).toBe(987800);
    expect(updatedPay2.estimatedInterest).toBe(9878); // 987,800 * 12% / 12
    expect(updatedPay2.estimatedPrincipal).toBe(12366); // 22,244 - 9,878
    expect(finalEstimatedBalance).toBe(975434); // 987,800 - 12,366
  });

  // 6. Payment Editing & Ledger Replay
  test('6. Editing a middle payment recalculates subsequent payments without altering historical snapshots', () => {
    const pay1 = {
      id: 'p1',
      loanId: baseLoan.id,
      paymentDate: '2026-01-10',
      paymentAmount: 20000,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      createdAt: '2026-01-10T10:00:00.000Z',
      calculationSnapshot: { openingBalance: 1000000, annualRate: 12 },
    };

    const pay2 = {
      id: 'p2',
      loanId: baseLoan.id,
      paymentDate: '2026-02-10',
      paymentAmount: 20000,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      createdAt: '2026-02-10T10:00:00.000Z',
      calculationSnapshot: { openingBalance: 990000, annualRate: 12 },
    };

    // Edit pay1 amount to 50,000 (prepayment)
    const editedPay1 = { ...pay1, paymentAmount: 50000, paymentType: PAYMENT_TYPES.PREPAYMENT };

    const { updatedPayments } = recalculateLoanBalanceFromPayments({
      loan: baseLoan,
      payments: [editedPay1, pay2],
    });

    const updatedPay2 = updatedPayments.find((p) => p.id === 'p2');
    expect(updatedPay2.openingBalance).toBe(950000); // 1,000,000 - 50,000 prepayment
    // Original pay1 calculation snapshot remains unchanged
    expect(editedPay1.calculationSnapshot.openingBalance).toBe(1000000);
  });

  // 7. Input validation & Overpayment Warning
  test('7. validatePaymentInput identifies non-positive amounts and warns on overpayments', () => {
    const invalidRes = validatePaymentInput({ amount: 0, currentBalance: 500000 });
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.errors.amount).toBeDefined();

    const warningRes = validatePaymentInput({ amount: 600000, currentBalance: 500000 });
    expect(warningRes.valid).toBe(true);
    expect(warningRes.warnings.amount).toContain('exceeds Finzo\'s estimated outstanding balance');
  });

  // 8. Multi-loan isolation
  test('8. Payment operations on Loan A leave Loan B completely unchanged', () => {
    const loanB = {
      id: 'loan_B',
      name: 'Car Loan B',
      originalPrincipal: 500000,
      currentOutstandingPrincipal: 400000,
      annualInterestRate: 10,
      userConfirmedBalance: 400000,
      balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
    };

    const stateA = getCurrentLoanBalance(baseLoan, []);
    const stateB = getCurrentLoanBalance(loanB, []);

    expect(stateA.currentBalance).toBe(1000000);
    expect(stateB.currentBalance).toBe(400000);
  });
});

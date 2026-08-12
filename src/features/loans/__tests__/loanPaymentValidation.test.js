import { validateLoanPaymentInput } from '../utils/loanPaymentValidation';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

describe('Loan Payment Validation', () => {
  const validBase = {
    loanId: 'loan_123',
    amount: 21450,
    paymentDate: '2026-08-10',
    paymentType: PAYMENT_TYPES.EMI,
    principalAmount: 16180,
    interestAmount: 5270,
    feesAmount: 0,
    outstandingBefore: 742500,
    outstandingAfter: 726320,
    balanceUpdated: true,
  };

  test('1. Validates a correct payment input successfully', () => {
    const result = validateLoanPaymentInput(validBase);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('2. Fails when payment amount is missing', () => {
    const result = validateLoanPaymentInput({ ...validBase, amount: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  test('3. Fails when payment amount is zero', () => {
    const result = validateLoanPaymentInput({ ...validBase, amount: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  test('4. Fails when payment amount is negative', () => {
    const result = validateLoanPaymentInput({ ...validBase, amount: -5000 });
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  test('5. Fails when payment date is invalid', () => {
    const result = validateLoanPaymentInput({ ...validBase, paymentDate: 'invalid-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors.paymentDate).toBeDefined();
  });

  test('6. Rejects future payment dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureStr = futureDate.toISOString().split('T')[0];

    const result = validateLoanPaymentInput({ ...validBase, paymentDate: futureStr });
    expect(result.isValid).toBe(false);
    expect(result.errors.paymentDate).toBeDefined();
  });

  test('7. Fails when payment type is invalid', () => {
    const result = validateLoanPaymentInput({ ...validBase, paymentType: 'invalid_type' });
    expect(result.isValid).toBe(false);
    expect(result.errors.paymentType).toBeDefined();
  });

  test('8. Fails when principal amount is negative', () => {
    const result = validateLoanPaymentInput({ ...validBase, principalAmount: -100 });
    expect(result.isValid).toBe(false);
    expect(result.errors.principalAmount).toBeDefined();
  });

  test('9. Fails when interest amount is negative', () => {
    const result = validateLoanPaymentInput({ ...validBase, interestAmount: -50 });
    expect(result.isValid).toBe(false);
    expect(result.errors.interestAmount).toBeDefined();
  });

  test('10. Fails when fees amount is negative', () => {
    const result = validateLoanPaymentInput({ ...validBase, feesAmount: -10 });
    expect(result.isValid).toBe(false);
    expect(result.errors.feesAmount).toBeDefined();
  });

  test('11. Fails when new outstanding balance is negative upon balance update', () => {
    const result = validateLoanPaymentInput({ ...validBase, balanceUpdated: true, outstandingAfter: -500 });
    expect(result.isValid).toBe(false);
    expect(result.errors.outstandingAfter).toBeDefined();
  });

  test('12. Fails when loan ID is missing', () => {
    const result = validateLoanPaymentInput({ ...validBase, loanId: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.loanId).toBeDefined();
  });
});

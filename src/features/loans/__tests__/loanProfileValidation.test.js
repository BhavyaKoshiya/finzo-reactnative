import { validateLoanProfileInput } from '../utils/loanProfileValidation';

describe('Loan Profile Validation', () => {
  const validBase = {
    name: 'My Home Loan',
    loanType: 'home_loan',
    lenderName: 'SBI',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 750000,
    annualInterestRate: 8.5,
    emiAmount: 21450,
    originalTenure: { value: 60, unit: 'months' },
    remainingTenure: { value: 42, unit: 'months' },
    loanStartDate: '2024-01-15',
    nextEmiDate: '2026-08-15',
    processingFee: 5000,
  };

  test('1. Validates a correct loan profile successfully', () => {
    const result = validateLoanProfileInput(validBase);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toEqual(0);
  });

  test('2. Fails when loan name is missing or empty', () => {
    const result = validateLoanProfileInput({ ...validBase, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  test('3. Fails when loan type is invalid or unsupported', () => {
    const result = validateLoanProfileInput({ ...validBase, loanType: 'invalid_type' });
    expect(result.isValid).toBe(false);
    expect(result.errors.loanType).toBeDefined();
  });

  test('4. Fails when original principal is zero', () => {
    const result = validateLoanProfileInput({ ...validBase, originalPrincipal: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.originalPrincipal).toBeDefined();
  });

  test('5. Fails when original principal is negative', () => {
    const result = validateLoanProfileInput({ ...validBase, originalPrincipal: -500000 });
    expect(result.isValid).toBe(false);
    expect(result.errors.originalPrincipal).toBeDefined();
  });

  test('6. Fails when current outstanding exceeds original principal', () => {
    const result = validateLoanProfileInput({
      ...validBase,
      originalPrincipal: 1000000,
      currentOutstandingPrincipal: 1200000,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.currentOutstandingPrincipal).toBeDefined();
  });

  test('7. Fails when current outstanding is negative', () => {
    const result = validateLoanProfileInput({ ...validBase, currentOutstandingPrincipal: -100 });
    expect(result.isValid).toBe(false);
    expect(result.errors.currentOutstandingPrincipal).toBeDefined();
  });

  test('8. Fails when interest rate is negative', () => {
    const result = validateLoanProfileInput({ ...validBase, annualInterestRate: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors.annualInterestRate).toBeDefined();
  });

  test('9. Fails when EMI amount is zero or negative', () => {
    const result = validateLoanProfileInput({ ...validBase, emiAmount: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.emiAmount).toBeDefined();
  });

  test('10. Fails when original tenure is invalid or zero', () => {
    const result = validateLoanProfileInput({ ...validBase, originalTenure: { value: 0, unit: 'months' } });
    expect(result.isValid).toBe(false);
    expect(result.errors.originalTenure).toBeDefined();
  });

  test('11. Fails when remaining tenure exceeds original tenure', () => {
    const result = validateLoanProfileInput({
      ...validBase,
      originalTenure: { value: 2, unit: 'years' }, // 24 months
      remainingTenure: { value: 30, unit: 'months' }, // 30 months
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.remainingTenure).toBeDefined();
  });

  test('12. Fails when dates are invalid strings', () => {
    const result = validateLoanProfileInput({ ...validBase, loanStartDate: 'invalid-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors.loanStartDate).toBeDefined();
  });
});

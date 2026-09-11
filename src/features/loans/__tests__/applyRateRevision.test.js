import { applyRateRevision } from '../utils/applyRateRevision';
import { RATE_ADJUSTMENT_STRATEGIES } from '../types/rateRevisionTypes';

describe('applyRateRevision', () => {
  const sampleLoan = {
    id: 'loan_123',
    name: 'Home Loan SBI',
    originalPrincipal: 5000000,
    currentOutstandingPrincipal: 4000000,
    annualInterestRate: 8.5,
    emiAmount: 39391,
    remainingTenure: { value: 180, unit: 'months' }, // 15 years
    rateType: 'floating',
  };

  describe('Validation & Edge Cases', () => {
    test('returns error when loan profile is missing', () => {
      const result = applyRateRevision({ loan: null, newRate: 9.0 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Loan profile is required.');
    });

    test('returns error when new rate is invalid or non-positive', () => {
      const resultZero = applyRateRevision({ loan: sampleLoan, newRate: 0 });
      expect(resultZero.isValid).toBe(false);
      expect(resultZero.error).toBe('Interest rate must be greater than 0%.');

      const resultNeg = applyRateRevision({ loan: sampleLoan, newRate: -2.5 });
      expect(resultNeg.isValid).toBe(false);

      const resultNaN = applyRateRevision({ loan: sampleLoan, newRate: 'abc' });
      expect(resultNaN.isValid).toBe(false);
    });

    test('returns error when loan balance is zero or negative', () => {
      const zeroBalanceLoan = { ...sampleLoan, currentOutstandingPrincipal: 0, originalPrincipal: 0 };
      const result = applyRateRevision({ loan: zeroBalanceLoan, newRate: 9.0 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Loan has no outstanding balance.');
    });
  });

  describe('Strategy: Adjust EMI (Default Indian Banking Approach)', () => {
    test('calculates increased EMI on interest rate hike', () => {
      // 8.5% -> 9.0% on ₹40L for 180 months
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 9.0,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
      });

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.isNegativeAmortization).toBe(false);
      expect(result.calculatedNewEmi).toBeGreaterThan(sampleLoan.emiAmount);
      expect(result.deltaEmi).toBeGreaterThan(0);
      expect(result.appliedNewTenureMonths).toBe(180);
      expect(result.profileUpdates.annualInterestRate).toBe(9.0);
      expect(result.profileUpdates.emiAmount).toBe(result.appliedNewEmi);
    });

    test('calculates reduced EMI on interest rate cut', () => {
      // 8.5% -> 8.0% on ₹40L for 180 months
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 8.0,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
      });

      expect(result.isValid).toBe(true);
      expect(result.calculatedNewEmi).toBeLessThan(sampleLoan.emiAmount);
      expect(result.deltaEmi).toBeLessThan(0);
      expect(result.appliedNewTenureMonths).toBe(180);
      expect(result.profileUpdates.annualInterestRate).toBe(8.0);
    });

    test('accepts exact bank EMI override', () => {
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 9.0,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
        exactNewEmi: 45000,
      });

      expect(result.isValid).toBe(true);
      expect(result.appliedNewEmi).toBe(45000);
      expect(result.profileUpdates.emiAmount).toBe(45000);
    });
  });

  describe('Strategy: Adjust Tenure', () => {
    test('extends remaining tenure on interest rate hike while keeping EMI same', () => {
      // 8.5% -> 8.75% keeping EMI constant
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 8.75,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE,
      });

      expect(result.isValid).toBe(true);
      expect(result.appliedNewEmi).toBe(sampleLoan.emiAmount);
      expect(result.appliedNewTenureMonths).toBeGreaterThan(180);
      expect(result.deltaTenureMonths).toBeGreaterThan(0);
      expect(result.profileUpdates.remainingTenure.value).toBe(result.appliedNewTenureMonths);
    });

    test('reduces remaining tenure on interest rate cut while keeping EMI same', () => {
      // 8.5% -> 7.75%
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 7.75,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE,
      });

      expect(result.isValid).toBe(true);
      expect(result.appliedNewTenureMonths).toBeLessThan(180);
      expect(result.deltaTenureMonths).toBeLessThan(0);
    });

    test('accepts exact bank tenure override', () => {
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 8.75,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE,
        exactNewTenureMonths: 195,
      });

      expect(result.isValid).toBe(true);
      expect(result.appliedNewTenureMonths).toBe(195);
      expect(result.profileUpdates.remainingTenure.value).toBe(195);
    });

    test('detects negative amortization when rate hike causes monthly interest >= current EMI', () => {
      // Balance 40L, current EMI 43,391.
      // If rate hikes to 15%: monthly interest is 40,00,000 * 15 / 12 / 100 = ₹50,000 > current EMI (₹43,391)
      const result = applyRateRevision({
        loan: sampleLoan,
        newRate: 15.0,
        strategy: RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE,
      });

      expect(result.isValid).toBe(false);
      expect(result.isNegativeAmortization).toBe(true);
      expect(result.error).toContain('cannot cover monthly interest');
      expect(result.warning).toBeDefined();
    });
  });
});

import { applyPrepaymentStrategy } from '../utils/applyPrepaymentStrategy';
import { PREPAYMENT_STRATEGIES } from '../constants/loanPaymentConstants';

describe('applyPrepaymentStrategy', () => {
  const baseLoan = {
    id: 'loan_123',
    name: 'Home Loan',
    annualInterestRate: 9,
    emiAmount: 25000,
    remainingTenure: {
      value: 60,
      unit: 'months',
    },
    currentOutstandingPrincipal: 1200000,
  };

  test('returns empty object when parameters are missing or balance <= 0', () => {
    expect(applyPrepaymentStrategy({ loan: null, newBalance: 1000000, strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE })).toEqual({});
    expect(applyPrepaymentStrategy({ loan: baseLoan, newBalance: 0, strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE })).toEqual({});
    expect(applyPrepaymentStrategy({ loan: baseLoan, newBalance: -500, strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE })).toEqual({});
    expect(applyPrepaymentStrategy({ loan: baseLoan, newBalance: 1000000, strategy: null })).toEqual({});
    expect(applyPrepaymentStrategy({ loan: baseLoan, newBalance: 1000000, strategy: 'invalid_strategy' })).toEqual({});
  });

  test('reduce_emi strategy lowers monthly EMI while keeping tenure unchanged', () => {
    const result = applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000, // Reduced from 12L to 10L
      strategy: PREPAYMENT_STRATEGIES.REDUCE_EMI,
    });

    expect(result).toHaveProperty('emiAmount');
    expect(typeof result.emiAmount).toBe('number');
    expect(result.emiAmount).toBeLessThan(baseLoan.emiAmount);
    expect(result.emiAmount).toBeGreaterThan(0);
    // Tenure should NOT be updated in result
    expect(result.remainingTenure).toBeUndefined();
  });

  test('reduce_tenure strategy reduces remaining tenure months while keeping EMI unchanged', () => {
    const result = applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000, // Reduced from 12L to 10L
      strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE,
    });

    expect(result).toHaveProperty('remainingTenure');
    expect(result.remainingTenure.unit).toBe('months');
    expect(result.remainingTenure.value).toBeLessThan(60);
    expect(result.remainingTenure.value).toBeGreaterThan(0);
    // emiAmount should NOT be updated in result
    expect(result.emiAmount).toBeUndefined();
  });

  test('handles remainingTenure with unit "years"', () => {
    const loanWithYears = {
      ...baseLoan,
      remainingTenure: {
        value: 5,
        unit: 'years',
      },
    };

    const result = applyPrepaymentStrategy({
      loan: loanWithYears,
      newBalance: 1000000,
      strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE,
    });

    expect(result).toHaveProperty('remainingTenure');
    expect(result.remainingTenure.unit).toBe('months');
    expect(result.remainingTenure.value).toBeLessThan(60);
    expect(result.remainingTenure.value).toBeGreaterThan(0);
  });

  test('does not mutate the original loan object', () => {
    const loanCopy = JSON.parse(JSON.stringify(baseLoan));
    applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000,
      strategy: PREPAYMENT_STRATEGIES.REDUCE_EMI,
    });
    expect(baseLoan).toEqual(loanCopy);

    applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000,
      strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE,
    });
    expect(baseLoan).toEqual(loanCopy);
  });

  test('uses exactNewEmi when provided instead of calculated EMI', () => {
    const result = applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000,
      strategy: PREPAYMENT_STRATEGIES.REDUCE_EMI,
      exactNewEmi: 21850,
    });

    expect(result).toEqual({
      emiAmount: 21850,
    });
  });

  test('uses exactNewTenureMonths when provided instead of calculated tenure', () => {
    const result = applyPrepaymentStrategy({
      loan: baseLoan,
      newBalance: 1000000,
      strategy: PREPAYMENT_STRATEGIES.REDUCE_TENURE,
      exactNewTenureMonths: 43,
    });

    expect(result).toEqual({
      remainingTenure: {
        value: 43,
        unit: 'months',
      },
    });
  });
});

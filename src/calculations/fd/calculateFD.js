import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateFDInput, FREQUENCY_COMPOUND_MAP } from './fdValidation';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates Fixed Deposit maturity amount and interest earned.
 * Formula: A = P * (1 + (r / n))^(n * t)
 * @param {number|string} principal
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureYears
 * @param {string} compoundingFrequency - 'monthly'|'quarterly'|'half-yearly'|'yearly'
 * @returns {Object} Standard result contract
 */
export const calculateFD = (
  principal,
  annualInterestRate,
  tenureYears,
  compoundingFrequency = 'quarterly'
) => {
  const validationError = validateFDInput(
    principal,
    annualInterestRate,
    tenureYears,
    compoundingFrequency
  );
  if (validationError) return validationError;

  const P = toDecimal(normalizeNumberInput(principal));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const T = toDecimal(normalizeNumberInput(tenureYears));

  const nTimesPerYear = FREQUENCY_COMPOUND_MAP[compoundingFrequency] || 4;
  const n = toDecimal(nTimesPerYear);

  let maturityAmount;

  if (R.isZero()) {
    maturityAmount = P;
  } else {
    // r = R / 100
    const r = R.dividedBy(100);
    // (1 + r / n)
    const base = r.dividedBy(n).plus(1);
    // exponent = n * T
    const exponent = n.times(T);
    // A = P * base^exponent
    maturityAmount = P.times(base.pow(exponent));
  }

  const interestEarned = maturityAmount.minus(P);

  const roundedMaturity = roundCurrency(maturityAmount);
  const roundedInterest = roundCurrency(interestEarned);
  const roundedPrincipal = roundCurrency(P);

  return createSuccessResult({
    maturityAmount: roundedMaturity,
    interestEarned: roundedInterest,
    principal: roundedPrincipal,
    annualInterestRate: decimalToNumber(R),
    tenureYears: decimalToNumber(T),
    compoundingFrequency,
  });
};

/**
 * Generates a period-by-period compounding growth schedule for Fixed Deposit.
 * @param {number|string} principal
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureYears
 * @param {string} compoundingFrequency
 * @returns {Array<Object>} List of compounding period snapshots
 */
export const calculateFDGrowthSchedule = (
  principal,
  annualInterestRate,
  tenureYears,
  compoundingFrequency = 'quarterly'
) => {
  const nTimesPerYear = FREQUENCY_COMPOUND_MAP[compoundingFrequency] || 4;
  const years = normalizeNumberInput(tenureYears);
  if (isNaN(years) || years <= 0) return [];

  const totalPeriods = Math.max(1, Math.round(years * nTimesPerYear));
  const schedule = [];

  for (let period = 1; period <= totalPeriods; period++) {
    const periodYears = period / nTimesPerYear;
    const result = calculateFD(principal, annualInterestRate, periodYears, compoundingFrequency);
    if (result.success) {
      schedule.push({
        period,
        tenureYears: Number(periodYears.toFixed(2)),
        principal: result.data.principal,
        interestEarned: result.data.interestEarned,
        maturityAmount: result.data.maturityAmount,
      });
    }
  }

  return schedule;
};

export default calculateFD;

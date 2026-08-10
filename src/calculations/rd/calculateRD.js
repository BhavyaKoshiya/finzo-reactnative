import { Decimal, toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateRDInput } from './rdValidation';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates Recurring Deposit maturity amount, total deposited, and interest earned.
 * Uses standard Indian bank quarterly compounding schedule for monthly deposits.
 * @param {number|string} monthlyDeposit
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureMonths
 * @returns {Object} Standard result contract
 */
export const calculateRD = (monthlyDeposit, annualInterestRate, tenureMonths) => {
  const validationError = validateRDInput(monthlyDeposit, annualInterestRate, tenureMonths);
  if (validationError) return validationError;

  const P = toDecimal(normalizeNumberInput(monthlyDeposit));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const N = normalizeNumberInput(tenureMonths);

  const totalDeposited = P.times(N);
  let maturityAmount = new Decimal(0);

  if (R.isZero()) {
    maturityAmount = totalDeposited;
  } else {
    // Quarterly compounding factor: base = 1 + (R / 4 / 100)
    const base = R.dividedBy(400).plus(1);

    for (let monthIndex = 1; monthIndex <= N; monthIndex++) {
      // Remaining tenure in years for this specific deposit = (N - monthIndex + 1) / 12
      const remainingMonths = N - monthIndex + 1;
      const exponent = new Decimal(4).times(remainingMonths).dividedBy(12);
      const depositMaturity = P.times(base.pow(exponent));
      maturityAmount = maturityAmount.plus(depositMaturity);
    }
  }

  const interestEarned = maturityAmount.minus(totalDeposited);

  const roundedMaturity = roundCurrency(maturityAmount);
  const roundedDeposited = roundCurrency(totalDeposited);
  const roundedInterest = roundCurrency(interestEarned);

  return createSuccessResult({
    maturityAmount: roundedMaturity,
    totalDeposited: roundedDeposited,
    interestEarned: roundedInterest,
    monthlyDeposit: decimalToNumber(P),
    annualInterestRate: decimalToNumber(R),
    tenureMonths: N,
  });
};

export default calculateRD;

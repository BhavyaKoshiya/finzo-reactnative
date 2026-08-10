import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateSIPInput } from './sipValidation';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates SIP maturity amount, total invested, and estimated returns.
 * Uses beginning-of-month annuity due compounding model: M = P * (((1+i)^n - 1)/i) * (1+i)
 * @param {number|string} monthlyInvestment
 * @param {number|string} annualReturnRate
 * @param {number|string} tenureMonths
 * @returns {Object} Standard result contract
 */
export const calculateSIP = (monthlyInvestment, annualReturnRate, tenureMonths) => {
  const validationError = validateSIPInput(monthlyInvestment, annualReturnRate, tenureMonths);
  if (validationError) return validationError;

  const P = toDecimal(normalizeNumberInput(monthlyInvestment));
  const R = toDecimal(normalizeNumberInput(annualReturnRate));
  const N = toDecimal(normalizeNumberInput(tenureMonths));

  const totalInvested = P.times(N);
  let maturityAmount;

  if (R.isZero()) {
    maturityAmount = totalInvested;
  } else {
    // monthly return rate i = R / 12 / 100
    const i = R.dividedBy(12).dividedBy(100);
    // (1 + i)^N
    const compound = i.plus(1).pow(N);
    // M = P * ((1+i)^N - 1) / i * (1 + i)
    maturityAmount = P.times(compound.minus(1)).dividedBy(i).times(i.plus(1));
  }

  const estimatedReturns = maturityAmount.minus(totalInvested);

  const roundedMaturity = roundCurrency(maturityAmount);
  const roundedInvested = roundCurrency(totalInvested);
  const roundedReturns = roundCurrency(estimatedReturns);

  return createSuccessResult({
    maturityAmount: roundedMaturity,
    totalInvested: roundedInvested,
    estimatedReturns: roundedReturns,
    monthlyInvestment: decimalToNumber(P),
    annualReturnRate: decimalToNumber(R),
    tenureMonths: decimalToNumber(N),
  });
};

export default calculateSIP;

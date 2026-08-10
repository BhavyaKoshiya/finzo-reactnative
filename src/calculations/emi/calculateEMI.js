import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateEMIInput } from './emiValidation';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates monthly EMI, total payment, and total interest.
 * @param {number|string} principal
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureMonths
 * @returns {Object} Standard result contract
 */
export const calculateEMI = (principal, annualInterestRate, tenureMonths) => {
  const validationError = validateEMIInput(principal, annualInterestRate, tenureMonths);
  if (validationError) return validationError;

  const P = toDecimal(normalizeNumberInput(principal));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const N = toDecimal(normalizeNumberInput(tenureMonths));

  let monthlyEMI;

  if (R.isZero()) {
    monthlyEMI = P.dividedBy(N);
  } else {
    // monthly interest rate r = R / 12 / 100
    const r = R.dividedBy(12).dividedBy(100);
    // (1 + r)^N
    const compound = r.plus(1).pow(N);
    // EMI = P * r * (1+r)^N / ((1+r)^N - 1)
    const numerator = P.times(r).times(compound);
    const denominator = compound.minus(1);
    monthlyEMI = numerator.dividedBy(denominator);
  }

  const totalPayment = monthlyEMI.times(N);
  const totalInterest = totalPayment.minus(P);

  const roundedEMI = roundCurrency(monthlyEMI);
  const roundedTotalPayment = roundCurrency(totalPayment);
  const roundedTotalInterest = roundCurrency(totalInterest);
  const roundedPrincipal = roundCurrency(P);

  return createSuccessResult({
    monthlyEMI: roundedEMI,
    totalPayment: roundedTotalPayment,
    totalInterest: roundedTotalInterest,
    principal: roundedPrincipal,
    annualInterestRate: decimalToNumber(R),
    tenureMonths: decimalToNumber(N),
  });
};

export default calculateEMI;

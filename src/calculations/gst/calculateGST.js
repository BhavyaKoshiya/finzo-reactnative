import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateGSTInput } from './gstValidation';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates GST amount, base amount, and total amount for Exclusive or Inclusive mode.
 * @param {number|string} amount
 * @param {number|string} gstRate
 * @param {string} mode - 'exclusive' | 'inclusive'
 * @returns {Object} Standard result contract
 */
export const calculateGST = (amount, gstRate, mode = 'exclusive') => {
  const validationError = validateGSTInput(amount, gstRate, mode);
  if (validationError) return validationError;

  const A = toDecimal(normalizeNumberInput(amount));
  const R = toDecimal(normalizeNumberInput(gstRate));
  const rateFactor = R.dividedBy(100);

  let baseAmount;
  let gstAmount;
  let totalAmount;

  if (mode === 'inclusive') {
    totalAmount = A;
    // baseAmount = A / (1 + rateFactor)
    baseAmount = A.dividedBy(rateFactor.plus(1));
    gstAmount = totalAmount.minus(baseAmount);
  } else {
    // exclusive mode
    baseAmount = A;
    gstAmount = A.times(rateFactor);
    totalAmount = baseAmount.plus(gstAmount);
  }

  const roundedBase = roundCurrency(baseAmount);
  const roundedGST = roundCurrency(gstAmount);
  const roundedTotal = roundCurrency(totalAmount);

  return createSuccessResult({
    baseAmount: roundedBase,
    gstAmount: roundedGST,
    totalAmount: roundedTotal,
    gstRate: decimalToNumber(R),
    mode,
  });
};

export default calculateGST;

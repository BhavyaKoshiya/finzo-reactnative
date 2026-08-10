import { toDecimal, decimalToNumber } from './decimal';
import { roundPercentage } from './rounding';
import { createSuccessResult, createErrorResult, normalizeNumberInput, ERROR_CODES } from './validation';
import { formatPercentage } from '../../utils/financeFormatters';

export { formatPercentage };

/**
 * Calculates percentage of a value: (value * percentage) / 100
 * @param {number|string} value
 * @param {number|string} percentage
 * @returns {Object} Result contract
 */
export const percentageOf = (value, percentage) => {
  const v = normalizeNumberInput(value);
  const p = normalizeNumberInput(percentage);

  if (v === null) {
    return createErrorResult({
      field: 'value',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'Value must be a valid number.',
    });
  }
  if (p === null) {
    return createErrorResult({
      field: 'percentage',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'Percentage must be a valid number.',
    });
  }

  const decVal = toDecimal(v);
  const decPct = toDecimal(p);
  const result = decVal.times(decPct).dividedBy(100);

  return createSuccessResult({
    value: v,
    percentage: p,
    result: decimalToNumber(result),
  });
};

/**
 * Calculates percentage change: ((newValue - oldValue) / oldValue) * 100
 * @param {number|string} oldValue
 * @param {number|string} newValue
 * @returns {Object} Result contract
 */
export const percentageChange = (oldValue, newValue) => {
  const oldVal = normalizeNumberInput(oldValue);
  const newVal = normalizeNumberInput(newValue);

  if (oldVal === null) {
    return createErrorResult({
      field: 'oldValue',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'Old value must be a valid number.',
    });
  }
  if (newVal === null) {
    return createErrorResult({
      field: 'newValue',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'New value must be a valid number.',
    });
  }
  if (oldVal === 0) {
    return createErrorResult({
      field: 'oldValue',
      code: ERROR_CODES.MUST_BE_POSITIVE,
      message: 'Old value cannot be zero for percentage change calculation.',
    });
  }

  const decOld = toDecimal(oldVal);
  const decNew = toDecimal(newVal);
  const change = decNew.minus(decOld);
  const pctChange = change.dividedBy(decOld.abs()).times(100);

  const roundedPct = roundPercentage(pctChange);
  const isIncrease = decNew.greaterThan(decOld);

  return createSuccessResult({
    oldValue: oldVal,
    newValue: newVal,
    difference: decimalToNumber(change),
    percentageChange: roundedPct,
    isIncrease,
  });
};

/**
 * Calculates percentage difference between two values: (|valA - valB| / ((valA + valB)/2)) * 100
 * @param {number|string} valA
 * @param {number|string} valB
 * @returns {Object} Result contract
 */
export const percentageDifference = (valA, valB) => {
  const numA = normalizeNumberInput(valA);
  const numB = normalizeNumberInput(valB);

  if (numA === null) {
    return createErrorResult({
      field: 'valA',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'First value must be a valid number.',
    });
  }
  if (numB === null) {
    return createErrorResult({
      field: 'valB',
      code: ERROR_CODES.INVALID_NUMBER,
      message: 'Second value must be a valid number.',
    });
  }

  const decA = toDecimal(numA);
  const decB = toDecimal(numB);
  const average = decA.plus(decB).dividedBy(2);

  if (average.isZero()) {
    return createSuccessResult({
      valA: numA,
      valB: numB,
      difference: 0,
      percentageDifference: 0,
    });
  }

  const absDiff = decA.minus(decB).abs();
  const pctDiff = absDiff.dividedBy(average.abs()).times(100);

  return createSuccessResult({
    valA: numA,
    valB: numB,
    difference: decimalToNumber(absDiff),
    percentageDifference: roundPercentage(pctDiff),
  });
};

export default {
  percentageOf,
  percentageChange,
  percentageDifference,
  formatPercentage,
};

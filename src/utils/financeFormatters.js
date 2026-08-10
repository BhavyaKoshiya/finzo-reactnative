import { formatINR, formatINRCompact } from '../calculations/core/currency';
import { normalizeNumberInput } from '../calculations/core/validation';
import { roundPercentage } from '../calculations/core/rounding';

/**
 * Public INR currency formatter for UI presentation.
 * @param {number|string} value
 * @param {Object} options
 * @returns {string}
 */
export const formatCurrency = (value, options = {}) => {
  return formatINR(value, options);
};

/**
 * Public compact INR currency formatter (e.g. ₹10 L, ₹1.5 Cr).
 * @param {number|string} value
 * @returns {string}
 */
export const formatCurrencyCompact = (value) => {
  return formatINRCompact(value);
};

/**
 * Formats a percentage value for display (e.g. 8.5 -> "8.50%").
 * @param {number|string} value
 * @param {number} decimalPlaces
 * @returns {string}
 */
export const formatPercentage = (value, decimalPlaces = 2) => {
  const num = normalizeNumberInput(value);
  if (num === null) return '0.00%';
  const rounded = roundPercentage(num);
  return `${rounded.toFixed(decimalPlaces)}%`;
};

/**
 * Formats a number with Indian locale separators.
 * @param {number|string} value
 * @param {Object} options
 * @returns {string}
 */
export const formatNumber = (value, options = {}) => {
  const num = normalizeNumberInput(value);
  if (num === null) return '0';
  const formatter = new Intl.NumberFormat('en-IN', options);
  return formatter.format(num);
};

export default {
  formatCurrency,
  formatCurrencyCompact,
  formatPercentage,
  formatNumber,
};

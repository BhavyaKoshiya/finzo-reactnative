import { normalizeNumberInput } from './validation';
import { roundCurrency } from './rounding';

/**
 * Formats a numeric value into INR currency string with Indian numbering system.
 * Example: 1000000 -> ₹10,00,000
 * @param {number|string} value
 * @param {Object} options - { includeSymbol: true, decimalPlaces: 0|2 }
 * @returns {string}
 */
export const formatINR = (value, options = {}) => {
  const num = normalizeNumberInput(value);
  if (num === null) return '₹0';

  const { includeSymbol = true, decimalPlaces } = options;

  // Determine decimal places: default to 2 if fractional part exists, else 0 unless forced
  const roundedNum = roundCurrency(num);
  const fractionPart = roundedNum % 1 !== 0;
  const fractionDigits = decimalPlaces !== undefined ? decimalPlaces : (fractionPart ? 2 : 0);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(roundedNum);
};

/**
 * Formats monetary amounts in compact Indian notation (₹10 L, ₹1.5 Cr, ₹50 K).
 * @param {number|string} value
 * @returns {string}
 */
export const formatINRCompact = (value) => {
  const num = normalizeNumberInput(value);
  if (num === null || num === 0) return '₹0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 10000000) {
    const cr = (absNum / 10000000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    return `${sign}₹${cr} Cr`;
  }
  if (absNum >= 100000) {
    const lakh = (absNum / 100000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    return `${sign}₹${lakh} L`;
  }
  if (absNum >= 1000) {
    const k = (absNum / 1000).toFixed(1).replace(/\.0$/, '');
    return `${sign}₹${k} K`;
  }

  return formatINR(num, { decimalPlaces: 0 });
};

/**
 * Parses an INR string back to canonical number.
 * @param {string} str
 * @returns {number|null}
 */
export const parseINR = (str) => {
  return normalizeNumberInput(str);
};

export default {
  formatINR,
  formatINRCompact,
  parseINR,
};

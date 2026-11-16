import {
  DEFAULT_CURRENCY,
  formatMoney,
  formatMoneyCompact,
  getCurrencyMeta,
} from '../calculations/core/currency';
import { normalizeNumberInput } from '../calculations/core/validation';
import { roundPercentage } from '../calculations/core/rounding';

/**
 * The currency every UI amount is shown in. Kept in sync with the `settings.currency`
 * Redux value by the app root (see CurrencyProvider), so formatters can be called
 * from anywhere without passing the currency through.
 */
let activeCurrency = DEFAULT_CURRENCY;

/** @param {string} code - ISO 4217 code; unknown codes fall back to INR */
export const setActiveCurrency = (code) => {
  activeCurrency = getCurrencyMeta(code).code;
};

export const getActiveCurrency = () => activeCurrency;

/** Symbol without padding, e.g. "₹", "$" or "AED" (for input prefixes and labels). */
export const getCurrencySymbol = () => getCurrencyMeta(activeCurrency).symbol.trim();

/** Whether India-specific wording (RBI, repo rate) applies. */
export const isIndianCurrency = () => activeCurrency === 'INR';

/**
 * Public currency formatter for UI presentation, in the active currency.
 * @param {number|string} value
 * @param {Object} options - { includeSymbol: true, decimalPlaces: 0|2 }
 * @returns {string}
 */
export const formatCurrency = (value, options = {}) => {
  return formatMoney(value, { ...options, currency: activeCurrency });
};

/**
 * Public compact currency formatter (e.g. ₹10 L, ₹1.5 Cr, or $1.5 M).
 * @param {number|string} value
 * @returns {string}
 */
export const formatCurrencyCompact = (value) => {
  return formatMoneyCompact(value, activeCurrency);
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
 * Formats a number with the active currency's digit grouping (10,00,000 or 1,000,000).
 * @param {number|string} value
 * @param {Object} options
 * @returns {string}
 */
export const formatNumber = (value, options = {}) => {
  const num = normalizeNumberInput(value);
  if (num === null) return '0';
  const locale = getCurrencyMeta(activeCurrency).lakhNotation ? 'en-IN' : 'en-US';
  const formatter = new Intl.NumberFormat(locale, options);
  return formatter.format(num);
};

export default {
  formatCurrency,
  formatCurrencyCompact,
  formatPercentage,
  formatNumber,
};

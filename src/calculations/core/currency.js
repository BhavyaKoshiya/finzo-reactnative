import { normalizeNumberInput } from './validation';
import { roundCurrency } from './rounding';

/**
 * Supported display currencies. Amounts are never converted between currencies:
 * the user enters their own loan in their own currency, and the currency only
 * controls the symbol and the digit grouping.
 *
 * `lakhNotation` currencies group digits as 10,00,000 and abbreviate as L / Cr;
 * the others group as 1,000,000 and abbreviate as K / M / B.
 */
export const DEFAULT_CURRENCY = 'INR';
export const FALLBACK_CURRENCY = 'USD';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', lakhNotation: true },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'QAR ', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'KWD ', name: 'Kuwaiti Dinar' },
  { code: 'OMR', symbol: 'OMR ', name: 'Omani Rial' },
  { code: 'BHD', symbol: 'BHD ', name: 'Bahraini Dinar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM ', name: 'Malaysian Ringgit' },
  { code: 'ZAR', symbol: 'R ', name: 'South African Rand' },
  { code: 'NPR', symbol: 'Rs ', name: 'Nepalese Rupee', lakhNotation: true },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', lakhNotation: true },
  { code: 'PKR', symbol: 'Rs ', name: 'Pakistani Rupee' },
  { code: 'LKR', symbol: 'Rs ', name: 'Sri Lankan Rupee' },
];

const CURRENCY_BY_CODE = CURRENCIES.reduce((map, currency) => {
  map[currency.code] = currency;
  return map;
}, {});

export const isSupportedCurrency = (code) => Boolean(CURRENCY_BY_CODE[code]);

/**
 * @param {string} code - ISO 4217 code
 * @returns {{ code: string, symbol: string, name: string, lakhNotation?: boolean }}
 *   The currency, or INR for unknown codes (persisted settings are untrusted).
 */
export const getCurrencyMeta = (code) => CURRENCY_BY_CODE[code] || CURRENCY_BY_CODE[DEFAULT_CURRENCY];

const groupingLocale = (meta) => (meta.lakhNotation ? 'en-IN' : 'en-US');

/**
 * Formats an amount in the given currency, e.g. ₹10,00,000 or $1,000,000.50.
 * @param {number|string} value
 * @param {Object} options - { currency: 'INR', includeSymbol: true, decimalPlaces: 0|2 }
 * @returns {string}
 */
export const formatMoney = (value, options = {}) => {
  const { currency = DEFAULT_CURRENCY, includeSymbol = true, decimalPlaces } = options;
  const meta = getCurrencyMeta(currency);
  const symbol = includeSymbol ? meta.symbol : '';

  const num = normalizeNumberInput(value);
  if (num === null) return `${symbol}0`;

  // Default to 2 decimal places only when there is a fractional part
  const roundedNum = roundCurrency(num);
  const fractionDigits = decimalPlaces !== undefined ? decimalPlaces : (roundedNum % 1 !== 0 ? 2 : 0);

  const digits = new Intl.NumberFormat(groupingLocale(meta), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(roundedNum));

  // Rounding can turn a tiny negative into zero; never show "-0"
  const isNegative = roundedNum < 0 && Number(digits.replace(/,/g, '')) !== 0;
  return `${isNegative ? '-' : ''}${symbol}${digits}`;
};

const trimDecimals = (num, places) =>
  num.toFixed(places).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

/**
 * Formats an amount compactly: ₹10 L, ₹1.5 Cr for lakh-notation currencies,
 * $1.5 M, $250 K for the others.
 * @param {number|string} value
 * @param {string} [currency]
 * @returns {string}
 */
export const formatMoneyCompact = (value, currency = DEFAULT_CURRENCY) => {
  const meta = getCurrencyMeta(currency);
  const symbol = meta.symbol;
  const num = normalizeNumberInput(value);
  if (num === null || num === 0) return `${symbol}0`;

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  const units = meta.lakhNotation
    ? [
        [10000000, 'Cr', 2],
        [100000, 'L', 2],
        [1000, 'K', 1],
      ]
    : [
        [1000000000, 'B', 2],
        [1000000, 'M', 2],
        [1000, 'K', 1],
      ];

  for (const [divisor, unit, places] of units) {
    if (absNum >= divisor) {
      return `${sign}${symbol}${trimDecimals(absNum / divisor, places)} ${unit}`;
    }
  }

  return formatMoney(num, { currency, decimalPlaces: 0 });
};

/**
 * Formats a numeric value into INR currency string with Indian numbering system.
 * Example: 1000000 -> ₹10,00,000
 * @param {number|string} value
 * @param {Object} options - { includeSymbol: true, decimalPlaces: 0|2 }
 * @returns {string}
 */
export const formatINR = (value, options = {}) => formatMoney(value, { ...options, currency: 'INR' });

/**
 * Formats monetary amounts in compact Indian notation (₹10 L, ₹1.5 Cr, ₹50 K).
 * @param {number|string} value
 * @returns {string}
 */
export const formatINRCompact = (value) => formatMoneyCompact(value, 'INR');

/**
 * Parses an INR string back to canonical number.
 * @param {string} str
 * @returns {number|null}
 */
export const parseINR = (str) => {
  return normalizeNumberInput(str);
};

export default {
  CURRENCIES,
  getCurrencyMeta,
  formatMoney,
  formatMoneyCompact,
  formatINR,
  formatINRCompact,
  parseINR,
};

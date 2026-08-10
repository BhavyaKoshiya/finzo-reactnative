import Decimal from 'decimal.js';

// Configure Decimal.js precision and rounding defaults
Decimal.set({
  precision: 30,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 20,
});

/**
 * Safely converts an input value into a Decimal instance.
 * @param {number|string|Decimal} val
 * @returns {Decimal}
 */
export const toDecimal = (val) => {
  if (val instanceof Decimal) {
    return val;
  }
  if (val === null || val === undefined || val === '') {
    return new Decimal(0);
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').trim();
    if (cleaned === '' || isNaN(cleaned)) {
      return new Decimal(0);
    }
    return new Decimal(cleaned);
  }
  return new Decimal(val);
};

/**
 * Checks if a value can be converted to a valid non-NaN Decimal.
 * @param {any} val
 * @returns {boolean}
 */
export const isDecimalValue = (val) => {
  if (val === null || val === undefined || val === '') return false;
  try {
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').trim();
      if (cleaned === '') return false;
      const d = new Decimal(cleaned);
      return !d.isNaN() && d.isFinite();
    }
    const d = new Decimal(val);
    return !d.isNaN() && d.isFinite();
  } catch (e) {
    return false;
  }
};

/**
 * Converts Decimal to JS number (for output payloads).
 * @param {Decimal|number} d
 * @returns {number}
 */
export const decimalToNumber = (d) => {
  if (d instanceof Decimal) {
    return d.toNumber();
  }
  return Number(d);
};

/**
 * Converts Decimal to plain string.
 * @param {Decimal|number} d
 * @returns {string}
 */
export const decimalToString = (d) => {
  if (d instanceof Decimal) {
    return d.toString();
  }
  return String(d);
};

export { Decimal };
export default Decimal;

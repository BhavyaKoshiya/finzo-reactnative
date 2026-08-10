import { Decimal, toDecimal, decimalToNumber } from './decimal';

/**
 * Rounds a Decimal/number to specified decimal places using ROUND_HALF_UP.
 * @param {Decimal|number|string} val
 * @param {number} places
 * @returns {number}
 */
export const roundToPlaces = (val, places = 2) => {
  const dec = toDecimal(val);
  const rounded = dec.toDecimalPlaces(places, Decimal.ROUND_HALF_UP);
  return decimalToNumber(rounded);
};

/**
 * Rounds monetary currency outputs to 2 decimal places.
 * @param {Decimal|number|string} val
 * @returns {number}
 */
export const roundCurrency = (val) => {
  return roundToPlaces(val, 2);
};

/**
 * Rounds percentage outputs to 2 decimal places.
 * @param {Decimal|number|string} val
 * @returns {number}
 */
export const roundPercentage = (val) => {
  return roundToPlaces(val, 2);
};

export default {
  roundToPlaces,
  roundCurrency,
  roundPercentage,
};

import { isDecimalValue, toDecimal, decimalToNumber } from './decimal';

export const ERROR_CODES = {
  REQUIRED: 'REQUIRED',
  INVALID_NUMBER: 'INVALID_NUMBER',
  MUST_BE_POSITIVE: 'MUST_BE_POSITIVE',
  MUST_BE_NON_NEGATIVE: 'MUST_BE_NON_NEGATIVE',
  BELOW_MINIMUM: 'BELOW_MINIMUM',
  ABOVE_MAXIMUM: 'ABOVE_MAXIMUM',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_FREQUENCY: 'INVALID_FREQUENCY',
  INVALID_DURATION: 'INVALID_DURATION',
};

/**
 * Normalizes input strings (removes ₹, commas, whitespace) into numeric value.
 * @param {string|number} input
 * @returns {number|null}
 */
export const normalizeNumberInput = (input) => {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  if (typeof input === 'number') {
    return isNaN(input) || !isFinite(input) ? null : input;
  }
  if (typeof input === 'string') {
    const cleaned = input.replace(/[₹,\s]/g, '').trim();
    if (cleaned === '' || !isDecimalValue(cleaned)) {
      return null;
    }
    return decimalToNumber(toDecimal(cleaned));
  }
  return null;
};

/**
 * Validates a numeric field against positivity, non-negativity, min, max constraints.
 * @param {any} rawValue
 * @param {string} fieldName
 * @param {Object} options - { required, positive, nonNegative, min, max, integerOnly }
 * @returns {Object|null} Error object or null if valid
 */
export const validateNumericField = (rawValue, fieldName, options = {}) => {
  const {
    required = true,
    positive = false,
    nonNegative = false,
    min,
    max,
    integerOnly = false,
    customName,
  } = options;

  const label = customName || fieldName;

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    if (required) {
      return {
        field: fieldName,
        code: ERROR_CODES.REQUIRED,
        message: `${label} is required.`,
      };
    }
    return null;
  }

  const num = normalizeNumberInput(rawValue);
  if (num === null) {
    return {
      field: fieldName,
      code: ERROR_CODES.INVALID_NUMBER,
      message: `${label} must be a valid number.`,
    };
  }

  if (positive && num <= 0) {
    return {
      field: fieldName,
      code: ERROR_CODES.MUST_BE_POSITIVE,
      message: `${label} must be greater than zero.`,
    };
  }

  if (nonNegative && num < 0) {
    return {
      field: fieldName,
      code: ERROR_CODES.MUST_BE_NON_NEGATIVE,
      message: `${label} cannot be negative.`,
    };
  }

  if (min !== undefined && num < min) {
    return {
      field: fieldName,
      code: ERROR_CODES.BELOW_MINIMUM,
      message: `${label} must be at least ${min}.`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      field: fieldName,
      code: ERROR_CODES.ABOVE_MAXIMUM,
      message: `${label} cannot exceed ${max}.`,
    };
  }

  if (integerOnly && !Number.isInteger(num)) {
    return {
      field: fieldName,
      code: ERROR_CODES.INVALID_NUMBER,
      message: `${label} must be a whole number.`,
    };
  }

  return null;
};

/**
 * Creates a standardized success response.
 * @param {Object} data
 * @returns {Object}
 */
export const createSuccessResult = (data) => ({
  success: true,
  data,
  errors: [],
});

/**
 * Creates a standardized error response.
 * @param {Array<Object>} errors
 * @returns {Object}
 */
export const createErrorResult = (errors) => ({
  success: false,
  data: null,
  errors: Array.isArray(errors) ? errors : [errors],
});

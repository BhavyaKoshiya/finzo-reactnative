import {
  normalizeNumberInput,
  validateNumericField,
  createSuccessResult,
  createErrorResult,
  ERROR_CODES,
} from '../validation';

describe('Validation Core Utilities', () => {
  describe('normalizeNumberInput', () => {
    it('should normalize various number and string representations', () => {
      expect(normalizeNumberInput(1000)).toBe(1000);
      expect(normalizeNumberInput('1000')).toBe(1000);
      expect(normalizeNumberInput('₹10,00,000')).toBe(1000000);
      expect(normalizeNumberInput(' 1,000.50 ')).toBe(1000.5);
    });

    it('should return null for invalid inputs', () => {
      expect(normalizeNumberInput('')).toBeNull();
      expect(normalizeNumberInput(null)).toBeNull();
      expect(normalizeNumberInput(undefined)).toBeNull();
      expect(normalizeNumberInput('abc')).toBeNull();
      expect(normalizeNumberInput(NaN)).toBeNull();
    });
  });

  describe('validateNumericField', () => {
    it('should validate required fields', () => {
      const err = validateNumericField('', 'amount', { required: true });
      expect(err).toEqual({
        field: 'amount',
        code: ERROR_CODES.REQUIRED,
        message: 'amount is required.',
      });
    });

    it('should validate positive fields', () => {
      const errZero = validateNumericField(0, 'principal', { positive: true });
      expect(errZero.code).toBe(ERROR_CODES.MUST_BE_POSITIVE);

      const errNeg = validateNumericField(-10, 'principal', { positive: true });
      expect(errNeg.code).toBe(ERROR_CODES.MUST_BE_POSITIVE);

      expect(validateNumericField(10, 'principal', { positive: true })).toBeNull();
    });

    it('should validate non-negative fields', () => {
      expect(validateNumericField(0, 'rate', { nonNegative: true })).toBeNull();
      const errNeg = validateNumericField(-1, 'rate', { nonNegative: true });
      expect(errNeg.code).toBe(ERROR_CODES.MUST_BE_NON_NEGATIVE);
    });

    it('should validate min and max boundaries', () => {
      const minErr = validateNumericField(5, 'tenure', { min: 10 });
      expect(minErr.code).toBe(ERROR_CODES.BELOW_MINIMUM);

      const maxErr = validateNumericField(150, 'tenure', { max: 100 });
      expect(maxErr.code).toBe(ERROR_CODES.ABOVE_MAXIMUM);
    });

    it('should validate integer constraint', () => {
      const err = validateNumericField(12.5, 'months', { integerOnly: true });
      expect(err.code).toBe(ERROR_CODES.INVALID_NUMBER);
    });
  });

  describe('Contract Helpers', () => {
    it('should create standardized success contract', () => {
      const result = createSuccessResult({ emi: 20000 });
      expect(result).toEqual({
        success: true,
        data: { emi: 20000 },
        errors: [],
      });
    });

    it('should create standardized error contract', () => {
      const result = createErrorResult({ field: 'amount', code: 'REQUIRED', message: 'Error' });
      expect(result).toEqual({
        success: false,
        data: null,
        errors: [{ field: 'amount', code: 'REQUIRED', message: 'Error' }],
      });
    });
  });
});

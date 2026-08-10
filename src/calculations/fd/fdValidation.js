import { validateNumericField, createErrorResult, ERROR_CODES } from '../core/validation';

export const MAX_FD_PRINCIPAL = 1000000000; // ₹100 Crore
export const MAX_FD_RATE = 100; // 100% p.a.
export const MAX_FD_YEARS = 50; // 50 years

export const FREQUENCY_COMPOUND_MAP = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  yearly: 1,
};

export const validateFDInput = (principal, annualInterestRate, tenureYears, compoundingFrequency = 'quarterly') => {
  const errors = [];

  const principalError = validateNumericField(principal, 'principal', {
    required: true,
    positive: true,
    max: MAX_FD_PRINCIPAL,
    customName: 'Principal amount',
  });
  if (principalError) errors.push(principalError);

  const rateError = validateNumericField(annualInterestRate, 'annualInterestRate', {
    required: true,
    nonNegative: true,
    max: MAX_FD_RATE,
    customName: 'Interest rate',
  });
  if (rateError) errors.push(rateError);

  const tenureError = validateNumericField(tenureYears, 'tenureYears', {
    required: true,
    positive: true,
    max: MAX_FD_YEARS,
    customName: 'Tenure (years)',
  });
  if (tenureError) errors.push(tenureError);

  if (!FREQUENCY_COMPOUND_MAP[compoundingFrequency]) {
    errors.push({
      field: 'compoundingFrequency',
      code: ERROR_CODES.INVALID_FREQUENCY,
      message: 'Compounding frequency must be monthly, quarterly, half-yearly, or yearly.',
    });
  }

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return null;
};

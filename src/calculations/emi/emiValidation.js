import { validateNumericField, createErrorResult } from '../core/validation';

export const MAX_PRINCIPAL = 1000000000; // ₹100 Crore
export const MAX_INTEREST_RATE = 100; // 100% p.a.
export const MAX_TENURE_MONTHS = 600; // 50 years

export const validateEMIInput = (principal, annualInterestRate, tenureMonths) => {
  const errors = [];

  const principalError = validateNumericField(principal, 'principal', {
    required: true,
    positive: true,
    max: MAX_PRINCIPAL,
    customName: 'Loan amount',
  });
  if (principalError) errors.push(principalError);

  const rateError = validateNumericField(annualInterestRate, 'annualInterestRate', {
    required: true,
    nonNegative: true,
    max: MAX_INTEREST_RATE,
    customName: 'Interest rate',
  });
  if (rateError) errors.push(rateError);

  const tenureError = validateNumericField(tenureMonths, 'tenureMonths', {
    required: true,
    positive: true,
    integerOnly: true,
    max: MAX_TENURE_MONTHS,
    customName: 'Tenure (months)',
  });
  if (tenureError) errors.push(tenureError);

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return null;
};

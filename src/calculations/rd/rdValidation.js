import { validateNumericField, createErrorResult } from '../core/validation';

export const MAX_RD_DEPOSIT = 10000000; // ₹1 Crore / month
export const MAX_RD_RATE = 100; // 100% p.a.
export const MAX_RD_TENURE_MONTHS = 600; // 50 years

export const validateRDInput = (monthlyDeposit, annualInterestRate, tenureMonths) => {
  const errors = [];

  const depositError = validateNumericField(monthlyDeposit, 'monthlyDeposit', {
    required: true,
    positive: true,
    max: MAX_RD_DEPOSIT,
    customName: 'Monthly deposit',
  });
  if (depositError) errors.push(depositError);

  const rateError = validateNumericField(annualInterestRate, 'annualInterestRate', {
    required: true,
    nonNegative: true,
    max: MAX_RD_RATE,
    customName: 'Interest rate',
  });
  if (rateError) errors.push(rateError);

  const tenureError = validateNumericField(tenureMonths, 'tenureMonths', {
    required: true,
    positive: true,
    integerOnly: true,
    max: MAX_RD_TENURE_MONTHS,
    customName: 'Tenure (months)',
  });
  if (tenureError) errors.push(tenureError);

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return null;
};

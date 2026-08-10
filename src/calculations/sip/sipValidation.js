import { validateNumericField, createErrorResult } from '../core/validation';

export const MAX_MONTHLY_INVESTMENT = 10000000; // ₹1 Crore / month
export const MAX_RETURN_RATE = 100; // 100% p.a.
export const MAX_SIP_TENURE_MONTHS = 600; // 50 years

export const validateSIPInput = (monthlyInvestment, annualReturnRate, tenureMonths) => {
  const errors = [];

  const investmentError = validateNumericField(monthlyInvestment, 'monthlyInvestment', {
    required: true,
    positive: true,
    max: MAX_MONTHLY_INVESTMENT,
    customName: 'Monthly investment',
  });
  if (investmentError) errors.push(investmentError);

  const rateError = validateNumericField(annualReturnRate, 'annualReturnRate', {
    required: true,
    nonNegative: true,
    max: MAX_RETURN_RATE,
    customName: 'Expected return rate',
  });
  if (rateError) errors.push(rateError);

  const tenureError = validateNumericField(tenureMonths, 'tenureMonths', {
    required: true,
    positive: true,
    integerOnly: true,
    max: MAX_SIP_TENURE_MONTHS,
    customName: 'Tenure (months)',
  });
  if (tenureError) errors.push(tenureError);

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return null;
};

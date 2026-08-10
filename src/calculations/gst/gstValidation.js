import { validateNumericField, createErrorResult, ERROR_CODES } from '../core/validation';

export const MAX_GST_AMOUNT = 1000000000; // ₹100 Crore
export const MAX_GST_RATE = 100; // 100%

export const validateGSTInput = (amount, gstRate, mode = 'exclusive') => {
  const errors = [];

  const amountError = validateNumericField(amount, 'amount', {
    required: true,
    positive: true,
    max: MAX_GST_AMOUNT,
    customName: 'Amount',
  });
  if (amountError) errors.push(amountError);

  const rateError = validateNumericField(gstRate, 'gstRate', {
    required: true,
    nonNegative: true,
    max: MAX_GST_RATE,
    customName: 'GST rate',
  });
  if (rateError) errors.push(rateError);

  if (mode !== 'exclusive' && mode !== 'inclusive') {
    errors.push({
      field: 'mode',
      code: ERROR_CODES.REQUIRED,
      message: 'GST mode must be either exclusive or inclusive.',
    });
  }

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return null;
};

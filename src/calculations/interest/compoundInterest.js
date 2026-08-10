import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateNumericField, createSuccessResult, createErrorResult, normalizeNumberInput, ERROR_CODES } from '../core/validation';
import { FREQUENCY_COMPOUND_MAP } from '../fd/fdValidation';

export const calculateCompoundInterest = (
  principal,
  annualInterestRate,
  tenureYears,
  compoundingFrequency = 'yearly'
) => {
  const errors = [];

  const pErr = validateNumericField(principal, 'principal', { required: true, positive: true, customName: 'Principal amount' });
  if (pErr) errors.push(pErr);

  const rErr = validateNumericField(annualInterestRate, 'annualInterestRate', { required: true, nonNegative: true, customName: 'Interest rate' });
  if (rErr) errors.push(rErr);

  const tErr = validateNumericField(tenureYears, 'tenureYears', { required: true, positive: true, customName: 'Tenure (years)' });
  if (tErr) errors.push(tErr);

  if (!FREQUENCY_COMPOUND_MAP[compoundingFrequency]) {
    errors.push({
      field: 'compoundingFrequency',
      code: ERROR_CODES.INVALID_FREQUENCY,
      message: 'Compounding frequency must be monthly, quarterly, half-yearly, or yearly.',
    });
  }

  if (errors.length > 0) return createErrorResult(errors);

  const P = toDecimal(normalizeNumberInput(principal));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const T = toDecimal(normalizeNumberInput(tenureYears));

  const nTimesPerYear = FREQUENCY_COMPOUND_MAP[compoundingFrequency] || 1;
  const n = toDecimal(nTimesPerYear);

  let maturityAmount;

  if (R.isZero()) {
    maturityAmount = P;
  } else {
    // r = R / 100
    const r = R.dividedBy(100);
    // (1 + r / n)^(n * T)
    const base = r.dividedBy(n).plus(1);
    const exponent = n.times(T);
    maturityAmount = P.times(base.pow(exponent));
  }

  const interestEarned = maturityAmount.minus(P);

  return createSuccessResult({
    principal: roundCurrency(P),
    interestEarned: roundCurrency(interestEarned),
    maturityAmount: roundCurrency(maturityAmount),
    annualInterestRate: decimalToNumber(R),
    tenureYears: decimalToNumber(T),
    compoundingFrequency,
  });
};

export default calculateCompoundInterest;

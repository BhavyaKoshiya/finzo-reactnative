import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateNumericField, createSuccessResult, createErrorResult, normalizeNumberInput } from '../core/validation';

export const calculateSimpleInterest = (principal, annualInterestRate, tenureYears) => {
  const errors = [];

  const pErr = validateNumericField(principal, 'principal', { required: true, positive: true, customName: 'Principal amount' });
  if (pErr) errors.push(pErr);

  const rErr = validateNumericField(annualInterestRate, 'annualInterestRate', { required: true, nonNegative: true, customName: 'Interest rate' });
  if (rErr) errors.push(rErr);

  const tErr = validateNumericField(tenureYears, 'tenureYears', { required: true, positive: true, customName: 'Tenure (years)' });
  if (tErr) errors.push(tErr);

  if (errors.length > 0) return createErrorResult(errors);

  const P = toDecimal(normalizeNumberInput(principal));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const T = toDecimal(normalizeNumberInput(tenureYears));

  // SI = P * R * T / 100
  const interest = P.times(R).times(T).dividedBy(100);
  const totalAmount = P.plus(interest);

  return createSuccessResult({
    principal: roundCurrency(P),
    interest: roundCurrency(interest),
    totalAmount: roundCurrency(totalAmount),
    annualInterestRate: decimalToNumber(R),
    tenureYears: decimalToNumber(T),
  });
};

export default calculateSimpleInterest;

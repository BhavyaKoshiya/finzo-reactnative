import { Decimal, toDecimal, decimalToNumber } from '../core/decimal';
import { roundPercentage } from '../core/rounding';
import { validateNumericField, createSuccessResult, createErrorResult, normalizeNumberInput } from '../core/validation';

export const calculateCAGR = (beginningValue, endingValue, tenureYears) => {
  const errors = [];

  const bvErr = validateNumericField(beginningValue, 'beginningValue', { required: true, positive: true, customName: 'Initial value' });
  if (bvErr) errors.push(bvErr);

  const evErr = validateNumericField(endingValue, 'endingValue', { required: true, nonNegative: true, customName: 'Final value' });
  if (evErr) errors.push(evErr);

  const yErr = validateNumericField(tenureYears, 'tenureYears', { required: true, positive: true, customName: 'Duration (years)' });
  if (yErr) errors.push(yErr);

  if (errors.length > 0) return createErrorResult(errors);

  const BV = toDecimal(normalizeNumberInput(beginningValue));
  const EV = toDecimal(normalizeNumberInput(endingValue));
  const Y = toDecimal(normalizeNumberInput(tenureYears));

  // CAGR = (EV / BV) ^ (1 / Y) - 1
  const ratio = EV.dividedBy(BV);
  const exponent = new Decimal(1).dividedBy(Y);
  const cagrFraction = ratio.pow(exponent).minus(1);
  const cagrPercentage = cagrFraction.times(100);

  const roundedCAGR = roundPercentage(cagrPercentage);
  const absoluteGain = EV.minus(BV);

  return createSuccessResult({
    cagr: roundedCAGR,
    initialValue: decimalToNumber(BV),
    finalValue: decimalToNumber(EV),
    absoluteGain: decimalToNumber(absoluteGain),
    tenureYears: decimalToNumber(Y),
  });
};

export default calculateCAGR;

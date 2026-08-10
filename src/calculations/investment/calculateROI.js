import { toDecimal, decimalToNumber } from '../core/decimal';
import { roundPercentage, roundCurrency } from '../core/rounding';
import { validateNumericField, createSuccessResult, createErrorResult, normalizeNumberInput } from '../core/validation';

export const calculateROI = (initialInvestment, finalValue) => {
  const errors = [];

  const invErr = validateNumericField(initialInvestment, 'initialInvestment', { required: true, positive: true, customName: 'Initial investment' });
  if (invErr) errors.push(invErr);

  const valErr = validateNumericField(finalValue, 'finalValue', { required: true, customName: 'Final value' });
  if (valErr) errors.push(valErr);

  if (errors.length > 0) return createErrorResult(errors);

  const C = toDecimal(normalizeNumberInput(initialInvestment));
  const G = toDecimal(normalizeNumberInput(finalValue));

  const netProfit = G.minus(C);
  const roiPercentage = netProfit.dividedBy(C).times(100);

  const roundedROI = roundPercentage(roiPercentage);
  const roundedNetProfit = roundCurrency(netProfit);

  return createSuccessResult({
    roi: roundedROI,
    netProfit: roundedNetProfit,
    initialInvestment: decimalToNumber(C),
    finalValue: decimalToNumber(G),
    isProfit: netProfit.greaterThanOrEqualTo(0),
  });
};

export default calculateROI;

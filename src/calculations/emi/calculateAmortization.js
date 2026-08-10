import { Decimal, toDecimal } from '../core/decimal';
import { roundCurrency } from '../core/rounding';
import { validateEMIInput } from './emiValidation';
import { calculateEMI } from './calculateEMI';
import { createSuccessResult, normalizeNumberInput } from '../core/validation';

/**
 * Calculates monthly amortization schedule for a loan.
 * @param {number|string} principal
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureMonths
 * @returns {Object} Standard result contract with schedule array
 */
export const calculateAmortization = (principal, annualInterestRate, tenureMonths) => {
  const validationError = validateEMIInput(principal, annualInterestRate, tenureMonths);
  if (validationError) return validationError;

  const emiResult = calculateEMI(principal, annualInterestRate, tenureMonths);
  if (!emiResult.success) return emiResult;

  const P = toDecimal(normalizeNumberInput(principal));
  const R = toDecimal(normalizeNumberInput(annualInterestRate));
  const N = normalizeNumberInput(tenureMonths);

  const monthlyEMI = toDecimal(emiResult.data.monthlyEMI);
  const r = R.isZero() ? new Decimal(0) : R.dividedBy(12).dividedBy(100);

  const schedule = [];
  let balance = P;

  for (let month = 1; month <= N; month++) {
    const openingBalance = balance;
    let interestAmount = openingBalance.times(r);
    let principalAmount = monthlyEMI.minus(interestAmount);

    // On last month, adjust principal payment to close out remaining balance exactly
    if (month === N || principalAmount.greaterThanOrEqualTo(openingBalance)) {
      principalAmount = openingBalance;
      balance = new Decimal(0);
    } else {
      balance = openingBalance.minus(principalAmount);
    }

    const roundedPayment = roundCurrency(principalAmount.plus(interestAmount));
    const roundedOpening = roundCurrency(openingBalance);
    const roundedPrincipal = roundCurrency(principalAmount);
    const roundedInterest = roundCurrency(interestAmount);
    const roundedClosing = roundCurrency(balance);

    schedule.push({
      month,
      openingBalance: roundedOpening,
      payment: roundedPayment,
      principalComponent: roundedPrincipal,
      interestComponent: roundedInterest,
      closingBalance: roundedClosing,
    });
  }

  return createSuccessResult({
    monthlyEMI: emiResult.data.monthlyEMI,
    totalPayment: emiResult.data.totalPayment,
    totalInterest: emiResult.data.totalInterest,
    principal: emiResult.data.principal,
    schedule,
  });
};

export default calculateAmortization;

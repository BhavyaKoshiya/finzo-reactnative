import { RATE_ADJUSTMENT_STRATEGIES } from '../types/rateRevisionTypes';
import { simulateSchedule, calculateNewEmiForTenure } from './loanPrepaymentSimulation';

/**
 * Pure calculation engine for loan interest rate revisions.
 * Calculates EMI or tenure impact based on chosen strategy (Adjust EMI vs Adjust Tenure),
 * supports optional bank overrides, and detects negative amortization.
 *
 * @param {Object} params
 * @param {Object} params.loan - Current loan profile
 * @param {number|string} params.newRate - New annual interest rate (%)
 * @param {string} [params.strategy=RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI] - 'adjust_emi' | 'adjust_tenure'
 * @param {number|string|null} [params.exactNewEmi=null] - Optional user/bank override for EMI
 * @param {number|string|null} [params.exactNewTenureMonths=null] - Optional user/bank override for tenure in months
 * @param {number|null} [params.currentBalance=null] - Optional override for current principal balance
 * @returns {Object} Revision calculation result
 */
export const applyRateRevision = ({
  loan,
  newRate,
  strategy = RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
  exactNewEmi = null,
  exactNewTenureMonths = null,
  currentBalance = null,
}) => {
  if (!loan) {
    return {
      isValid: false,
      error: 'Loan profile is required.',
      warning: null,
      isNegativeAmortization: false,
      calculatedNewEmi: null,
      calculatedNewTenureMonths: null,
      appliedNewEmi: null,
      appliedNewTenureMonths: null,
      deltaEmi: 0,
      deltaTenureMonths: 0,
      monthlyInterestAtNewRate: 0,
      profileUpdates: {},
    };
  }

  const parsedNewRate = Number(newRate);
  if (isNaN(parsedNewRate) || parsedNewRate <= 0) {
    return {
      isValid: false,
      error: 'Interest rate must be greater than 0%.',
      warning: null,
      isNegativeAmortization: false,
      calculatedNewEmi: null,
      calculatedNewTenureMonths: null,
      appliedNewEmi: null,
      appliedNewTenureMonths: null,
      deltaEmi: 0,
      deltaTenureMonths: 0,
      monthlyInterestAtNewRate: 0,
      profileUpdates: {},
    };
  }

  const balance = currentBalance !== null && currentBalance !== undefined && !isNaN(Number(currentBalance))
    ? Number(currentBalance)
    : (Number(loan.currentOutstandingPrincipal) || Number(loan.originalPrincipal) || 0);

  if (balance <= 0) {
    return {
      isValid: false,
      error: 'Loan has no outstanding balance.',
      warning: null,
      isNegativeAmortization: false,
      calculatedNewEmi: null,
      calculatedNewTenureMonths: null,
      appliedNewEmi: null,
      appliedNewTenureMonths: null,
      deltaEmi: 0,
      deltaTenureMonths: 0,
      monthlyInterestAtNewRate: 0,
      profileUpdates: {},
    };
  }

  const currentEmi = Number(loan.emiAmount) || 0;
  const remainingTenure = loan.remainingTenure || {};
  const remainingMonths = remainingTenure.unit === 'years'
    ? (Number(remainingTenure.value) || 0) * 12
    : (Number(remainingTenure.value) || 0);

  const safeRemainingMonths = remainingMonths > 0 ? remainingMonths : 1;

  // Monthly interest at new rate: P * (R / 12 / 100)
  const monthlyRateDecimal = (parsedNewRate / 12) / 100;
  const monthlyInterestAtNewRate = Math.round(balance * monthlyRateDecimal);

  // Negative Amortization Check:
  // If user chooses Adjust Tenure, but the current EMI is <= monthly interest at the new rate,
  // the loan balance would grow or never reduce (infinite tenure).
  const isNegativeAmortization = currentEmi > 0 && currentEmi <= (balance * monthlyRateDecimal);

  const resolvedStrategy = Object.values(RATE_ADJUSTMENT_STRATEGIES).includes(strategy)
    ? strategy
    : RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI;

  let calculatedNewEmi = null;
  let calculatedNewTenureMonths = null;
  let appliedNewEmi = currentEmi;
  let appliedNewTenureMonths = remainingMonths;
  let warning = null;

  if (resolvedStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI) {
    // Keep tenure constant, recalculate new EMI
    calculatedNewEmi = calculateNewEmiForTenure(balance, parsedNewRate, safeRemainingMonths);
    calculatedNewTenureMonths = remainingMonths;

    const numExactEmi = Number(exactNewEmi);
    appliedNewEmi = (!isNaN(numExactEmi) && numExactEmi > 0)
      ? numExactEmi
      : calculatedNewEmi;
    appliedNewTenureMonths = remainingMonths;

    return {
      isValid: true,
      error: null,
      warning: null,
      isNegativeAmortization: false,
      calculatedNewEmi,
      calculatedNewTenureMonths,
      appliedNewEmi,
      appliedNewTenureMonths,
      deltaEmi: appliedNewEmi - currentEmi,
      deltaTenureMonths: 0,
      monthlyInterestAtNewRate,
      profileUpdates: {
        annualInterestRate: parsedNewRate,
        emiAmount: appliedNewEmi,
      },
    };
  }

  // Strategy: ADJUST_TENURE (Keep EMI constant, adjust tenure)
  calculatedNewEmi = currentEmi;
  appliedNewEmi = currentEmi;

  if (isNegativeAmortization) {
    warning = `Current EMI of ₹${currentEmi.toLocaleString('en-IN')} is less than the monthly interest of ₹${monthlyInterestAtNewRate.toLocaleString('en-IN')} at ${parsedNewRate}%. EMI must be increased (choose "Adjust EMI").`;
    return {
      isValid: false,
      error: 'Current EMI cannot cover monthly interest at the new rate.',
      warning,
      isNegativeAmortization: true,
      calculatedNewEmi,
      calculatedNewTenureMonths: null,
      appliedNewEmi,
      appliedNewTenureMonths: remainingMonths,
      deltaEmi: 0,
      deltaTenureMonths: 0,
      monthlyInterestAtNewRate,
      profileUpdates: {},
    };
  }

  const schedule = simulateSchedule({
    balance,
    annualRate: parsedNewRate,
    monthlyEmi: currentEmi,
    maxMonths: 600,
  });

  calculatedNewTenureMonths = schedule.months || remainingMonths;

  const numExactTenure = Number(exactNewTenureMonths);
  appliedNewTenureMonths = (!isNaN(numExactTenure) && numExactTenure > 0)
    ? Math.round(numExactTenure)
    : calculatedNewTenureMonths;

  if (schedule.warning) {
    warning = schedule.warning;
  }

  return {
    isValid: true,
    error: null,
    warning,
    isNegativeAmortization: false,
    calculatedNewEmi,
    calculatedNewTenureMonths,
    appliedNewEmi,
    appliedNewTenureMonths,
    deltaEmi: 0,
    deltaTenureMonths: appliedNewTenureMonths - remainingMonths,
    monthlyInterestAtNewRate,
    profileUpdates: {
      annualInterestRate: parsedNewRate,
      remainingTenure: {
        value: appliedNewTenureMonths,
        unit: 'months',
      },
    },
  };
};

export default applyRateRevision;

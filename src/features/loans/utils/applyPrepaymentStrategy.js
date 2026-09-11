import { PREPAYMENT_STRATEGIES } from '../constants/loanPaymentConstants';
import { simulateSchedule, calculateNewEmiForTenure } from './loanPrepaymentSimulation';

/**
 * Calculates the loan profile updates to apply after a prepayment is recorded,
 * based on the user's chosen strategy (reduce tenure or reduce EMI).
 *
 * @param {Object} params
 * @param {Object} params.loan - Current loan profile
 * @param {number} params.newBalance - Outstanding balance after prepayment
 * @param {string} params.strategy - 'reduce_tenure' | 'reduce_emi'
 * @returns {Object} Fields to merge into the loan profile update, or empty object if no strategy
 */
export const applyPrepaymentStrategy = ({
  loan,
  newBalance,
  strategy,
  exactNewEmi = null,
  exactNewTenureMonths = null,
}) => {
  if (!loan || !strategy || newBalance <= 0) {
    return {};
  }

  const annualRate = Number(loan.annualInterestRate) || 0;
  const currentEmi = Number(loan.emiAmount) || 0;

  // Resolve remaining tenure in months
  const remainingTenure = loan.remainingTenure || {};
  const remainingMonths = remainingTenure.unit === 'years'
    ? (Number(remainingTenure.value) || 0) * 12
    : (Number(remainingTenure.value) || 0);

  if (remainingMonths <= 0 || currentEmi <= 0) {
    return {};
  }

  if (strategy === PREPAYMENT_STRATEGIES.REDUCE_EMI) {
    // If user provided an exact bank EMI, use it directly
    const numCustomEmi = Number(exactNewEmi);
    if (!isNaN(numCustomEmi) && numCustomEmi > 0) {
      return {
        emiAmount: numCustomEmi,
      };
    }

    // Keep tenure constant, recalculate lower EMI
    const newEmi = calculateNewEmiForTenure(newBalance, annualRate, remainingMonths);

    return {
      emiAmount: newEmi,
      // Tenure stays the same — no update needed
    };
  }

  if (strategy === PREPAYMENT_STRATEGIES.REDUCE_TENURE) {
    // If user provided an exact bank tenure, use it directly
    const numCustomTenure = Number(exactNewTenureMonths);
    if (!isNaN(numCustomTenure) && numCustomTenure > 0) {
      return {
        remainingTenure: {
          value: Math.round(numCustomTenure),
          unit: 'months',
        },
      };
    }

    // Keep EMI constant, recalculate shorter tenure
    const schedule = simulateSchedule({
      balance: newBalance,
      annualRate,
      monthlyEmi: currentEmi,
      maxMonths: remainingMonths * 2,
    });

    const newMonths = schedule.months || remainingMonths;

    return {
      remainingTenure: {
        value: newMonths,
        unit: 'months',
      },
      // EMI stays the same — no update needed
    };
  }

  return {};
};

export default applyPrepaymentStrategy;

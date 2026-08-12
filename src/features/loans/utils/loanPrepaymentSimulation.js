import { toDecimal } from '../../../calculations/core/decimal';
import { roundCurrency } from '../../../calculations/core/rounding';
import { getCurrentLoanBalance } from './paymentBalanceUtils';
import { BALANCE_SOURCES } from '../constants/loanPaymentConstants';

export const SIMULATION_STRATEGIES = {
  REDUCE_TENURE: 'reduce_tenure',
  REDUCE_EMI: 'reduce_emi',
};

/**
 * Simulates a month-by-month payment schedule starting from an opening balance.
 * @param {Object} params
 * @param {number} params.balance - Opening principal balance
 * @param {number} params.annualRate - Annual interest rate (%)
 * @param {number} params.monthlyEmi - Monthly payment amount
 * @param {number} [params.maxMonths=600] - Safety max iteration ceiling
 * @returns {{ months: number, totalInterest: number, warning: string|null }}
 */
export const simulateSchedule = ({ balance, annualRate, monthlyEmi, maxMonths = 600 }) => {
  if (balance <= 0) {
    return { months: 0, totalInterest: 0, warning: null };
  }

  const rate = Number(annualRate) || 0;
  const emi = Number(monthlyEmi) || 0;
  let runningBalance = toDecimal(balance);
  let totalInterest = toDecimal(0);
  let months = 0;

  if (rate === 0) {
    if (emi <= 0) {
      return { months: maxMonths, totalInterest: 0, warning: 'EMI is zero or negative.' };
    }
    const calcMonths = Math.ceil(runningBalance.dividedBy(emi).toNumber());
    return { months: calcMonths, totalInterest: 0, warning: null };
  }

  const monthlyRate = toDecimal(rate).dividedBy(12).dividedBy(100);
  const initialMonthlyInterest = runningBalance.times(monthlyRate).toNumber();

  if (emi <= initialMonthlyInterest) {
    return {
      months: maxMonths,
      totalInterest: 0,
      warning: 'Your current EMI may not fully cover monthly interest.',
    };
  }

  while (runningBalance.greaterThan(0) && months < maxMonths) {
    months += 1;
    const interest = runningBalance.times(monthlyRate);
    totalInterest = totalInterest.plus(interest);

    const payment = toDecimal(Math.min(emi, runningBalance.plus(interest).toNumber()));
    const principal = payment.minus(interest);
    runningBalance = runningBalance.minus(principal);

    if (runningBalance.lessThan(0.01)) {
      runningBalance = toDecimal(0);
    }
  }

  return {
    months,
    totalInterest: roundCurrency(totalInterest),
    warning: months >= maxMonths ? 'Simulation limit reached.' : null,
  };
};

/**
 * Recalculates required monthly EMI for a remaining principal and tenure.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} tenureMonths
 * @returns {number} Rounded monthly EMI
 */
export const calculateNewEmiForTenure = (principal, annualRate, tenureMonths) => {
  const P = toDecimal(principal || 0);
  const R = toDecimal(annualRate || 0);
  const N = toDecimal(tenureMonths || 1);

  if (P.isZero() || N.isZero()) return 0;

  if (R.isZero()) {
    return roundCurrency(P.dividedBy(N));
  }

  const r = R.dividedBy(12).dividedBy(100);
  const compound = r.plus(1).pow(N);
  const numerator = P.times(r).times(compound);
  const denominator = compound.minus(1);

  if (denominator.isZero()) return roundCurrency(P.dividedBy(N));

  const emi = numerator.dividedBy(denominator);
  return roundCurrency(emi);
};

/**
 * Pure loan prepayment simulator engine.
 * @param {Object} params
 * @param {Object} params.loan - Target loan profile
 * @param {Array} [params.payments=[]] - Payment history for current balance resolution
 * @param {number|string} params.prepaymentAmount - Hypothetical prepayment amount
 * @param {string} [params.strategy=SIMULATION_STRATEGIES.REDUCE_TENURE] - 'reduce_tenure' | 'reduce_emi'
 * @returns {Object} Standard simulation result contract
 */
export const simulateLoanPrepayment = ({
  loan,
  payments = [],
  prepaymentAmount = 0,
  strategy = SIMULATION_STRATEGIES.REDUCE_TENURE,
}) => {
  if (!loan) {
    return {
      success: false,
      data: null,
      errors: [{ message: 'Loan profile is required for simulation.' }],
    };
  }

  const prepayNum = Number(prepaymentAmount);
  if (isNaN(prepayNum) || prepayNum < 0) {
    return {
      success: false,
      data: null,
      errors: [{ field: 'prepaymentAmount', message: 'Enter a valid prepayment amount.' }],
    };
  }

  // 1. Resolve current trusted loan balance state
  const balanceState = getCurrentLoanBalance(loan, payments);
  const currentBalance = balanceState.currentBalance;
  const annualRate = Number(loan.annualInterestRate) || 0;
  const currentEmi = Number(loan.emiAmount) || 0;
  const remainingTenureMonths = Math.max(1, Number(loan.remainingTenureMonths) || 1);

  if (currentBalance <= 0) {
    return {
      success: true,
      strategy,
      isFullyPaidOff: true,
      input: { prepaymentAmount: prepayNum },
      before: {
        outstandingBalance: 0,
        emi: currentEmi,
        remainingMonths: 0,
        remainingInterest: 0,
      },
      after: {
        outstandingBalance: 0,
        emi: currentEmi,
        remainingMonths: 0,
        remainingInterest: 0,
      },
      savings: {
        interestSaved: 0,
        monthsSaved: 0,
        monthlyEmiSavings: 0,
      },
      assumptions: {
        interestMethod: 'monthly_reducing',
        annualInterestRate: annualRate,
        balanceSource: balanceState.balanceSource,
        isBankConfirmed: balanceState.isBankConfirmed,
      },
      warning: 'Loan is already paid off.',
    };
  }

  // 2. Simulate CURRENT baseline remaining schedule
  const baselineSchedule = simulateSchedule({
    balance: currentBalance,
    annualRate,
    monthlyEmi: currentEmi,
    maxMonths: Math.max(remainingTenureMonths * 2, 360),
  });

  const baselineMonths = baselineSchedule.warning && baselineSchedule.warning.includes('cover')
    ? remainingTenureMonths
    : (baselineSchedule.months || remainingTenureMonths);
  const baselineInterest = baselineSchedule.totalInterest;

  // 3. Handle Prepayment >= Current Outstanding (Full Payoff)
  if (prepayNum >= currentBalance) {
    return {
      success: true,
      strategy,
      isFullyPaidOff: true,
      input: { prepaymentAmount: prepayNum },
      before: {
        outstandingBalance: currentBalance,
        emi: currentEmi,
        remainingMonths: baselineMonths,
        remainingInterest: baselineInterest,
      },
      after: {
        outstandingBalance: 0,
        emi: strategy === SIMULATION_STRATEGIES.REDUCE_EMI ? 0 : currentEmi,
        remainingMonths: 0,
        remainingInterest: 0,
      },
      savings: {
        interestSaved: baselineInterest,
        monthsSaved: baselineMonths,
        monthlyEmiSavings: strategy === SIMULATION_STRATEGIES.REDUCE_EMI ? currentEmi : 0,
      },
      assumptions: {
        interestMethod: 'monthly_reducing',
        annualInterestRate: annualRate,
        balanceSource: balanceState.balanceSource,
        isBankConfirmed: balanceState.isBankConfirmed,
      },
      warning: prepayNum > currentBalance ? 'Prepayment exceeds current outstanding balance.' : null,
    };
  }

  // 4. Partial Prepayment Simulation
  const simulatedOpeningBalance = roundCurrency(toDecimal(currentBalance).minus(prepayNum));

  if (strategy === SIMULATION_STRATEGIES.REDUCE_EMI) {
    // Strategy B: REDUCE EMI
    const targetTenure = baselineMonths;
    const newEmi = calculateNewEmiForTenure(simulatedOpeningBalance, annualRate, targetTenure);

    const simulatedSchedule = simulateSchedule({
      balance: simulatedOpeningBalance,
      annualRate,
      monthlyEmi: newEmi,
      maxMonths: targetTenure + 12,
    });

    const simulatedInterest = simulatedSchedule.totalInterest;
    const interestSaved = Math.max(0, roundCurrency(baselineInterest - simulatedInterest));
    const monthlyEmiSavings = Math.max(0, roundCurrency(currentEmi - newEmi));

    return {
      success: true,
      strategy: SIMULATION_STRATEGIES.REDUCE_EMI,
      isFullyPaidOff: false,
      input: { prepaymentAmount: prepayNum },
      before: {
        outstandingBalance: currentBalance,
        emi: currentEmi,
        remainingMonths: targetTenure,
        remainingInterest: baselineInterest,
      },
      after: {
        outstandingBalance: simulatedOpeningBalance,
        emi: newEmi,
        remainingMonths: targetTenure,
        remainingInterest: simulatedInterest,
      },
      savings: {
        interestSaved,
        monthsSaved: 0,
        monthlyEmiSavings,
      },
      assumptions: {
        interestMethod: 'monthly_reducing',
        annualInterestRate: annualRate,
        balanceSource: balanceState.balanceSource,
        isBankConfirmed: balanceState.isBankConfirmed,
      },
      warning: simulatedSchedule.warning || baselineSchedule.warning || null,
    };
  }

  // Strategy A: REDUCE TENURE (Default)
  const simulatedSchedule = simulateSchedule({
    balance: simulatedOpeningBalance,
    annualRate,
    monthlyEmi: currentEmi,
    maxMonths: baselineMonths,
  });

  const simulatedMonths = simulatedSchedule.months;
  const simulatedInterest = simulatedSchedule.totalInterest;
  const monthsSaved = Math.max(0, baselineMonths - simulatedMonths);
  const interestSaved = Math.max(0, roundCurrency(baselineInterest - simulatedInterest));

  return {
    success: true,
    strategy: SIMULATION_STRATEGIES.REDUCE_TENURE,
    isFullyPaidOff: false,
    input: { prepaymentAmount: prepayNum },
    before: {
      outstandingBalance: currentBalance,
      emi: currentEmi,
      remainingMonths: baselineMonths,
      remainingInterest: baselineInterest,
    },
    after: {
      outstandingBalance: simulatedOpeningBalance,
      emi: currentEmi,
      remainingMonths: simulatedMonths,
      remainingInterest: simulatedInterest,
    },
    savings: {
      interestSaved,
      monthsSaved,
      monthlyEmiSavings: 0,
    },
    assumptions: {
      interestMethod: 'monthly_reducing',
      annualInterestRate: annualRate,
      balanceSource: balanceState.balanceSource,
      isBankConfirmed: balanceState.isBankConfirmed,
    },
    warning: simulatedSchedule.warning || baselineSchedule.warning || null,
  };
};

export default simulateLoanPrepayment;

import { getCurrentLoanBalance } from './paymentBalanceUtils';
import { parseLocalDateStr, formatLoanDate } from './loanDateUtils';
import { formatCurrency } from '../../../utils/financeFormatters';
import { Decimal, toDecimal } from '../../../calculations/core/decimal';
import { roundCurrency } from '../../../calculations/core/rounding';

export const SCENARIO_TYPES = {
  EXTRA_MONTHLY: 'extra_monthly',
  INCREASED_EMI: 'increased_emi',
  ONE_TIME_PREPAYMENT: 'one_time_prepayment',
  MULTIPLE_PREPAYMENTS: 'multiple_prepayments',
  TARGET_PAYOFF_DATE: 'target_payoff_date',
};

const MAX_SIMULATION_MONTHS = 600; // 50 years max projection limit

/**
 * Calculates estimated monthly EMI required to pay off principal P over N months at annual interest rate r.
 */
export const calculateRequiredEmiForTargetMonths = (principal, annualInterestRate, targetMonths) => {
  const P = Number(principal) || 0;
  const rate = Number(annualInterestRate) || 0;
  const N = Number(targetMonths) || 0;

  if (P <= 0 || N <= 0) return 0;

  if (rate <= 0) {
    return Math.ceil(P / N);
  }

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, N);
  const emi = (P * r * factor) / (factor - 1);

  return Math.ceil(emi);
};

/**
 * Pure function to simulate a monthly loan amortization schedule starting from a balance anchor.
 */
const runAmortizationSimulation = ({
  startingBalance,
  annualInterestRate,
  monthlyEmi,
  prepaymentEvents = [], // Array of { monthIndex, amount, label }
  startRefDate = new Date(),
}) => {
  const P0 = Number(startingBalance) || 0;
  const rate = Number(annualInterestRate) || 0;
  const baseEmi = Number(monthlyEmi) || 0;
  const r = rate <= 0 ? 0 : rate / 12 / 100;

  if (P0 <= 0) {
    return {
      success: true,
      startingBalance: 0,
      totalInterest: 0,
      estimatedRemainingMonths: 0,
      estimatedPayoffDate: formatLoanDate(startRefDate, 'MMM yyyy'),
      schedule: [],
    };
  }

  // Monthly interest check
  const firstMonthInterest = P0 * r;
  if (r > 0 && baseEmi <= firstMonthInterest && prepaymentEvents.length === 0) {
    return {
      success: false,
      error: 'At this payment amount, the estimated balance would not decrease.',
    };
  }

  let balance = P0;
  let totalInterest = 0;
  const schedule = [];

  // Sort prepayments by monthIndex ASC
  const sortedPrepayments = [...prepaymentEvents].sort((a, b) => a.monthIndex - b.monthIndex);

  let month = 1;
  while (balance > 0 && month <= MAX_SIMULATION_MONTHS) {
    const monthDate = new Date(startRefDate.getFullYear(), startRefDate.getMonth() + month, 1);
    const formattedMonth = formatLoanDate(monthDate, 'MMM yyyy');

    let openingBalance = balance;
    let prepaymentApplied = 0;

    // Apply any prepayments scheduled for this month BEFORE reducing balance EMI payment
    const monthPrepayments = sortedPrepayments.filter((p) => p.monthIndex === month);
    for (const prep of monthPrepayments) {
      const prepAmount = Number(prep.amount) || 0;
      if (prepAmount > 0) {
        prepaymentApplied += prepAmount;
        balance = Math.max(0, balance - prepAmount);
      }
    }

    if (balance <= 0) {
      schedule.push({
        month,
        monthLabel: formattedMonth,
        openingBalance,
        prepayment: prepaymentApplied,
        emi: 0,
        interest: 0,
        principal: 0,
        closingBalance: 0,
      });
      break;
    }

    const interestAmount = roundCurrency(balance * r);
    let principalAmount = baseEmi - interestAmount;

    if (principalAmount <= 0) {
      principalAmount = 0;
    }

    if (principalAmount >= balance || month === MAX_SIMULATION_MONTHS) {
      principalAmount = balance;
      balance = 0;
    } else {
      balance = balance - principalAmount;
    }

    const actualEmi = roundCurrency(principalAmount + interestAmount);
    totalInterest += interestAmount;

    schedule.push({
      month,
      monthLabel: formattedMonth,
      openingBalance,
      prepayment: prepaymentApplied,
      emi: actualEmi,
      interest: interestAmount,
      principal: principalAmount,
      closingBalance: roundCurrency(balance),
    });

    month++;
  }

  if (balance > 0) {
    return {
      success: false,
      error: 'Scenario could not reach payoff within the supported projection period (50 years).',
    };
  }

  const finalPayoffDate = schedule.length > 0 ? schedule[schedule.length - 1].monthLabel : formatLoanDate(startRefDate, 'MMM yyyy');

  return {
    success: true,
    startingBalance: P0,
    totalInterest: roundCurrency(totalInterest),
    estimatedRemainingMonths: schedule.length,
    estimatedPayoffDate: finalPayoffDate,
    schedule,
  };
};

/**
 * Main Pure Simulation Function for Loan Payoff Scenarios.
 */
export const simulateLoanScenario = ({
  loan,
  payments = [],
  scenario = { type: SCENARIO_TYPES.EXTRA_MONTHLY, extraMonthlyAmount: 0 },
  startRefDate = new Date(),
}) => {
  if (!loan) {
    throw new Error('Loan profile is required for scenario simulation.');
  }

  const balanceState = getCurrentLoanBalance(loan, payments);
  const startingBalance = balanceState.currentBalance;
  const annualInterestRate = Number(loan.annualInterestRate) || 0;
  const baseEmi = Number(loan.emiAmount) || 0;

  // 1. Run Baseline Current Loan Simulation
  const baseline = runAmortizationSimulation({
    startingBalance,
    annualInterestRate,
    monthlyEmi: baseEmi,
    startRefDate,
  });

  if (startingBalance <= 0) {
    return {
      success: true,
      isPaidOff: true,
      startingBalance: 0,
      baseline,
      simulated: baseline,
    };
  }

  // 2. Parse & Prepare Scenario Parameters
  let simulatedEmi = baseEmi;
  let extraMonthlyAmount = 0;
  let prepaymentEvents = [];
  let targetPayoffDateLabel = null;

  switch (scenario.type) {
    case SCENARIO_TYPES.EXTRA_MONTHLY: {
      extraMonthlyAmount = Math.max(0, Number(scenario.extraMonthlyAmount) || 0);
      simulatedEmi = baseEmi + extraMonthlyAmount;
      break;
    }
    case SCENARIO_TYPES.INCREASED_EMI: {
      const newEmi = Number(scenario.newEmi) || baseEmi;
      simulatedEmi = Math.max(baseEmi, newEmi);
      extraMonthlyAmount = Math.max(0, simulatedEmi - baseEmi);
      break;
    }
    case SCENARIO_TYPES.ONE_TIME_PREPAYMENT: {
      const prepAmount = Number(scenario.amount) || 0;
      const targetMonthIndex = Math.max(1, Number(scenario.monthIndex) || 1);
      if (prepAmount > 0) {
        prepaymentEvents.push({ monthIndex: targetMonthIndex, amount: prepAmount, label: 'One-time Prepayment' });
      }
      break;
    }
    case SCENARIO_TYPES.MULTIPLE_PREPAYMENTS: {
      if (Array.isArray(scenario.prepayments)) {
        prepaymentEvents = scenario.prepayments
          .filter((p) => Number(p.amount) > 0 && Number(p.monthIndex) >= 1)
          .map((p) => ({
            monthIndex: Number(p.monthIndex),
            amount: Number(p.amount),
            label: p.label || 'Planned Prepayment',
          }));
      }
      break;
    }
    case SCENARIO_TYPES.TARGET_PAYOFF_DATE: {
      const targetMonths = Math.max(1, Number(scenario.targetMonths) || 1);
      if (targetMonths <= 0) {
        return {
          success: false,
          error: 'Please select a future target payoff date.',
        };
      }
      simulatedEmi = calculateRequiredEmiForTargetMonths(startingBalance, annualInterestRate, targetMonths);
      extraMonthlyAmount = Math.max(0, simulatedEmi - baseEmi);
      targetPayoffDateLabel = scenario.targetDateLabel || null;
      break;
    }
    default:
      break;
  }

  // 3. Run Simulated Amortization
  const simulated = runAmortizationSimulation({
    startingBalance,
    annualInterestRate,
    monthlyEmi: simulatedEmi,
    prepaymentEvents,
    startRefDate,
  });

  if (!simulated.success) {
    return {
      success: false,
      error: simulated.error || 'Unable to calculate scenario.',
    };
  }

  // 4. Calculate Comparative Savings & Tenure Reduction
  const baselineMonths = baseline.success ? baseline.estimatedRemainingMonths : 0;
  const simulatedMonths = simulated.estimatedRemainingMonths;
  const monthsEarlier = Math.max(0, baselineMonths - simulatedMonths);

  const baselineInterest = baseline.success ? baseline.totalInterest : 0;
  const simulatedInterest = simulated.totalInterest;
  const estimatedInterestAvoided = Math.max(0, baselineInterest - simulatedInterest);

  let formattedTenureReduction = 'Same payoff date';
  if (monthsEarlier > 0) {
    const yrs = Math.floor(monthsEarlier / 12);
    const mos = monthsEarlier % 12;
    if (yrs > 0 && mos > 0) {
      formattedTenureReduction = `${yrs} yr${yrs > 1 ? 's' : ''} ${mos} mo${mos > 1 ? 's' : ''} earlier`;
    } else if (yrs > 0) {
      formattedTenureReduction = `${yrs} yr${yrs > 1 ? 's' : ''} earlier`;
    } else {
      formattedTenureReduction = `${mos} month${mos > 1 ? 's' : ''} earlier`;
    }
  }

  return {
    success: true,
    scenarioType: scenario.type,
    startingBalance,
    currentEmi: baseEmi,
    simulatedEmi,
    extraMonthlyAmount,
    totalSimulatedInterest: simulated.totalInterest,
    estimatedPayoffDate: simulated.estimatedPayoffDate,
    estimatedRemainingMonths: simulatedMonths,
    tenureReduction: {
      baselineMonths,
      simulatedMonths,
      monthsEarlier,
      formattedTenureReduction,
    },
    interestImpact: {
      baselineInterest,
      simulatedInterest,
      estimatedInterestAvoided,
      formattedInterestAvoided: formatCurrency(estimatedInterestAvoided),
    },
    schedule: simulated.schedule,
    compactSchedule: simulated.schedule.slice(0, 12),
    baseline: {
      estimatedPayoffDate: baseline.success ? baseline.estimatedPayoffDate : 'N/A',
      estimatedRemainingMonths: baselineMonths,
      totalInterest: baselineInterest,
    },
  };
};

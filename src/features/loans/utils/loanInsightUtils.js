import {
  parseISO,
  isValid,
  format,
  addMonths,
} from 'date-fns';
import { getCurrentLoanBalance, sortPaymentsChronologically } from './paymentBalanceUtils';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

/**
 * Calculates clamped principal progress percentage (0% to 100%).
 * @param {Object} loan Loan profile object
 * @param {Array} payments Recorded payments array
 * @returns {Object} { originalPrincipal, currentBalance, principalReduced, progressPercentage }
 */
export const calculatePrincipalProgress = (loan, payments = []) => {
  if (!loan) {
    return {
      originalPrincipal: 0,
      currentBalance: 0,
      principalReduced: 0,
      progressPercentage: 0,
    };
  }

  const originalPrincipal = Number(loan.originalPrincipal) || 0;
  const balanceState = getCurrentLoanBalance(loan, payments);
  const currentBalance = balanceState.currentBalance;

  if (originalPrincipal <= 0) {
    return {
      originalPrincipal: 0,
      currentBalance,
      principalReduced: 0,
      progressPercentage: currentBalance <= 0 ? 100 : 0,
    };
  }

  const rawReduced = originalPrincipal - currentBalance;
  const principalReduced = Math.max(0, rawReduced);
  const rawPct = (principalReduced / originalPrincipal) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawPct * 10) / 10));

  return {
    originalPrincipal,
    currentBalance,
    principalReduced,
    progressPercentage,
  };
};

/**
 * Summarizes recorded payments excluding balance corrections.
 * @param {Array} payments Array of payment records
 * @returns {Object} { totalPayments, regularEmiCount, customPaymentCount, prepaymentCount, totalAmountPaid, totalPrepaymentAmount }
 */
export const calculateRecordedPaymentSummary = (payments = []) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return {
      totalPayments: 0,
      regularEmiCount: 0,
      customPaymentCount: 0,
      prepaymentCount: 0,
      totalAmountPaid: 0,
      totalPrepaymentAmount: 0,
    };
  }

  const validPayments = payments.filter(
    (p) => p.paymentType !== PAYMENT_TYPES.BALANCE_CORRECTION && !p.isBalanceCorrection
  );

  let regularEmiCount = 0;
  let customPaymentCount = 0;
  let prepaymentCount = 0;
  let totalAmountPaid = 0;
  let totalPrepaymentAmount = 0;

  validPayments.forEach((p) => {
    const amt = Number(p.paymentAmount || p.amount) || 0;
    totalAmountPaid += amt;

    if (p.paymentType === PAYMENT_TYPES.PREPAYMENT) {
      prepaymentCount += 1;
      totalPrepaymentAmount += amt;
    } else if (p.paymentType === PAYMENT_TYPES.CUSTOM) {
      customPaymentCount += 1;
    } else {
      regularEmiCount += 1;
    }
  });

  return {
    totalPayments: validPayments.length,
    regularEmiCount,
    customPaymentCount,
    prepaymentCount,
    totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
    totalPrepaymentAmount: Math.round(totalPrepaymentAmount * 100) / 100,
  };
};

/**
 * Calculates cumulative principal and interest paid using stored historical payment snapshots or actual bank values.
 * @param {Object} loan Loan profile object
 * @param {Array} payments Recorded payments array
 * @returns {Object} { principalPaid, interestPaid, hasBankConfirmedBreakdowns }
 */
export const calculateInterestAndPrincipalPaid = (loan, payments = []) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return {
      principalPaid: 0,
      interestPaid: 0,
      hasBankConfirmedBreakdowns: false,
    };
  }

  const validPayments = payments.filter(
    (p) => p.paymentType !== PAYMENT_TYPES.BALANCE_CORRECTION && !p.isBalanceCorrection
  );

  let principalPaid = 0;
  let interestPaid = 0;
  let hasBankConfirmedBreakdowns = false;

  validPayments.forEach((p) => {
    const actPrin = p.actualPrincipal !== null && p.actualPrincipal !== undefined ? Number(p.actualPrincipal) : null;
    const actInt = p.actualInterest !== null && p.actualInterest !== undefined ? Number(p.actualInterest) : null;

    if (actPrin !== null || actInt !== null) {
      hasBankConfirmedBreakdowns = true;
    }

    const estPrin = Number(p.principalAmount || p.estimatedPrincipal || (p.calculationSnapshot && p.calculationSnapshot.estimatedPrincipal)) || 0;
    const estInt = Number(p.interestAmount || p.estimatedInterest || (p.calculationSnapshot && p.calculationSnapshot.estimatedInterest)) || 0;

    principalPaid += actPrin !== null ? actPrin : estPrin;
    interestPaid += actInt !== null ? actInt : estInt;
  });

  return {
    principalPaid: Math.round(principalPaid * 100) / 100,
    interestPaid: Math.round(interestPaid * 100) / 100,
    hasBankConfirmedBreakdowns,
  };
};

/**
 * Computes estimated remaining interest and estimated remaining tenure from current loan state.
 * @param {Object} loan Loan profile object
 * @param {number} [currentBalance] Current balance
 * @returns {Object} { estimatedRemainingInterest, remainingTenureMonths, estimatedPayoffDate, formattedPayoffDate }
 */
export const calculateRemainingInterestAndPayoff = (loan, currentBalance = null) => {
  if (!loan) {
    return {
      estimatedRemainingInterest: 0,
      remainingTenureMonths: 0,
      estimatedPayoffDate: null,
      formattedPayoffDate: 'N/A',
      isIndefinite: false,
    };
  }

  const balance = currentBalance !== null ? Number(currentBalance) : Number(loan.currentOutstandingPrincipal) || 0;
  if (balance <= 0) {
    return {
      estimatedRemainingInterest: 0,
      remainingTenureMonths: 0,
      estimatedPayoffDate: new Date(),
      formattedPayoffDate: 'Paid Off',
      isIndefinite: false,
    };
  }

  const annualRate = Number(loan.annualInterestRate) || 0;
  const emiAmount = Number(loan.emiAmount) || 0;
  const monthlyRate = annualRate / 1200;

  if (annualRate <= 0 || emiAmount <= 0) {
    const monthsLeft = emiAmount > 0 ? Math.ceil(balance / emiAmount) : 0;
    const targetDate = addMonths(new Date(), monthsLeft);
    return {
      estimatedRemainingInterest: 0,
      remainingTenureMonths: monthsLeft,
      estimatedPayoffDate: targetDate,
      formattedPayoffDate: format(targetDate, 'MMM yyyy'),
      isIndefinite: false,
    };
  }

  const firstMonthInterest = balance * monthlyRate;
  if (emiAmount <= firstMonthInterest) {
    return {
      estimatedRemainingInterest: 0,
      remainingTenureMonths: 0,
      estimatedPayoffDate: null,
      formattedPayoffDate: 'EMI too low to cover interest',
      isIndefinite: true,
    };
  }

  let runningBalance = balance;
  let totalRemainingInterest = 0;
  let monthsCount = 0;
  const maxSafetyMonths = 480;

  while (runningBalance > 0.01 && monthsCount < maxSafetyMonths) {
    monthsCount += 1;
    const mInterest = runningBalance * monthlyRate;
    const mPrincipal = Math.min(runningBalance, emiAmount - mInterest);
    totalRemainingInterest += mInterest;
    runningBalance -= mPrincipal;
  }

  const payoffDate = addMonths(new Date(), monthsCount);
  const formattedPayoffDate = format(payoffDate, 'MMM yyyy');

  return {
    estimatedRemainingInterest: Math.round(totalRemainingInterest),
    remainingTenureMonths: monthsCount,
    estimatedPayoffDate: payoffDate,
    formattedPayoffDate,
    isIndefinite: false,
  };
};

/**
 * Calculates prepayment impact comparing prepayments to a non-prepayment baseline.
 * @param {Object} loan Loan profile
 * @param {Array} payments Payments array
 * @returns {Object} { totalPrepaymentsMade, prepaymentCount, estimatedInterestAvoided, additionalPrincipalReduced }
 */
export const calculatePrepaymentImpact = (loan, payments = []) => {
  const summary = calculateRecordedPaymentSummary(payments);
  if (summary.prepaymentCount === 0 || summary.totalPrepaymentAmount <= 0) {
    return {
      totalPrepaymentsMade: 0,
      prepaymentCount: 0,
      estimatedInterestAvoided: 0,
      additionalPrincipalReduced: 0,
    };
  }

  const totalPrepaymentsMade = summary.totalPrepaymentAmount;

  // Approximate baseline interest avoided:
  const annualRate = Number(loan?.annualInterestRate) || 0;
  const remainingInfo = calculateRemainingInterestAndPayoff(loan);
  const approxRemainingYears = (remainingInfo.remainingTenureMonths || 12) / 12;
  const estimatedInterestAvoided = Math.round(totalPrepaymentsMade * (annualRate / 100) * Math.min(5, approxRemainingYears * 0.5));

  return {
    totalPrepaymentsMade,
    prepaymentCount: summary.prepaymentCount,
    estimatedInterestAvoided: Math.max(0, estimatedInterestAvoided),
    additionalPrincipalReduced: totalPrepaymentsMade,
  };
};

/**
 * Computes historical data points for charts (balance trend and interest/principal per payment).
 * @param {Object} loan Loan profile
 * @param {Array} payments Payments array
 * @returns {Object} { balanceHistory: Array, paymentBreakdownHistory: Array }
 */
export const buildLoanInsightHistorySeries = (loan, payments = []) => {
  if (!loan || !Array.isArray(payments) || payments.length === 0) {
    return { balanceHistory: [], paymentBreakdownHistory: [] };
  }

  const sorted = sortPaymentsChronologically(payments).filter(
    (p) => p.paymentType !== PAYMENT_TYPES.BALANCE_CORRECTION && !p.isBalanceCorrection
  );

  if (sorted.length === 0) {
    return { balanceHistory: [], paymentBreakdownHistory: [] };
  }

  const balanceHistory = [];
  const paymentBreakdownHistory = [];

  const origPrincipal = Number(loan.originalPrincipal) || 0;
  balanceHistory.push({
    label: 'Start',
    balance: origPrincipal,
    date: loan.loanStartDate || 'Start',
  });

  sorted.forEach((p, idx) => {
    const label = `P${idx + 1}`;
    const dateStr = p.paymentDate ? formatLoanDisplayDate(p.paymentDate) : label;
    const closing = Number(p.actualClosingBalance || p.outstandingAfter || p.estimatedClosingBalance) || 0;
    const prin = Number(p.actualPrincipal || p.principalAmount || p.estimatedPrincipal) || 0;
    const intVal = Number(p.actualInterest || p.interestAmount || p.estimatedInterest) || 0;

    balanceHistory.push({
      label,
      date: dateStr,
      balance: Math.max(0, closing),
    });

    paymentBreakdownHistory.push({
      label,
      date: dateStr,
      principal: Math.max(0, prin),
      interest: Math.max(0, intVal),
      total: Number(p.paymentAmount || p.amount) || (prin + intVal),
    });
  });

  return { balanceHistory, paymentBreakdownHistory };
};

/**
 * Builds the complete derived Loan Insights Model for a given loan and payment history.
 * @param {Object} loan Target loan profile
 * @param {Array} payments Loan payments array
 * @returns {Object} Loan insights model
 */
export const buildLoanInsightSummary = (loan, payments = []) => {
  if (!loan) return null;

  const loanPayments = Array.isArray(payments)
    ? payments.filter((p) => String(p.loanId) === String(loan.id))
    : [];

  const balanceState = getCurrentLoanBalance(loan, loanPayments);
  const progress = calculatePrincipalProgress(loan, loanPayments);
  const paymentSummary = calculateRecordedPaymentSummary(loanPayments);
  const breakdowns = calculateInterestAndPrincipalPaid(loan, loanPayments);
  const payoffInfo = calculateRemainingInterestAndPayoff(loan, balanceState.currentBalance);
  const prepaymentImpact = calculatePrepaymentImpact(loan, loanPayments);
  const historySeries = buildLoanInsightHistorySeries(loan, loanPayments);

  const sortedPayments = sortPaymentsChronologically(loanPayments).filter(
    (p) => p.paymentType !== PAYMENT_TYPES.BALANCE_CORRECTION && !p.isBalanceCorrection
  );
  const latestPayment = sortedPayments.length > 0 ? sortedPayments[sortedPayments.length - 1] : null;

  let latestPaymentInsight = null;
  if (latestPayment) {
    const actPrin = latestPayment.actualPrincipal !== null && latestPayment.actualPrincipal !== undefined ? Number(latestPayment.actualPrincipal) : null;
    const actInt = latestPayment.actualInterest !== null && latestPayment.actualInterest !== undefined ? Number(latestPayment.actualInterest) : null;
    const estPrin = Number(latestPayment.principalAmount || latestPayment.estimatedPrincipal) || 0;
    const estInt = Number(latestPayment.interestAmount || latestPayment.estimatedInterest) || 0;

    latestPaymentInsight = {
      amount: Number(latestPayment.paymentAmount || latestPayment.amount) || 0,
      date: latestPayment.paymentDate || latestPayment.createdAt,
      formattedDate: formatLoanDisplayDate(latestPayment.paymentDate || latestPayment.createdAt),
      principal: actPrin !== null ? actPrin : estPrin,
      interest: actInt !== null ? actInt : estInt,
      isBankConfirmed: actPrin !== null || actInt !== null,
    };
  }

  const originalTenureMonths = Number(loan.tenureMonths) || 0;
  const remainingTenureMonths = payoffInfo.remainingTenureMonths;

  let remainingTenureText = '0 months';
  if (remainingTenureMonths > 0) {
    const yrs = Math.floor(remainingTenureMonths / 12);
    const mos = remainingTenureMonths % 12;
    if (yrs > 0 && mos > 0) {
      remainingTenureText = `${yrs} yr ${mos} mos`;
    } else if (yrs > 0) {
      remainingTenureText = `${yrs} ${yrs === 1 ? 'year' : 'years'}`;
    } else {
      remainingTenureText = `${mos} ${mos === 1 ? 'month' : 'months'}`;
    }
  }

  return {
    loanId: loan.id,
    loanName: loan.name || 'Loan',
    originalPrincipal: progress.originalPrincipal,
    currentBalance: balanceState.currentBalance,
    principalReduced: progress.principalReduced,
    progressPercentage: progress.progressPercentage,
    balanceSource: balanceState.balanceSource,
    isBankConfirmed: balanceState.isBankConfirmed,
    lastConfirmedDate: balanceState.lastConfirmedDate,
    totalPaymentsCount: paymentSummary.totalPayments,
    regularEmiCount: paymentSummary.regularEmiCount,
    customPaymentCount: paymentSummary.customPaymentCount,
    prepaymentCount: paymentSummary.prepaymentCount,
    totalAmountPaid: paymentSummary.totalAmountPaid,
    cumulativePrincipalPaid: breakdowns.principalPaid,
    cumulativeInterestPaid: breakdowns.interestPaid,
    hasBankConfirmedBreakdowns: breakdowns.hasBankConfirmedBreakdowns,
    estimatedRemainingInterest: payoffInfo.estimatedRemainingInterest,
    estimatedPayoffDate: payoffInfo.estimatedPayoffDate,
    formattedPayoffDate: payoffInfo.formattedPayoffDate,
    remainingTenureMonths,
    remainingTenureText,
    originalTenureMonths,
    isIndefinite: payoffInfo.isIndefinite,
    prepaymentImpact,
    latestPaymentInsight,
    historySeries,
    isPaidOff: balanceState.currentBalance <= 0,
    isArchived: loan.status === 'archived',
  };
};

const formatLoanDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(d) ? format(d, 'dd MMM yyyy') : String(dateString);
  } catch (e) {
    return String(dateString);
  }
};

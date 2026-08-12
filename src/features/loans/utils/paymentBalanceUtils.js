import { calculateEmiBreakdown } from './loanBalanceUtils';
import { BALANCE_SOURCES } from '../constants/loanPaymentConstants';

/**
 * Deterministically sorts loan payments chronologically.
 * Primary: paymentDate (ascending)
 * Secondary: createdAt (ascending)
 * Tertiary: id (ascending)
 * @param {Array} payments
 * @returns {Array} Sorted payment records
 */
export const sortPaymentsChronologically = (payments = []) => {
  if (!Array.isArray(payments)) return [];

  return [...payments].sort((a, b) => {
    const dateA = new Date(a.paymentDate || 0).getTime();
    const dateB = new Date(b.paymentDate || 0).getTime();
    if (dateA !== dateB) return dateA - dateB;

    const createdA = new Date(a.createdAt || 0).getTime();
    const createdB = new Date(b.createdAt || 0).getTime();
    if (createdA !== createdB) return createdA - createdB;

    return String(a.id || '').localeCompare(String(b.id || ''));
  });
};

/**
 * Identifies the starting balance anchor for a loan before replaying a set of payments.
 * @param {Object} params
 * @param {Object} params.loan
 * @param {Array} params.payments - Initial/unfiltered or remaining payments
 * @returns {{ startingBalance: number, anchorSource: string, anchorPaymentId: string|null, lastConfirmedDate: string|null }}
 */
export const getPaymentBalanceAnchor = ({ loan, payments = [] } = {}) => {
  if (!loan) {
    return { startingBalance: 0, anchorSource: BALANCE_SOURCES.ESTIMATED, anchorPaymentId: null, lastConfirmedDate: null };
  }

  const loanId = loan.id;
  const loanPayments = Array.isArray(payments)
    ? payments.filter((p) => p.loanId === loanId)
    : [];

  const sorted = sortPaymentsChronologically(loanPayments);

  // Check if any payment record prior to or within history contains a bank-confirmed actualClosingBalance
  const bankConfirmedPayment = [...sorted].reverse().find(
    (p) => p.balanceSource === BALANCE_SOURCES.BANK_CONFIRMED && p.actualClosingBalance !== null && p.actualClosingBalance !== undefined
  );

  if (bankConfirmedPayment) {
    return {
      startingBalance: Number(bankConfirmedPayment.actualClosingBalance),
      anchorSource: BALANCE_SOURCES.BANK_CONFIRMED,
      anchorPaymentId: bankConfirmedPayment.id,
      lastConfirmedDate: bankConfirmedPayment.paymentDate || bankConfirmedPayment.createdAt,
    };
  }

  let startingBalance = Number(loan.userConfirmedBalance);
  if (isNaN(startingBalance) || loan.userConfirmedBalance === undefined || loan.userConfirmedBalance === null) {
    startingBalance = Number(loan.currentOutstandingPrincipal) || Number(loan.originalPrincipal) || 0;
  }

  const anchorSource = loan.balanceSource || BALANCE_SOURCES.BANK_CONFIRMED;
  const lastConfirmedDate = loan.lastBalanceConfirmationDate || loan.loanStartDate || null;

  return { startingBalance, anchorSource, anchorPaymentId: null, lastConfirmedDate };
};

/**
 * Replays loan payments chronologically and recalculates closing balance and payment snapshots.
 * @param {Object} params
 * @param {Object} params.loan - Target loan profile
 * @param {Array} params.payments - Array of remaining payment records for this loan
 * @returns {{ finalEstimatedBalance: number, updatedPayments: Array, effectiveBalanceSource: string }}
 */
export const recalculateLoanBalanceFromPayments = ({ loan, payments = [] } = {}) => {
  if (!loan) {
    return { finalEstimatedBalance: 0, updatedPayments: [], effectiveBalanceSource: BALANCE_SOURCES.ESTIMATED };
  }

  const loanId = loan.id;
  const loanPayments = Array.isArray(payments)
    ? payments.filter((p) => p.loanId === loanId)
    : [];

  if (loanPayments.length === 0) {
    const defaultAnchor = loan.userConfirmedBalance !== undefined && loan.userConfirmedBalance !== null
      ? Number(loan.userConfirmedBalance)
      : (Number(loan.originalPrincipal) || 0);
    return {
      finalEstimatedBalance: Math.max(0, defaultAnchor),
      updatedPayments: [],
      effectiveBalanceSource: loan.balanceSource || BALANCE_SOURCES.BANK_CONFIRMED,
    };
  }

  const sortedPayments = sortPaymentsChronologically(loanPayments);
  const annualInterestRate = Number(loan.annualInterestRate) || 0;

  // Determine starting balance anchor
  const initialAnchor = getPaymentBalanceAnchor({ loan, payments: sortedPayments });
  let currentRunningBalance = initialAnchor.startingBalance;
  let anchorFound = !initialAnchor.anchorPaymentId;
  let latestSource = initialAnchor.anchorSource;

  const updatedPayments = sortedPayments.map((p) => {
    // If an earlier payment was a bank-confirmed anchor, start replay after that anchor
    if (!anchorFound) {
      if (p.id === initialAnchor.anchorPaymentId) {
        anchorFound = true;
        currentRunningBalance = Number(p.actualClosingBalance || p.outstandingAfter || currentRunningBalance);
        latestSource = BALANCE_SOURCES.BANK_CONFIRMED;
        return { ...p };
      }
      return { ...p };
    }

    const openingBalance = currentRunningBalance;
    const breakdown = calculateEmiBreakdown({
      currentOutstanding: openingBalance,
      annualInterestRate,
      amount: p.amount || p.paymentAmount,
      paymentType: p.paymentType,
      userPrincipal: p.userPrincipal || (p.principalAmount !== null && p.interestAmount === 0 ? p.principalAmount : ''),
    });

    const isActual = p.balanceSource === BALANCE_SOURCES.BANK_CONFIRMED && p.actualClosingBalance !== null && p.actualClosingBalance !== undefined;
    const closingBalance = isActual ? Number(p.actualClosingBalance) : breakdown.newOutstanding;

    currentRunningBalance = closingBalance;
    latestSource = isActual ? BALANCE_SOURCES.BANK_CONFIRMED : BALANCE_SOURCES.ESTIMATED;

    const calculationSnapshot = {
      annualRate: annualInterestRate,
      interestMethod: 'monthly_reducing',
      openingBalance,
      estimatedInterest: breakdown.interestPaid,
      estimatedPrincipal: breakdown.principalPaid,
      estimatedClosingBalance: closingBalance,
    };

    return {
      ...p,
      outstandingBefore: openingBalance,
      openingBalance,
      principalAmount: breakdown.principalPaid,
      estimatedPrincipal: breakdown.principalPaid,
      interestAmount: breakdown.interestPaid,
      estimatedInterest: breakdown.interestPaid,
      outstandingAfter: closingBalance,
      estimatedClosingBalance: closingBalance,
      calculationSnapshot: p.calculationSnapshot || calculationSnapshot,
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    finalEstimatedBalance: Math.max(0, currentRunningBalance),
    updatedPayments,
    effectiveBalanceSource: latestSource,
  };
};

/**
 * Single source of truth helper selector for determining a loan's current balance and status.
 * @param {Object} loan Profile object
 * @param {Array} payments Payments array for this loan
 * @returns {{ currentBalance: number, balanceSource: string, isBankConfirmed: boolean, lastConfirmedDate: string|null, ledgerVersion: number }}
 */
export const getCurrentLoanBalance = (loan, payments = []) => {
  if (!loan) {
    return {
      currentBalance: 0,
      balanceSource: BALANCE_SOURCES.ESTIMATED,
      isBankConfirmed: false,
      lastConfirmedDate: null,
      ledgerVersion: 1,
    };
  }

  const anchor = getPaymentBalanceAnchor({ loan, payments });
  const isBankConfirmed = loan.balanceSource === BALANCE_SOURCES.BANK_CONFIRMED || anchor.anchorSource === BALANCE_SOURCES.BANK_CONFIRMED;
  const currentBalance = Math.max(0, Number(loan.currentOutstandingPrincipal) || 0);

  return {
    currentBalance,
    balanceSource: loan.balanceSource || BALANCE_SOURCES.ESTIMATED,
    isBankConfirmed,
    lastConfirmedDate: loan.lastBalanceConfirmationDate || anchor.lastConfirmedDate,
    ledgerVersion: Number(loan.ledgerVersion) || 1,
  };
};

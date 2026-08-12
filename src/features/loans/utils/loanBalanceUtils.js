import { format, parseISO } from 'date-fns';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

/**
 * Calculates total paid amount for a given loan ID.
 * @param {Array} payments
 * @param {string} loanId
 * @returns {number}
 */
export const getTotalPaidForLoan = (payments = [], loanId = '') => {
  if (!loanId || !Array.isArray(payments)) return 0;
  return payments
    .filter((p) => p.loanId === loanId)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

/**
 * Calculates total paid amount by payment type for a loan.
 * @param {Array} payments
 * @param {string} loanId
 * @param {string} type
 * @returns {number}
 */
export const getTotalPaidByType = (payments = [], loanId = '', type = '') => {
  if (!loanId || !type || !Array.isArray(payments)) return 0;
  return payments
    .filter((p) => p.loanId === loanId && (p.paymentType === type || (type === 'regular_emi' && p.paymentType === 'emi')))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

/**
 * Computes payment statistics summary for a loan.
 * @param {Array} payments
 * @param {string} loanId
 * @returns {Object}
 */
export const getPaymentStats = (payments = [], loanId = '') => {
  const loanPayments = Array.isArray(payments)
    ? payments.filter((p) => p.loanId === loanId)
    : [];

  const sorted = [...loanPayments].sort((a, b) => {
    const dateDiff = new Date(b.paymentDate) - new Date(a.paymentDate);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPaid = sorted.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPayments = sorted.length;

  const emiPayments = sorted.filter((p) => p.paymentType === PAYMENT_TYPES.REGULAR_EMI || p.paymentType === 'emi' || p.paymentType === PAYMENT_TYPES.CUSTOM_PAYMENT);
  const prepayments = sorted.filter((p) => p.paymentType === PAYMENT_TYPES.PREPAYMENT || p.paymentType === 'part_prepayment' || p.paymentType === 'full_payment');

  const totalEmiPaid = emiPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPrepaid = prepayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const latestPayment = sorted[0] || null;
  const lastPaymentDate = latestPayment ? latestPayment.paymentDate : null;

  return {
    totalPaid,
    totalPayments,
    emiCount: emiPayments.length,
    prepaymentCount: prepayments.length,
    totalEmiPaid,
    totalPrepaid,
    latestPayment,
    lastPaymentDate,
  };
};

/**
 * Returns chronological balance snapshot history from payments with outstandingAfter.
 * @param {Array} payments
 * @param {string} loanId
 * @returns {Array<{ date: string, balance: number, paymentId: string, paymentType: string }>}
 */
export const getBalanceHistory = (payments = [], loanId = '') => {
  const loanPayments = Array.isArray(payments)
    ? payments.filter((p) => p.loanId === loanId && (p.outstandingAfter !== null && p.outstandingAfter !== undefined))
    : [];

  const chronological = [...loanPayments].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

  return chronological.map((p) => ({
    date: p.paymentDate,
    balance: Number(p.outstandingAfter),
    paymentId: p.id,
    paymentType: p.paymentType,
    outstandingBefore: p.outstandingBefore !== null ? Number(p.outstandingBefore) : null,
  }));
};

/**
 * Gets latest known outstanding balance recorded in payment history.
 * @param {Array} payments
 * @param {string} loanId
 * @returns {number|null}
 */
export const getLatestKnownBalance = (payments = [], loanId = '') => {
  const history = getBalanceHistory(payments, loanId);
  return history.length > 0 ? history[history.length - 1].balance : null;
};

/**
 * Calculates net balance difference between before and after values.
 * @param {number|null} before
 * @param {number|null} after
 * @returns {{ diff: number, percentageChange: number }}
 */
export const getBalanceChange = (before, after) => {
  if (before === null || before === undefined || after === null || after === undefined) {
    return { diff: 0, percentageChange: 0 };
  }
  const diff = after - before;
  const percentageChange = before > 0 ? (diff / before) * 100 : 0;
  return { diff, percentageChange };
};

/**
 * Groups payment records by month (e.g. "August 2026") for timeline rendering.
 * @param {Array} payments
 * @returns {Array<{ monthLabel: string, monthKey: string, data: Array }>}
 */
export const groupPaymentsByMonth = (payments = []) => {
  if (!Array.isArray(payments) || payments.length === 0) return [];

  const groupsMap = {};

  payments.forEach((payment) => {
    try {
      const d = parseISO(payment.paymentDate);
      const monthKey = format(d, 'yyyy-MM');
      const monthLabel = format(d, 'MMMM yyyy');

      if (!groupsMap[monthKey]) {
        groupsMap[monthKey] = {
          monthKey,
          monthLabel,
          data: [],
        };
      }
      groupsMap[monthKey].data.push(payment);
    } catch {
      const fallbackKey = 'other';
      if (!groupsMap[fallbackKey]) {
        groupsMap[fallbackKey] = {
          monthKey: fallbackKey,
          monthLabel: 'Other Payments',
          data: [],
        };
      }
      groupsMap[fallbackKey].data.push(payment);
    }
  });

  return Object.values(groupsMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

/**
 * Calculates interest & principal breakdown and estimated new outstanding balance.
 * @param {Object} params
 * @param {number} params.currentOutstanding - Current loan outstanding principal
 * @param {number} params.annualInterestRate - Annual interest rate (% p.a.)
 * @param {number|string} params.amount - Total payment amount
 * @param {string} params.paymentType - Payment type ('regular_emi', 'custom_payment', 'prepayment')
 * @param {number|string} [params.userPrincipal] - Explicit principal amount entered by user
 * @returns {{ principalPaid: number, interestPaid: number, newOutstanding: number, estimatedMonthlyInterest: number }}
 */
export const calculateEmiBreakdown = ({
  currentOutstanding = 0,
  annualInterestRate = 0,
  amount = 0,
  paymentType = PAYMENT_TYPES.REGULAR_EMI,
  userPrincipal = '',
}) => {
  const numOutstanding = Math.max(0, Number(currentOutstanding) || 0);
  const numRate = Math.max(0, Number(annualInterestRate) || 0);
  const numAmount = Math.max(0, Number(amount) || 0);
  const numUserPrincipal = Number(userPrincipal);

  const monthlyRate = numRate / 100 / 12;
  const estimatedMonthlyInterest = numOutstanding > 0 && numRate > 0
    ? Math.min(numAmount, Math.round(numOutstanding * monthlyRate))
    : 0;

  // 1. If user entered an explicit Principal Paid amount, honor it directly
  if (!isNaN(numUserPrincipal) && userPrincipal !== '' && userPrincipal !== null) {
    const principalPaid = Math.min(numOutstanding, Math.max(0, numUserPrincipal));
    const interestPaid = Math.max(0, numAmount - principalPaid);
    const newOutstanding = Math.max(0, numOutstanding - principalPaid);
    return { principalPaid, interestPaid, newOutstanding, estimatedMonthlyInterest };
  }

  // 2. Prepayment
  if (paymentType === 'prepayment' || paymentType === 'part_prepayment' || paymentType === 'full_payment') {
    const principalPaid = Math.min(numOutstanding, numAmount);
    const newOutstanding = Math.max(0, numOutstanding - principalPaid);
    return { principalPaid, interestPaid: 0, newOutstanding, estimatedMonthlyInterest: 0 };
  }

  // 3. Regular EMI or Custom Payment
  if (numOutstanding <= 0 || numAmount <= 0) {
    return { principalPaid: Math.min(numOutstanding, numAmount), interestPaid: 0, newOutstanding: Math.max(0, numOutstanding - numAmount), estimatedMonthlyInterest: 0 };
  }

  const principalPaid = Math.min(numOutstanding, Math.max(0, numAmount - estimatedMonthlyInterest));
  const newOutstanding = Math.max(0, numOutstanding - principalPaid);

  return {
    principalPaid,
    interestPaid: estimatedMonthlyInterest,
    newOutstanding,
    estimatedMonthlyInterest,
  };
};

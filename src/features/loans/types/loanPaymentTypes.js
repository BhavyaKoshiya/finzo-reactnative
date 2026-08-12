import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

export const LOAN_PAYMENT_SCHEMA_VERSION = 1;

/**
 * Factory function to create a normalized, validated LoanPayment record with an immutable snapshot.
 * @param {Object} params
 * @returns {Object} LoanPayment object
 */
export const createLoanPayment = ({
  id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  schemaVersion = LOAN_PAYMENT_SCHEMA_VERSION,
  loanId = '',
  amount = 0,
  paymentDate = new Date().toISOString().split('T')[0],
  dueDate = null,
  paymentType = PAYMENT_TYPES.REGULAR_EMI,
  principalAmount = null,
  interestAmount = null,
  feesAmount = null,
  outstandingBefore = null,
  outstandingAfter = null,
  actualClosingBalance = null,
  balanceSource = BALANCE_SOURCES.ESTIMATED,
  balanceUpdated = true,
  calculationSnapshot = null,
  note = '',
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) => {
  const numAmount = Number(amount) || 0;
  const numPrincipal = principalAmount !== null && principalAmount !== undefined && !isNaN(Number(principalAmount))
    ? Number(principalAmount)
    : null;
  const numInterest = interestAmount !== null && interestAmount !== undefined && !isNaN(Number(interestAmount))
    ? Number(interestAmount)
    : null;
  const numFees = feesAmount !== null && feesAmount !== undefined && !isNaN(Number(feesAmount))
    ? Number(feesAmount)
    : null;
  const numBefore = outstandingBefore !== null && outstandingBefore !== undefined && !isNaN(Number(outstandingBefore))
    ? Number(outstandingBefore)
    : null;
  const numAfter = outstandingAfter !== null && outstandingAfter !== undefined && !isNaN(Number(outstandingAfter))
    ? Number(outstandingAfter)
    : null;
  const numActualAfter = actualClosingBalance !== null && actualClosingBalance !== undefined && !isNaN(Number(actualClosingBalance))
    ? Number(actualClosingBalance)
    : null;

  const resolvedSnapshot = calculationSnapshot || {
    annualRate: Number(calculationSnapshot?.annualRate) || 0,
    interestMethod: calculationSnapshot?.interestMethod || 'monthly_reducing',
    openingBalance: numBefore,
    estimatedInterest: numInterest,
    estimatedPrincipal: numPrincipal,
    estimatedClosingBalance: numAfter,
  };

  return {
    id,
    schemaVersion,
    loanId: String(loanId || '').trim(),
    amount: numAmount,
    paymentAmount: numAmount,
    paymentDate: String(paymentDate || '').trim(),
    dueDate: dueDate ? String(dueDate).trim() : null,
    paymentType: Object.values(PAYMENT_TYPES).includes(paymentType) ? paymentType : PAYMENT_TYPES.CUSTOM_PAYMENT,
    // Snapshots
    principalAmount: numPrincipal,
    estimatedPrincipal: numPrincipal,
    interestAmount: numInterest,
    estimatedInterest: numInterest,
    feesAmount: numFees,
    outstandingBefore: numBefore,
    openingBalance: numBefore,
    outstandingAfter: numAfter,
    estimatedClosingBalance: numAfter,
    actualClosingBalance: numActualAfter,
    balanceSource: Object.values(BALANCE_SOURCES).includes(balanceSource) ? balanceSource : BALANCE_SOURCES.ESTIMATED,
    balanceUpdated: Boolean(balanceUpdated),
    calculationSnapshot: resolvedSnapshot,
    note: String(note || '').trim(),
    createdAt,
    updatedAt,
  };
};

/**
 * Type guard / schema validator to ensure hydrated persisted payment records are safe.
 * @param {any} record
 * @returns {boolean}
 */
export const isValidLoanPayment = (record) => {
  if (!record || typeof record !== 'object') return false;
  if (!record.id || typeof record.id !== 'string') return false;
  if (!record.loanId || typeof record.loanId !== 'string') return false;
  if (typeof record.amount !== 'number' || isNaN(record.amount) || record.amount <= 0) return false;
  if (typeof record.paymentDate !== 'string' || !record.paymentDate.trim()) return false;
  return true;
};

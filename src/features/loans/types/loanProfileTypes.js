/**
 * Schema version for real user loan profile records.
 */
export const LOAN_PROFILE_SCHEMA_VERSION = 1;

/**
 * Factory function to create a validated, normalized LoanProfile record.
 * @param {Object} params
 * @returns {Object} LoanProfile object
 */
export const createLoanProfile = ({
  id = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  schemaVersion = LOAN_PROFILE_SCHEMA_VERSION,
  name = 'My Loan',
  loanType = 'home_loan',
  lenderName = '',
  originalPrincipal = 0,
  currentOutstandingPrincipal = 0,
  annualInterestRate = 0,
  emiAmount = 0,
  originalTenure = { value: 0, unit: 'months' },
  remainingTenure = { value: 0, unit: 'months' },
  loanStartDate = new Date().toISOString().split('T')[0],
  nextEmiDate = new Date().toISOString().split('T')[0],
  emiFrequency = 'monthly',
  processingFee = 0,
  notes = '',
  isPrimary = false,
  status = 'active',
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) => ({
  id,
  schemaVersion,
  name: String(name || 'My Loan').trim(),
  loanType,
  lenderName: String(lenderName || '').trim(),
  originalPrincipal: Number(originalPrincipal) || 0,
  currentOutstandingPrincipal: Number(currentOutstandingPrincipal) || 0,
  annualInterestRate: Number(annualInterestRate) || 0,
  emiAmount: Number(emiAmount) || 0,
  originalTenure: {
    value: Number(originalTenure?.value) || 0,
    unit: originalTenure?.unit === 'years' ? 'years' : 'months',
  },
  remainingTenure: {
    value: Number(remainingTenure?.value) || 0,
    unit: remainingTenure?.unit === 'years' ? 'years' : 'months',
  },
  loanStartDate: String(loanStartDate).trim(),
  nextEmiDate: String(nextEmiDate).trim(),
  emiFrequency: String(emiFrequency || 'monthly'),
  processingFee: Number(processingFee) || 0,
  notes: String(notes || '').trim(),
  isPrimary: Boolean(isPrimary),
  status: status === 'archived' ? 'archived' : 'active',
  createdAt,
  updatedAt,
});

/**
 * Type guard / schema validator to ensure hydrated persisted profiles are safe.
 * @param {any} record
 * @returns {boolean}
 */
export const isValidLoanProfile = (record) => {
  if (!record || typeof record !== 'object') return false;
  if (!record.id || typeof record.id !== 'string') return false;
  if (typeof record.name !== 'string') return false;
  if (typeof record.originalPrincipal !== 'number' || isNaN(record.originalPrincipal)) return false;
  if (typeof record.currentOutstandingPrincipal !== 'number' || isNaN(record.currentOutstandingPrincipal)) return false;
  return true;
};

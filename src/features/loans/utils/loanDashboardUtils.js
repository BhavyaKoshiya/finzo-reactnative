/**
 * Calculates sum of original loan principal for active loans.
 * @param {Array} loans
 * @returns {number}
 */
export const getTotalOriginalLoanAmount = (loans = []) => {
  if (!Array.isArray(loans)) return 0;
  return loans
    .filter((l) => l && l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.originalPrincipal) || 0), 0);
};

/**
 * Calculates sum of current outstanding principal for active loans.
 * @param {Array} loans
 * @returns {number}
 */
export const getTotalOutstandingPrincipal = (loans = []) => {
  if (!Array.isArray(loans)) return 0;
  return loans
    .filter((l) => l && l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.currentOutstandingPrincipal) || 0), 0);
};

export const getTotalOutstanding = getTotalOutstandingPrincipal;

/**
 * Calculates total principal paid across active loans.
 * @param {Array} loans
 * @returns {number}
 */
export const getTotalPrincipalPaid = (loans = []) => {
  const orig = getTotalOriginalLoanAmount(loans);
  const out = getTotalOutstandingPrincipal(loans);
  return Math.max(0, orig - out);
};

/**
 * Calculates sum of monthly EMI for active loans.
 * @param {Array} loans
 * @returns {number}
 */
export const getTotalMonthlyEMI = (loans = []) => {
  if (!Array.isArray(loans)) return 0;
  return loans
    .filter((l) => l && l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.emiAmount) || 0), 0);
};

/**
 * Calculates active loan count.
 * @param {Array} loans
 * @returns {number}
 */
export const getActiveLoanCount = (loans = []) => {
  if (!Array.isArray(loans)) return 0;
  return loans.filter((l) => l && l.status === 'active').length;
};

/**
 * Calculates approximate principal repayment progress based on user-entered data.
 * @param {number} originalPrincipal
 * @param {number} currentOutstanding
 * @returns {Object} { principalRepaid, ratio, percentage }
 */
export const calculatePrincipalRepaymentProgress = (originalPrincipal, currentOutstanding) => {
  const orig = Math.max(0, Number(originalPrincipal) || 0);
  const out = Math.max(0, Number(currentOutstanding) || 0);

  if (orig === 0) {
    return {
      principalRepaid: 0,
      ratio: 0,
      percentage: 0,
    };
  }

  const repaid = Math.max(0, orig - out);
  const rawRatio = repaid / orig;
  const clampedRatio = Math.min(1, Math.max(0, rawRatio));
  const percentage = Number((clampedRatio * 100).toFixed(2));

  return {
    principalRepaid: repaid,
    ratio: clampedRatio,
    percentage,
  };
};

export default {
  getTotalOriginalLoanAmount,
  getTotalOutstandingPrincipal,
  getTotalOutstanding,
  getTotalPrincipalPaid,
  getTotalMonthlyEMI,
  getActiveLoanCount,
  calculatePrincipalRepaymentProgress,
};

import { LOAN_TYPES } from '../constants/loanConstants';

/**
 * Converts tenure object to total months for comparisons.
 * @param {Object} tenure { value, unit }
 * @returns {number}
 */
export const getTenureInMonths = (tenure) => {
  if (!tenure || typeof tenure !== 'object') return 0;
  const val = Number(tenure.value) || 0;
  return tenure.unit === 'years' ? val * 12 : val;
};

/**
 * Pure validation function for Loan Profile fields.
 * Returns an object containing error messages by field, or empty object if valid.
 * @param {Object} inputs
 * @returns {Object} { [fieldName]: errorMessage }
 */
export const validateLoanProfileInput = (inputs = {}) => {
  const errors = {};

  // 1. Loan Name
  const name = String(inputs.name || '').trim();
  if (!name) {
    errors.name = 'Loan name is required.';
  } else if (name.length > 50) {
    errors.name = 'Loan name must be 50 characters or less.';
  }

  // 2. Loan Type
  const validTypes = Object.values(LOAN_TYPES);
  if (!inputs.loanType || !validTypes.includes(inputs.loanType)) {
    errors.loanType = 'Please select a valid loan type.';
  }

  // 3. Original Principal
  const origPrincipal = Number(inputs.originalPrincipal);
  if (isNaN(origPrincipal) || origPrincipal <= 0) {
    errors.originalPrincipal = 'Original loan amount must be greater than zero.';
  }

  // 4. Current Outstanding Principal
  const outstanding = Number(inputs.currentOutstandingPrincipal);
  if (isNaN(outstanding) || outstanding < 0) {
    errors.currentOutstandingPrincipal = 'Current outstanding cannot be negative.';
  } else if (!isNaN(origPrincipal) && origPrincipal > 0 && outstanding > origPrincipal) {
    errors.currentOutstandingPrincipal = 'Current outstanding cannot exceed original loan amount.';
  }

  // 5. Interest Rate
  const rate = Number(inputs.annualInterestRate);
  if (isNaN(rate) || rate < 0) {
    errors.annualInterestRate = 'Interest rate cannot be negative.';
  } else if (rate > 100) {
    errors.annualInterestRate = 'Interest rate cannot exceed 100%.';
  }

  // 6. Monthly EMI
  const emi = Number(inputs.emiAmount);
  if (isNaN(emi) || emi <= 0) {
    errors.emiAmount = 'Monthly EMI amount must be greater than zero.';
  }

  // 7. Original Tenure
  const origTenureMonths = getTenureInMonths(inputs.originalTenure);
  if (origTenureMonths <= 0) {
    errors.originalTenure = 'Original tenure must be greater than zero.';
  }

  // 8. Remaining Tenure
  const remTenureMonths = getTenureInMonths(inputs.remainingTenure);
  if (remTenureMonths < 0) {
    errors.remainingTenure = 'Remaining tenure cannot be negative.';
  } else if (origTenureMonths > 0 && remTenureMonths > origTenureMonths) {
    errors.remainingTenure = 'Remaining tenure cannot exceed original tenure.';
  }

  // 9. Loan Start Date
  if (!inputs.loanStartDate || isNaN(Date.parse(inputs.loanStartDate))) {
    errors.loanStartDate = 'Please select a valid loan start date.';
  }

  // 10. Next EMI Date
  if (!inputs.nextEmiDate || isNaN(Date.parse(inputs.nextEmiDate))) {
    errors.nextEmiDate = 'Please select a valid next EMI date.';
  }

  // 11. Processing Fee (Optional, defaults to 0)
  if (inputs.processingFee !== undefined && inputs.processingFee !== null && inputs.processingFee !== '') {
    const fee = Number(inputs.processingFee);
    if (isNaN(fee) || fee < 0) {
      errors.processingFee = 'Processing fee cannot be negative.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default validateLoanProfileInput;

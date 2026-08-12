import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

/**
 * Validates loan payment form input.
 * @param {Object} input
 * @param {Object} [options]
 * @returns {{ isValid: boolean, errors: Object, warnings: Object }}
 */
export const validateLoanPaymentInput = (input = {}) => {
  const errors = {};
  const warnings = {};

  const {
    loanId,
    amount,
    paymentDate,
    paymentType,
    principalAmount,
    interestAmount,
    feesAmount,
    outstandingBefore,
    outstandingAfter,
    balanceUpdated,
  } = input;

  // 1. Loan ID
  if (!loanId || typeof loanId !== 'string' || !loanId.trim()) {
    errors.loanId = 'Loan ID is required.';
  }

  // 2. Amount
  const numAmount = Number(amount);
  if (amount === undefined || amount === null || amount === '' || isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Payment amount must be greater than zero.';
  }

  // 3. Payment Date
  if (!paymentDate || typeof paymentDate !== 'string' || !paymentDate.trim()) {
    errors.paymentDate = 'Payment date is required.';
  } else {
    const d = new Date(paymentDate);
    if (isNaN(d.getTime())) {
      errors.paymentDate = 'Please select a valid payment date.';
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (d > today) {
        errors.paymentDate = 'Future payment dates are not allowed for completed payments.';
      }
    }
  }

  // 4. Payment Type
  if (!paymentType || !Object.values(PAYMENT_TYPES).includes(paymentType)) {
    errors.paymentType = 'Please select a valid payment type.';
  }

  // 5. Optional Breakdown Fields Validation
  const hasPrincipal = principalAmount !== null && principalAmount !== undefined && principalAmount !== '';
  const numPrincipal = hasPrincipal ? Number(principalAmount) : null;
  if (hasPrincipal && (isNaN(numPrincipal) || numPrincipal < 0)) {
    errors.principalAmount = 'Principal paid cannot be negative.';
  }

  const hasInterest = interestAmount !== null && interestAmount !== undefined && interestAmount !== '';
  const numInterest = hasInterest ? Number(interestAmount) : null;
  if (hasInterest && (isNaN(numInterest) || numInterest < 0)) {
    errors.interestAmount = 'Interest paid cannot be negative.';
  }

  const hasFees = feesAmount !== null && feesAmount !== undefined && feesAmount !== '';
  const numFees = hasFees ? Number(feesAmount) : null;
  if (hasFees && (isNaN(numFees) || numFees < 0)) {
    errors.feesAmount = 'Fees paid cannot be negative.';
  }

  // Amount Breakdown Consistency Check
  if (hasPrincipal && hasInterest && hasFees && numAmount > 0) {
    const breakdownSum = (numPrincipal || 0) + (numInterest || 0) + (numFees || 0);
    if (breakdownSum > numAmount) {
      errors.breakdownSum = 'Principal, interest and fees sum exceeds total payment amount.';
    }
  }

  // 6. Balance Update Validation
  if (balanceUpdated) {
    const numAfter = Number(outstandingAfter);
    if (outstandingAfter === undefined || outstandingAfter === null || outstandingAfter === '' || isNaN(numAfter)) {
      errors.outstandingAfter = 'Please enter valid new outstanding balance.';
    } else if (numAfter < 0) {
      errors.outstandingAfter = 'Outstanding balance cannot be negative.';
    }

    const numBefore = Number(outstandingBefore);
    if (!isNaN(numBefore) && !isNaN(numAfter) && numAfter > numBefore) {
      warnings.outstandingAfter = 'Your new balance is higher than the previous balance. Please verify the amount.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

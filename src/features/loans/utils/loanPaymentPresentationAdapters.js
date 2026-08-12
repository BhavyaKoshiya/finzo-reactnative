import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../../utils/financeFormatters';
import { getPaymentTypeConfig } from '../constants/loanPaymentConstants';

/**
 * Transforms a raw LoanPayment record into a view-ready presentation model.
 * @param {Object} payment
 * @returns {Object|null}
 */
export const adaptLoanPaymentForDisplay = (payment) => {
  if (!payment || typeof payment !== 'object') return null;

  const typeConfig = getPaymentTypeConfig(payment.paymentType);

  let formattedDate = payment.paymentDate;
  try {
    formattedDate = format(parseISO(payment.paymentDate), 'dd MMM yyyy');
  } catch {
    formattedDate = payment.paymentDate;
  }

  let formattedCompactDate = payment.paymentDate;
  try {
    formattedCompactDate = format(parseISO(payment.paymentDate), 'dd MMM');
  } catch {
    formattedCompactDate = payment.paymentDate;
  }

  const formattedAmount = formatCurrency(payment.amount);
  const formattedOutstandingBefore = payment.outstandingBefore !== null
    ? formatCurrency(payment.outstandingBefore)
    : null;
  const formattedOutstandingAfter = payment.outstandingAfter !== null
    ? formatCurrency(payment.outstandingAfter)
    : null;

  const formattedPrincipal = payment.principalAmount !== null
    ? formatCurrency(payment.principalAmount)
    : null;
  const formattedInterest = payment.interestAmount !== null
    ? formatCurrency(payment.interestAmount)
    : null;
  const formattedFees = payment.feesAmount !== null
    ? formatCurrency(payment.feesAmount)
    : null;

  return {
    ...payment,
    typeLabel: typeConfig.label,
    typeIcon: typeConfig.icon,
    badgeColor: typeConfig.badgeColor,
    formattedDate,
    formattedCompactDate,
    formattedAmount,
    formattedOutstandingBefore,
    formattedOutstandingAfter,
    formattedPrincipal,
    formattedInterest,
    formattedFees,
    accessibilityLabel: `${typeConfig.label} of ${formattedAmount} on ${formattedDate}.${
      formattedOutstandingAfter ? ` Outstanding balance after payment: ${formattedOutstandingAfter}.` : ''
    }`,
  };
};

import { formatCurrency, formatCurrencyCompact, formatPercentage } from '../../../utils/financeFormatters';
import { formatLoanDate, getNextEmiInfo } from './loanDateUtils';
import { calculatePrincipalRepaymentProgress } from './loanDashboardUtils';
import { LOAN_TYPE_CONFIG, DEFAULT_LOAN_ICON } from '../constants/loanConstants';
import { getPaymentStatus } from './loanReminderUtils';
import { calculateRemainingInterestAndPayoff } from './loanInsightUtils';

/**
 * Prepares presentation-ready view model for a LoanProfile.
 * @param {Object} profile
 * @param {Array} [payments=[]]
 * @returns {Object}
 */
export const adaptLoanProfileForDisplay = (profile, payments = []) => {
  if (!profile) return null;

  const typeConfig = LOAN_TYPE_CONFIG[profile.loanType] || {
    label: 'Other Loan',
    icon: DEFAULT_LOAN_ICON,
    badgeColor: '#6B7280',
  };

  const progress = calculatePrincipalRepaymentProgress(
    profile.originalPrincipal,
    profile.currentOutstandingPrincipal
  );

  const paymentStatus = getPaymentStatus(profile, payments);
  const targetDueDate = paymentStatus.nextDueDate || profile.nextEmiDate;
  const emiInfo = getNextEmiInfo(targetDueDate);

  let tenureVal = profile.remainingTenure?.value || 0;
  let tenureUnitStr = profile.remainingTenure?.unit || 'months';

  if (tenureVal === 0 && Number(profile.currentOutstandingPrincipal) > 0) {
    const payoffCalc = calculateRemainingInterestAndPayoff(profile);
    if (payoffCalc.remainingTenureMonths > 0) {
      if (payoffCalc.remainingTenureMonths >= 12 && payoffCalc.remainingTenureMonths % 12 === 0) {
        tenureVal = Math.floor(payoffCalc.remainingTenureMonths / 12);
        tenureUnitStr = tenureVal === 1 ? 'year' : 'years';
      } else {
        tenureVal = payoffCalc.remainingTenureMonths;
        tenureUnitStr = 'months';
      }
    } else if (profile.originalTenure?.value > 0) {
      tenureVal = profile.originalTenure.value;
      tenureUnitStr = profile.originalTenure.unit || 'months';
    }
  }

  const remainingTenureText = `${tenureVal} ${tenureUnitStr}`;

  const origTenureVal = profile.originalTenure?.value || 0;
  const origTenureUnitStr = profile.originalTenure?.unit || 'months';
  const originalTenureText = `${origTenureVal} ${origTenureUnitStr}`;

  return {
    ...profile,
    loanTypeLabel: typeConfig.label,
    loanTypeIcon: typeConfig.icon,
    badgeColor: typeConfig.badgeColor,
    formattedOriginalPrincipal: formatCurrency(profile.originalPrincipal),
    formattedCurrentOutstanding: formatCurrency(profile.currentOutstandingPrincipal),
    compactOutstanding: formatCurrencyCompact(profile.currentOutstandingPrincipal),
    formattedEmiAmount: formatCurrency(profile.emiAmount),
    formattedInterestRate: formatPercentage(profile.annualInterestRate),
    formattedProcessingFee: formatCurrency(profile.processingFee),
    remainingTenureText,
    originalTenureText,
    formattedStartDate: formatLoanDate(profile.loanStartDate),
    nextEmiInfo: emiInfo,
    repaymentProgressRatio: progress.ratio,
    repaymentPercentage: progress.percentage,
    formattedPrincipalRepaid: formatCurrency(progress.principalRepaid),
    progressText: `Approx. principal repaid ${formatCurrency(progress.principalRepaid)} (${progress.percentage}%)`,
    accessibilityLabel: `${profile.name}. ${profile.lenderName ? profile.lenderName + '.' : ''} Outstanding ${formatCurrency(profile.currentOutstandingPrincipal)}. Monthly EMI ${formatCurrency(profile.emiAmount)}. Interest rate ${formatPercentage(profile.annualInterestRate)}. ${remainingTenureText} remaining.`,
  };
};

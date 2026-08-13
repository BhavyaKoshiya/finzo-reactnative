import {
  createReportModel,
  createSummaryCard,
  createKeyValueItem,
  createSection,
  REPORT_TYPES,
} from '../models/reportModel';
import { formatINR } from '../../../calculations/core/currency';
import { getCurrentLoanBalance } from '../../loans/utils/paymentBalanceUtils';
import { buildLoanInsightSummary } from '../../loans/utils/loanInsightUtils';
import { formatLoanDate } from '../../loans/utils/loanDateUtils';
import { PAYMENT_TYPES } from '../../loans/constants/loanPaymentConstants';

const formatMoney = (val) => formatINR(val, { symbol: '₹' });
const formatPct = (val) => `${Number(val || 0).toFixed(2)}%`;

/**
 * Loan Summary Report Adapter
 */
export const buildLoanSummaryReport = ({ loan, payments = [] }) => {
  if (!loan) {
    throw new Error('Loan profile is required for summary report.');
  }

  const balanceState = getCurrentLoanBalance(loan, payments);
  const origPrincipal = Number(loan.originalPrincipal) || 0;
  const currentBalance = balanceState.currentBalance;
  const principalPaid = Math.max(0, origPrincipal - currentBalance);
  const isBankConfirmed = balanceState.isBankConfirmed;

  const summaryCards = [
    createSummaryCard({ label: 'Original Principal', value: formatMoney(origPrincipal) }),
    createSummaryCard({ label: 'Current Balance', value: formatMoney(currentBalance), highlight: true }),
    createSummaryCard({ label: 'Principal Paid', value: formatMoney(principalPaid), color: '#10B981' }),
    createSummaryCard({ label: 'Scheduled EMI', value: formatMoney(loan.emiAmount) }),
  ];

  const sections = [
    createSection({
      title: 'Loan Account Overview',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Loan Name', value: String(loan.name || 'Loan') }),
        createKeyValueItem({ label: 'Loan Type', value: String(loan.loanType || 'Personal Loan').toUpperCase() }),
        createKeyValueItem({ label: 'Lender / Institution', value: String(loan.lenderName || 'N/A') }),
        createKeyValueItem({ label: 'Account Status', value: String(loan.status || 'active').toUpperCase() }),
        createKeyValueItem({ label: 'Start Date', value: formatLoanDate(loan.loanStartDate) }),
      ],
    }),
    createSection({
      title: 'Loan Configuration',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Original Loan Principal', value: formatMoney(origPrincipal) }),
        createKeyValueItem({ label: 'Annual Interest Rate', value: formatPct(loan.annualInterestRate) }),
        createKeyValueItem({ label: 'Original Tenure', value: `${loan.originalTenureMonths || (loan.originalTenureValue * 12)} months` }),
        createKeyValueItem({ label: 'Scheduled Monthly EMI', value: formatMoney(loan.emiAmount), highlight: true }),
        createKeyValueItem({ label: 'Interest Method', value: 'Monthly Reducing Balance' }),
      ],
    }),
    createSection({
      title: 'Current Position & Status',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Current Outstanding Principal', value: formatMoney(currentBalance), highlight: true }),
        createKeyValueItem({ label: 'Principal Reduced To Date', value: formatMoney(principalPaid) }),
        createKeyValueItem({ label: 'Balance Verification Status', value: isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate', highlight: isBankConfirmed }),
        createKeyValueItem({ label: 'Total Payments Recorded', value: `${payments.length} log(s)` }),
      ],
    }),
  ];

  return createReportModel({
    title: `Loan Summary — ${loan.name || 'Loan'}`,
    subtitle: loan.lenderName ? `Bank: ${loan.lenderName}` : 'Loan Summary Report',
    reportType: REPORT_TYPES.LOAN_SUMMARY,
    loanId: loan.id,
    summaryCards,
    sections,
    assumptions: [
      `Balance verification status: ${isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate'}.`,
      `Future principal calculations assume standard monthly reducing balance math.`,
    ],
  });
};

/**
 * Loan Statement Report Adapter (Full Payment Ledger)
 */
export const buildLoanStatementReport = ({ loan, payments = [] }) => {
  if (!loan) {
    throw new Error('Loan profile is required for statement report.');
  }

  const baseSummary = buildLoanSummaryReport({ loan, payments });
  const sortedPayments = [...payments].sort((a, b) => new Date(a.paymentDate || a.createdAt) - new Date(b.paymentDate || b.createdAt));

  const tableHeaders = ['Date', 'Type', 'Amount', 'Opening Bal', 'Interest', 'Principal', 'Closing Bal', 'Status'];
  const tableRows = [];

  sortedPayments.forEach((p) => {
    const pDate = formatLoanDate(p.paymentDate || p.createdAt);
    const amount = Number(p.paymentAmount || p.amount) || 0;
    const typeKey = String(p.paymentType || PAYMENT_TYPES.REGULAR_EMI);

    let typeText = 'EMI';
    let badgeType = 'emi';

    if (typeKey === PAYMENT_TYPES.PREPAYMENT || typeKey === 'prepayment') {
      typeText = 'Prepayment';
      badgeType = 'prepayment';
    } else if (typeKey === PAYMENT_TYPES.BALANCE_CORRECTION || typeKey === 'balance_correction') {
      typeText = 'Correction';
      badgeType = 'correction';
    } else if (typeKey === PAYMENT_TYPES.CUSTOM_PAYMENT || typeKey === 'custom_payment') {
      typeText = 'Custom';
      badgeType = 'custom';
    }

    const openBal = p.openingBalance !== null && p.openingBalance !== undefined ? formatMoney(p.openingBalance) : '—';
    const closeBal = p.closingBalance !== null && p.closingBalance !== undefined ? formatMoney(p.closingBalance) : '—';

    // Use stored snapshot values if available
    const actPrin = p.actualPrincipal !== null && p.actualPrincipal !== undefined ? Number(p.actualPrincipal) : null;
    const actInt = p.actualInterest !== null && p.actualInterest !== undefined ? Number(p.actualInterest) : null;
    const estPrin = Number(p.principalAmount || p.estimatedPrincipal || (p.calculationSnapshot && p.calculationSnapshot.estimatedPrincipal)) || 0;
    const estInt = Number(p.interestAmount || p.estimatedInterest || (p.calculationSnapshot && p.calculationSnapshot.estimatedInterest)) || 0;

    const prinText = formatMoney(actPrin !== null ? actPrin : estPrin);
    const intText = formatMoney(actInt !== null ? actInt : estInt);
    const isConfirmed = actPrin !== null || actInt !== null || p.verificationStatus === 'bank_confirmed';

    tableRows.push([
      pDate,
      { badge: true, text: typeText, badgeType },
      formatMoney(amount),
      openBal,
      intText,
      prinText,
      closeBal,
      isConfirmed ? 'Confirmed' : 'Recorded',
    ]);
  });

  const statementSection = createSection({
    title: 'Payment Ledger & Transaction History',
    type: 'table',
    tableHeaders,
    tableRows,
    description: `Complete historical payment record for ${loan.name}. Preserves recorded snapshots.`,
  });

  return createReportModel({
    title: `Loan Statement — ${loan.name || 'Loan'}`,
    subtitle: `Total Transactions: ${payments.length}`,
    reportType: REPORT_TYPES.LOAN_STATEMENT,
    loanId: loan.id,
    summaryCards: baseSummary.summaryCards,
    sections: [...baseSummary.sections, statementSection],
    assumptions: [
      `Historical payment snapshots preserve interest/principal values recorded at the time of transaction.`,
      `Balance Corrections update current outstanding principal without registering as regular EMI payments.`,
    ],
  });
};

/**
 * Loan Insights Report Adapter
 */
export const buildLoanInsightsReport = ({ loan, payments = [] }) => {
  if (!loan) {
    throw new Error('Loan profile is required for insights report.');
  }

  const insightSummary = buildLoanInsightSummary(loan, payments);
  const {
    originalPrincipal,
    currentBalance,
    principalReduced,
    progressPercentage,
    cumulativeInterestPaid,
    formattedPayoffDate,
    estimatedRemainingInterest,
    remainingTenureText,
    prepaymentImpact,
    latestPaymentInsight,
  } = insightSummary;

  const summaryCards = [
    createSummaryCard({ label: 'Principal Progress', value: `${progressPercentage}%`, highlight: true, color: '#10B981' }),
    createSummaryCard({ label: 'Current Balance', value: formatMoney(currentBalance) }),
    createSummaryCard({ label: 'Interest Paid', value: formatMoney(cumulativeInterestPaid), color: '#D97706' }),
    createSummaryCard({ label: 'Estimated Payoff', value: formattedPayoffDate, color: '#2563EB' }),
  ];

  const sections = [
    createSection({
      title: 'Principal Progress & Payoff Projections',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Original Principal Amount', value: formatMoney(originalPrincipal) }),
        createKeyValueItem({ label: 'Current Outstanding Principal', value: formatMoney(currentBalance), highlight: true }),
        createKeyValueItem({ label: 'Principal Reduced To Date', value: formatMoney(principalReduced) }),
        createKeyValueItem({ label: 'Cumulative Interest Paid', value: formatMoney(cumulativeInterestPaid) }),
        createKeyValueItem({ label: 'Estimated Remaining Interest', value: formatMoney(estimatedRemainingInterest), isEstimate: true }),
        createKeyValueItem({ label: 'Estimated Remaining Tenure', value: remainingTenureText, isEstimate: true }),
        createKeyValueItem({ label: 'Estimated Payoff Date', value: formattedPayoffDate, highlight: true, isEstimate: true }),
      ],
    }),
  ];

  // Include Prepayment Impact if prepayments exist
  if (prepaymentImpact && prepaymentImpact.prepaymentCount > 0) {
    sections.push(
      createSection({
        title: 'Prepayment Impact & Savings',
        type: 'key_value',
        items: [
          createKeyValueItem({ label: 'Total Prepayments Made', value: `${formatMoney(prepaymentImpact.totalPrepaymentsMade)} (${prepaymentImpact.prepaymentCount})` }),
          createKeyValueItem({ label: 'Additional Principal Reduced', value: formatMoney(prepaymentImpact.additionalPrincipalReduced) }),
          createKeyValueItem({ label: 'Estimated Interest Avoided', value: formatMoney(prepaymentImpact.estimatedInterestAvoided), highlight: true, isEstimate: true }),
        ],
      })
    );
  }

  // Include Latest Payment Breakdown
  if (latestPaymentInsight) {
    sections.push(
      createSection({
        title: 'Latest Recorded Payment Insight',
        type: 'key_value',
        items: [
          createKeyValueItem({ label: 'Payment Date', value: latestPaymentInsight.formattedDate }),
          createKeyValueItem({ label: 'Amount Recorded', value: formatMoney(latestPaymentInsight.amount) }),
          createKeyValueItem({ label: 'Principal Portion', value: formatMoney(latestPaymentInsight.principal) }),
          createKeyValueItem({ label: 'Interest Portion', value: formatMoney(latestPaymentInsight.interest) }),
          createKeyValueItem({ label: 'Breakdown Source', value: latestPaymentInsight.isBankConfirmed ? 'Bank Confirmed' : 'Finzo Estimate' }),
        ],
      })
    );
  }

  return createReportModel({
    title: `Loan Insights — ${loan.name || 'Loan'}`,
    subtitle: `Payoff Progress: ${progressPercentage}% Paid`,
    reportType: REPORT_TYPES.LOAN_INSIGHTS,
    loanId: loan.id,
    summaryCards,
    sections,
    assumptions: [
      `Interest calculations use monthly reducing balance based on current annual rate (${loan.annualInterestRate}%).`,
      `Future remaining interest and payoff dates assume current scheduled EMI (${formatMoney(loan.emiAmount)}) continues unchanged.`,
    ],
  });
};

/**
 * Universal Loan Report Adapter Resolver
 */
export const getLoanReportAdapter = (reportType, loan, payments = []) => {
  switch (String(reportType).toLowerCase()) {
    case 'summary':
    case 'loan_summary':
      return buildLoanSummaryReport({ loan, payments });
    case 'statement':
    case 'loan_statement':
    case 'full_statement':
      return buildLoanStatementReport({ loan, payments });
    case 'insights':
    case 'loan_insights':
      return buildLoanInsightsReport({ loan, payments });
    default:
      return buildLoanSummaryReport({ loan, payments });
  }
};

export default getLoanReportAdapter;

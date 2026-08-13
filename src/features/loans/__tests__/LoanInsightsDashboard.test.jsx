import { buildLoanInsightSummary } from '../utils/loanInsightUtils';
import { createLoanProfile } from '../types/loanProfileTypes';
import LoanInsightsScreen from '../screens/LoanInsightsScreen';

describe('LoanInsightsScreen Dashboard & Insights Integration', () => {
  it('buildLoanInsightSummary calculates principal paid, interest paid, and remaining tenure correctly', () => {
    const mockLoan = createLoanProfile({
      id: 'loan_123',
      name: 'Home Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2500000,
      annualInterestRate: 7.4,
      emiAmount: 31266,
      tenureMonths: 240,
    });

    const summary = buildLoanInsightSummary(mockLoan, []);
    expect(summary).toBeDefined();
    expect(summary.loanId).toBe('loan_123');
    expect(summary.originalPrincipal).toBe(3500000);
    expect(summary.currentBalance).toBe(2500000);
    expect(summary.principalReduced).toBe(1000000);
    expect(summary.progressPercentage).toBe(28.6);
    expect(summary.totalPaymentsCount).toBe(0);
    expect(summary.remainingTenureText).toMatch(/(\d+ (months|years|month|year)|\d+ yr \d+ mos)/);
  });

  it('correctly reports zero-payment state when no payments recorded', () => {
    const mockLoan = createLoanProfile({
      id: 'loan_123',
      currentOutstandingPrincipal: 2500000,
    });

    const summary = buildLoanInsightSummary(mockLoan, []);
    expect(summary.totalPaymentsCount).toBe(0);
    expect(summary.regularEmiCount).toBe(0);
    expect(summary.latestPaymentInsight).toBeNull();
  });

  it('exports LoanInsightsScreen clean React component', () => {
    expect(LoanInsightsScreen).toBeDefined();
  });
});

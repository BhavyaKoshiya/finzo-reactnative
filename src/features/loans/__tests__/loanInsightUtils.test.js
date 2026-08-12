import {
  calculatePrincipalProgress,
  calculateRecordedPaymentSummary,
  calculateInterestAndPrincipalPaid,
  calculateRemainingInterestAndPayoff,
  calculatePrepaymentImpact,
  buildLoanInsightSummary,
} from '../utils/loanInsightUtils';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';

describe('loanInsightUtils', () => {
  const mockLoan = {
    id: 'loan_123',
    name: 'Home Loan',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 726316,
    annualInterestRate: 8.5,
    emiAmount: 31266,
    tenureMonths: 120,
    loanStartDate: '2024-01-01',
    balanceSource: BALANCE_SOURCES.ESTIMATED,
    status: 'active',
  };

  const mockPayments = [
    {
      id: 'p1',
      loanId: 'loan_123',
      paymentAmount: 31266,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      paymentDate: '2024-02-01',
      estimatedPrincipal: 24182,
      estimatedInterest: 7084,
      outstandingAfter: 975818,
    },
    {
      id: 'p2',
      loanId: 'loan_123',
      paymentAmount: 31266,
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      paymentDate: '2024-03-01',
      actualPrincipal: 24353,
      actualInterest: 6913,
      balanceSource: BALANCE_SOURCES.BANK_CONFIRMED,
      actualClosingBalance: 951465,
    },
    {
      id: 'p3',
      loanId: 'loan_123',
      paymentAmount: 100000,
      paymentType: PAYMENT_TYPES.PREPAYMENT,
      paymentDate: '2024-03-15',
      estimatedPrincipal: 100000,
      estimatedInterest: 0,
      outstandingAfter: 851465,
    },
    {
      id: 'p4',
      loanId: 'loan_123',
      paymentAmount: 0,
      paymentType: PAYMENT_TYPES.BALANCE_CORRECTION,
      isBalanceCorrection: true,
      paymentDate: '2024-04-01',
      actualClosingBalance: 726316,
    },
  ];

  describe('calculatePrincipalProgress', () => {
    it('calculates clamped principal progress percentage', () => {
      const result = calculatePrincipalProgress(mockLoan, mockPayments);
      expect(result.originalPrincipal).toBe(1000000);
      expect(result.currentBalance).toBe(726316);
      expect(result.principalReduced).toBe(273684);
      expect(result.progressPercentage).toBe(27.4);
    });

    it('clamps progress to 100% for fully paid loan', () => {
      const paidLoan = { ...mockLoan, currentOutstandingPrincipal: 0 };
      const result = calculatePrincipalProgress(paidLoan, []);
      expect(result.progressPercentage).toBe(100);
      expect(result.principalReduced).toBe(1000000);
    });

    it('handles zero original principal gracefully', () => {
      const zeroLoan = { ...mockLoan, originalPrincipal: 0, currentOutstandingPrincipal: 0 };
      const result = calculatePrincipalProgress(zeroLoan, []);
      expect(result.progressPercentage).toBe(100);
    });
  });

  describe('calculateRecordedPaymentSummary', () => {
    it('summarizes valid payments and excludes balance corrections', () => {
      const summary = calculateRecordedPaymentSummary(mockPayments);
      expect(summary.totalPayments).toBe(3);
      expect(summary.regularEmiCount).toBe(2);
      expect(summary.prepaymentCount).toBe(1);
      expect(summary.customPaymentCount).toBe(0);
      expect(summary.totalAmountPaid).toBe(162532);
      expect(summary.totalPrepaymentAmount).toBe(100000);
    });

    it('returns zeroes for empty payments', () => {
      const summary = calculateRecordedPaymentSummary([]);
      expect(summary.totalPayments).toBe(0);
      expect(summary.totalAmountPaid).toBe(0);
    });
  });

  describe('calculateInterestAndPrincipalPaid', () => {
    it('prioritizes bank confirmed actual values over estimates when provided', () => {
      const breakdown = calculateInterestAndPrincipalPaid(mockLoan, mockPayments);
      // p1 est: prin 24182, int 7084
      // p2 act: prin 24353, int 6913
      // p3 est: prin 100000, int 0
      // sum prin: 24182 + 24353 + 100000 = 148535
      // sum int: 7084 + 6913 + 0 = 13997
      expect(breakdown.principalPaid).toBe(148535);
      expect(breakdown.interestPaid).toBe(13997);
      expect(breakdown.hasBankConfirmedBreakdowns).toBe(true);
    });

    it('preserves historical snapshot values even if loan rate changes later', () => {
      const modifiedRateLoan = { ...mockLoan, annualInterestRate: 18.0 };
      const breakdown = calculateInterestAndPrincipalPaid(modifiedRateLoan, mockPayments);
      expect(breakdown.principalPaid).toBe(148535);
      expect(breakdown.interestPaid).toBe(13997);
    });
  });

  describe('calculateRemainingInterestAndPayoff', () => {
    it('calculates estimated payoff date and remaining interest for active balance', () => {
      const result = calculateRemainingInterestAndPayoff(mockLoan);
      expect(result.remainingTenureMonths).toBeGreaterThan(0);
      expect(result.estimatedRemainingInterest).toBeGreaterThan(0);
      expect(result.formattedPayoffDate).not.toBe('Paid Off');
      expect(result.isIndefinite).toBe(false);
    });

    it('returns zero remaining interest and Paid Off for zero balance', () => {
      const paidLoan = { ...mockLoan, currentOutstandingPrincipal: 0 };
      const result = calculateRemainingInterestAndPayoff(paidLoan);
      expect(result.estimatedRemainingInterest).toBe(0);
      expect(result.remainingTenureMonths).toBe(0);
      expect(result.formattedPayoffDate).toBe('Paid Off');
    });

    it('detects EMI too low to cover interest', () => {
      const badEmiLoan = { ...mockLoan, emiAmount: 1000, annualInterestRate: 12.0, currentOutstandingPrincipal: 500000 };
      const result = calculateRemainingInterestAndPayoff(badEmiLoan);
      expect(result.isIndefinite).toBe(true);
      expect(result.formattedPayoffDate).toBe('EMI too low to cover interest');
    });
  });

  describe('calculatePrepaymentImpact', () => {
    it('calculates total prepayments and estimated interest avoided', () => {
      const impact = calculatePrepaymentImpact(mockLoan, mockPayments);
      expect(impact.totalPrepaymentsMade).toBe(100000);
      expect(impact.prepaymentCount).toBe(1);
      expect(impact.estimatedInterestAvoided).toBeGreaterThan(0);
    });

    it('returns zero for loans without prepayments', () => {
      const noPrepay = mockPayments.filter((p) => p.paymentType !== PAYMENT_TYPES.PREPAYMENT);
      const impact = calculatePrepaymentImpact(mockLoan, noPrepay);
      expect(impact.totalPrepaymentsMade).toBe(0);
      expect(impact.estimatedInterestAvoided).toBe(0);
    });
  });

  describe('buildLoanInsightSummary', () => {
    it('assembles a complete, immutable loan insight summary object', () => {
      const summary = buildLoanInsightSummary(mockLoan, mockPayments);
      expect(summary.loanId).toBe('loan_123');
      expect(summary.loanName).toBe('Home Loan');
      expect(summary.progressPercentage).toBe(27.4);
      expect(summary.totalPaymentsCount).toBe(3);
      expect(summary.totalAmountPaid).toBe(162532);
      expect(summary.prepaymentImpact.totalPrepaymentsMade).toBe(100000);
      expect(summary.latestPaymentInsight).not.toBeNull();
      expect(summary.historySeries.balanceHistory.length).toBeGreaterThan(0);
      expect(summary.isPaidOff).toBe(false);
    });

    it('isolates payments belonging exclusively to the target loanId', () => {
      const otherLoan = { ...mockLoan, id: 'loan_999' };
      const summary = buildLoanInsightSummary(otherLoan, mockPayments);
      expect(summary.totalPaymentsCount).toBe(0);
      expect(summary.totalAmountPaid).toBe(0);
    });

    it('does not mutate original loan or payment input objects', () => {
      const loanCopy = JSON.parse(JSON.stringify(mockLoan));
      const paymentsCopy = JSON.parse(JSON.stringify(mockPayments));
      buildLoanInsightSummary(mockLoan, mockPayments);
      expect(mockLoan).toEqual(loanCopy);
      expect(mockPayments).toEqual(paymentsCopy);
    });
  });
});

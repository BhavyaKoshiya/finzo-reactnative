import {
  buildLoanSummaryReport,
  buildLoanStatementReport,
  buildLoanInsightsReport,
  getLoanReportAdapter,
} from '../adapters/loanReportAdapters';
import { PAYMENT_TYPES } from '../../loans/constants/loanPaymentConstants';

describe('Loan Report Adapters', () => {
  const sampleLoanA = {
    id: 'loan_a',
    name: 'Home Loan A',
    loanType: 'home_loan',
    lenderName: 'HDFC Bank',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 900000,
    annualInterestRate: 8.5,
    emiAmount: 12000,
    originalTenureMonths: 120,
    status: 'active',
    loanStartDate: '2026-01-01',
  };

  const sampleLoanB = {
    id: 'loan_b',
    name: 'Car Loan B',
    loanType: 'car_loan',
    lenderName: 'SBI',
    originalPrincipal: 500000,
    currentOutstandingPrincipal: 400000,
    annualInterestRate: 10,
    emiAmount: 10000,
    originalTenureMonths: 60,
    status: 'active',
  };

  const samplePaymentsLoanA = [
    {
      id: 'pay_1',
      loanId: 'loan_a',
      paymentDate: '2026-02-05',
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      paymentAmount: 12000,
      openingBalance: 1000000,
      actualPrincipal: 4917,
      actualInterest: 7083,
      closingBalance: 995083,
      calculationSnapshot: { estimatedPrincipal: 4917, estimatedInterest: 7083 },
    },
    {
      id: 'pay_2',
      loanId: 'loan_a',
      paymentDate: '2026-03-05',
      paymentType: PAYMENT_TYPES.PREPAYMENT,
      paymentAmount: 50000,
      openingBalance: 995083,
      actualPrincipal: 50000,
      actualInterest: 0,
      closingBalance: 945083,
    },
    {
      id: 'pay_3',
      loanId: 'loan_a',
      paymentDate: '2026-04-05',
      paymentType: PAYMENT_TYPES.BALANCE_CORRECTION,
      paymentAmount: 900000,
      openingBalance: 945083,
      actualPrincipal: 45083,
      actualInterest: 0,
      closingBalance: 900000,
    },
  ];

  const samplePaymentsLoanB = [
    {
      id: 'pay_b1',
      loanId: 'loan_b',
      paymentDate: '2026-02-01',
      paymentType: PAYMENT_TYPES.REGULAR_EMI,
      paymentAmount: 10000,
      openingBalance: 500000,
      actualPrincipal: 5833,
      actualInterest: 4167,
      closingBalance: 494167,
    },
  ];

  describe('Loan Summary Report', () => {
    it('generates Loan Summary report with accurate current position', () => {
      const report = buildLoanSummaryReport({ loan: sampleLoanA, payments: samplePaymentsLoanA });

      expect(report.title).toBe('Loan Summary — Home Loan A');
      expect(report.reportType).toBe('loan_summary');
      expect(report.summaryCards.find((c) => c.label === 'Original Principal').value).toBe('₹10,00,000');
      expect(report.summaryCards.find((c) => c.label === 'Current Balance').value).toBe('₹9,00,000');
    });
  });

  describe('Loan Statement Report & Historical Snapshots', () => {
    it('generates Loan Statement report containing full payment ledger', () => {
      const report = buildLoanStatementReport({ loan: sampleLoanA, payments: samplePaymentsLoanA });

      expect(report.reportType).toBe('loan_statement');
      const statementSection = report.sections.find((s) => s.title === 'Payment Ledger & Transaction History');
      expect(statementSection).toBeDefined();
      expect(statementSection.tableRows.length).toBe(3);

      // Check badge tags for payment types
      const row1 = statementSection.tableRows[0];
      expect(row1[1].text).toBe('EMI');

      const row2 = statementSection.tableRows[1];
      expect(row2[1].text).toBe('Prepayment');

      const row3 = statementSection.tableRows[2];
      expect(row3[1].text).toBe('Correction');
    });

    it('preserves stored calculationSnapshots even if loan interest rate changes', () => {
      // Modify loan rate on profile fixture
      const modifiedLoan = { ...sampleLoanA, annualInterestRate: 18.0 };
      const report = buildLoanStatementReport({ loan: modifiedLoan, payments: samplePaymentsLoanA });

      const statementSection = report.sections.find((s) => s.title === 'Payment Ledger & Transaction History');
      const row1 = statementSection.tableRows[0];

      // Historical interest and principal from snapshot must remain ₹7,083 and ₹4,917
      expect(row1[4]).toBe('₹7,083');
      expect(row1[5]).toBe('₹4,917');
    });

    it('isolates Loan A payments from Loan B payments', () => {
      const reportA = buildLoanStatementReport({ loan: sampleLoanA, payments: samplePaymentsLoanA });
      const reportB = buildLoanStatementReport({ loan: sampleLoanB, payments: samplePaymentsLoanB });

      const sectionA = reportA.sections.find((s) => s.title === 'Payment Ledger & Transaction History');
      const sectionB = reportB.sections.find((s) => s.title === 'Payment Ledger & Transaction History');

      expect(sectionA.tableRows.length).toBe(3);
      expect(sectionB.tableRows.length).toBe(1);
    });
  });

  describe('Loan Insights Report & Paid-Off Loans', () => {
    it('generates Loan Insights report with prepayment impact', () => {
      const report = buildLoanInsightsReport({ loan: sampleLoanA, payments: samplePaymentsLoanA });

      expect(report.reportType).toBe('loan_insights');
      const impactSec = report.sections.find((s) => s.title === 'Prepayment Impact & Savings');
      expect(impactSec).toBeDefined();
      expect(impactSec.items.find((i) => i.label === 'Total Prepayments Made').value).toContain('₹50,000');
    });

    it('handles paid-off loan without crashing or displaying invalid future remaining interest', () => {
      const paidLoan = { ...sampleLoanA, currentOutstandingPrincipal: 0 };
      const report = buildLoanInsightsReport({ loan: paidLoan, payments: [] });

      expect(report.summaryCards.find((c) => c.label === 'Estimated Payoff').value).toBe('Paid Off');
    });
  });

  describe('Universal Resolver', () => {
    it('resolves loan report adapter by type', () => {
      const report = getLoanReportAdapter('statement', sampleLoanA, samplePaymentsLoanA);
      expect(report.reportType).toBe('loan_statement');
    });
  });
});

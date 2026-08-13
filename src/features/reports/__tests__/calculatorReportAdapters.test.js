import {
  getCalculatorReportAdapter,
  buildEmiReport,
  buildSipReport,
  buildFdReport,
  buildRdReport,
  buildCagrReport,
  buildRoiReport,
  buildGstReport,
  buildSimpleInterestReport,
  buildCompoundInterestReport,
  buildPercentageReport,
} from '../adapters/calculatorReportAdapters';

describe('Calculator Report Adapters', () => {
  describe('EMI / Loan Calculator Adapter', () => {
    it('generates a valid EMI report model with amortization schedule', () => {
      const inputValues = { principal: 1000000, annualInterestRate: 8.5, tenureMonths: 60 };
      const results = { monthlyEMI: 20517, totalInterest: 230992, totalPayment: 1230992 };

      const report = buildEmiReport({ inputValues, results, title: 'Home Loan EMI' });

      expect(report.title).toBe('EMI Calculation Report');
      expect(report.subtitle).toBe('Home Loan EMI');
      expect(report.calculatorType).toBe('emi');
      expect(report.summaryCards.length).toBe(4);
      expect(report.sections.length).toBeGreaterThanOrEqual(2);

      // Check amortization schedule section
      const schedSection = report.sections.find((s) => s.title === 'Amortization Installment Schedule');
      expect(schedSection).toBeDefined();
      expect(schedSection.tableRows.length).toBe(60);
      expect(schedSection.tableHeaders).toEqual(['No.', 'Opening Bal', 'EMI', 'Interest', 'Principal', 'Closing Bal']);
    });

    it('handles large 360-month amortization schedule without crashing', () => {
      const inputValues = { principal: 5000000, annualInterestRate: 9, tenureMonths: 360 };
      const results = { monthlyEMI: 40231, totalInterest: 9483200, totalPayment: 14483200 };

      const report = buildEmiReport({ inputValues, results });

      const schedSection = report.sections.find((s) => s.title === 'Amortization Installment Schedule');
      expect(schedSection).toBeDefined();
      expect(schedSection.tableRows.length).toBe(360);
    });
  });

  describe('SIP Calculator Adapter', () => {
    it('generates SIP report with growth table and estimated return tags', () => {
      const inputValues = { monthlyInvestment: 10000, expectedReturnRate: 12, tenureYears: 5 };
      const results = {
        totalInvestment: 600000,
        estimatedReturns: 224864,
        futureValue: 824864,
        yearlyBreakdown: [
          { year: 1, totalInvested: 120000, estimatedReturns: 8093, futureValue: 128093 },
          { year: 5, totalInvested: 600000, estimatedReturns: 224864, futureValue: 824864 },
        ],
      };

      const report = buildSipReport({ inputValues, results });

      expect(report.calculatorType).toBe('sip');
      expect(report.summaryCards.find((c) => c.label === 'Monthly SIP').value).toBe('₹10,000');
      const tableSec = report.sections.find((s) => s.title === 'Estimated Yearly Growth Table');
      expect(tableSec).toBeDefined();
      expect(tableSec.tableRows.length).toBe(2);
    });
  });

  describe('FD & RD Adapters', () => {
    it('generates FD report model', () => {
      const report = buildFdReport({
        inputValues: { principal: 100000, annualInterestRate: 7.5, tenureYears: 3, compoundingFrequency: 'quarterly' },
        results: { maturityAmount: 124972, interestEarned: 24972 },
      });

      expect(report.calculatorType).toBe('fd');
      expect(report.summaryCards.find((c) => c.label === 'Principal Deposit').value).toBe('₹1,00,000');
    });

    it('generates RD report model', () => {
      const report = buildRdReport({
        inputValues: { monthlyDeposit: 5000, annualInterestRate: 7, tenureYears: 2 },
        results: { totalDeposit: 120000, interestEarned: 9024, maturityAmount: 129024 },
      });

      expect(report.calculatorType).toBe('rd');
      expect(report.summaryCards.find((c) => c.label === 'Monthly Deposit').value).toBe('₹5,000');
    });
  });

  describe('CAGR & ROI Adapters', () => {
    it('generates CAGR report model', () => {
      const report = buildCagrReport({
        inputValues: { beginningValue: 100000, endingValue: 175000, tenureYears: 5 },
        results: { cagr: 11.84, absoluteGain: 75000 },
      });

      expect(report.calculatorType).toBe('cagr');
      expect(report.summaryCards.find((c) => c.label === 'CAGR Rate').value).toBe('11.84%');
    });

    it('handles positive and negative ROI correctly', () => {
      const positiveReport = buildRoiReport({
        inputValues: { initialInvestment: 100000, finalValue: 130000 },
        results: { roi: 30, netProfit: 30000 },
      });
      expect(positiveReport.summaryCards.find((c) => c.label === 'ROI %').color).toBe('#2563EB');

      const negativeReport = buildRoiReport({
        inputValues: { initialInvestment: 100000, finalValue: 80000 },
        results: { roi: -20, netProfit: -20000 },
      });
      expect(negativeReport.summaryCards.find((c) => c.label === 'ROI %').color).toBe('#EF4444');
    });
  });

  describe('GST Adapter', () => {
    it('handles inclusive and exclusive GST modes', () => {
      const exclusiveReport = buildGstReport({
        inputValues: { amount: 1000, gstRate: 18, gstMode: 'exclusive' },
        results: { baseAmount: 1000, gstAmount: 180, totalAmount: 1180 },
      });
      expect(exclusiveReport.assumptions[0]).toContain('added onto the base net amount');

      const inclusiveReport = buildGstReport({
        inputValues: { amount: 1180, gstRate: 18, gstMode: 'inclusive' },
        results: { baseAmount: 1000, gstAmount: 180, totalAmount: 1180 },
      });
      expect(inclusiveReport.assumptions[0]).toContain('extracted from the inclusive gross total');
    });
  });

  describe('Simple & Compound Interest Adapters', () => {
    it('generates Simple Interest report', () => {
      const report = buildSimpleInterestReport({
        inputValues: { principal: 50000, annualInterestRate: 8, tenureYears: 3 },
        results: { interest: 12000, totalAmount: 62000 },
      });
      expect(report.calculatorType).toBe('simple_interest');
    });

    it('generates Compound Interest report', () => {
      const report = buildCompoundInterestReport({
        inputValues: { principal: 50000, annualInterestRate: 8, tenureYears: 3, compoundingFrequency: 'half-yearly' },
        results: { interestEarned: 13266, maturityAmount: 63266 },
      });
      expect(report.calculatorType).toBe('compound_interest');
    });
  });

  describe('Percentage Adapter', () => {
    it('adapts to percentage_of mode', () => {
      const report = buildPercentageReport({
        inputValues: { mode: 'percentage_of', percentage: 15, baseValue: 2000 },
        results: { result: 300 },
      });
      expect(report.sections[0].title).toBe('Percentage Of Value');
    });

    it('adapts to percentage_change mode', () => {
      const report = buildPercentageReport({
        inputValues: { mode: 'percentage_change', originalValue: 100, newValue: 125 },
        results: { change: 25, percentageChange: 25 },
      });
      expect(report.sections[0].title).toBe('Percentage Change Breakdown');
    });
  });

  describe('Universal Resolver', () => {
    it('resolves calculator adapters by ID', () => {
      const report = getCalculatorReportAdapter('sip', { monthlyInvestment: 5000 }, { futureValue: 50000 });
      expect(report.calculatorType).toBe('sip');
    });
  });
});

import escapeHtml from '../utils/htmlEscape';
import buildShareText from '../utils/shareTextBuilder';
import { getExportModelForCalculator } from '../adapters/calculationExportAdapters';
import buildCalculationPdfHtml from '../pdf/pdfHtmlBuilder';

describe('Phase 11 — Share & PDF Export Subsystem Tests', () => {
  describe('HTML Escaping Utility', () => {
    test('should escape special HTML characters safely', () => {
      expect(escapeHtml('My <Home> Loan & "Special"')).toBe('My &lt;Home&gt; Loan &amp; &quot;Special&quot;');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(123)).toBe('123');
    });
  });

  describe('Share Text Builder', () => {
    test('should build clean share text from export model', () => {
      const model = {
        title: 'Home Loan EMI',
        customTitle: 'My Dream House',
        primaryResult: { label: 'Monthly EMI', value: '₹43,391', supportingText: 'per month' },
        inputs: [{ label: 'Loan Amount', value: '₹50,00,000' }],
        results: [{ label: 'Total Payment', value: '₹1,04,13,840' }],
      };

      const shareText = buildShareText(model);

      expect(shareText).toContain('My Dream House');
      expect(shareText).toContain('Monthly EMI: ₹43,391');
      expect(shareText).toContain('Loan Amount: ₹50,00,000');
      expect(shareText).toContain('Calculated with Finzo');
    });
  });

  describe('Calculator Export Adapters', () => {
    test('EMI / Loan adapter should generate Quick and Detailed models', () => {
      const inputs = { loanAmount: '5000000', interestRate: '8.5', tenureValue: '20', tenureUnit: 'years' };
      const result = { monthlyEMI: 43391, totalInterest: 5413840, totalPayment: 10413840, principal: 5000000 };

      // Quick Mode
      const quickModel = getExportModelForCalculator('home-loan-emi', inputs, result, { mode: 'quick' });
      expect(quickModel.title).toContain('Home Loan');
      expect(quickModel.primaryResult.value).toContain('43,391');
      expect(quickModel.sections).toHaveLength(0);

      // Detailed Mode
      const detailedModel = getExportModelForCalculator('home-loan-emi', inputs, result, { mode: 'detailed' });
      expect(detailedModel.sections.length).toBeGreaterThan(0);
      expect(detailedModel.sections[0].title).toBe('Yearly Repayment Summary');
      expect(detailedModel.sections[1].title).toBe('Monthly Amortization Schedule');
    });

    test('SIP adapter should generate yearly projection table in detailed mode', () => {
      const inputs = { monthlyInvestment: '15000', annualReturnRate: '12', tenureValue: '10', tenureUnit: 'years' };
      const result = { maturityAmount: 3485086, totalInvested: 1800000, estimatedReturns: 1685086 };

      const detailedModel = getExportModelForCalculator('sip', inputs, result, { mode: 'detailed' });
      expect(detailedModel.sections).toHaveLength(1);
      expect(detailedModel.sections[0].title).toBe('Year-by-Year Growth Projection');
      expect(detailedModel.sections[0].rows).toHaveLength(10);
    });

    test('FD adapter should generate compounding schedule table', () => {
      const inputs = { principal: '500000', annualInterestRate: '7.5', tenureValue: '3', compoundingFrequency: 'quarterly' };
      const result = { maturityAmount: 624858, interestEarned: 124858, principal: 500000 };

      const detailedModel = getExportModelForCalculator('fd', inputs, result, { mode: 'detailed' });
      expect(detailedModel.sections).toHaveLength(1);
      expect(detailedModel.sections[0].title).toBe('Compounding Growth Schedule');
    });

    test('RD adapter should generate monthly accumulation schedule', () => {
      const inputs = { monthlyDeposit: '10000', annualInterestRate: '7.0', tenureValue: '2', tenureUnit: 'years' };
      const result = { maturityAmount: 258000, totalDeposited: 240000, interestEarned: 18000 };

      const detailedModel = getExportModelForCalculator('rd', inputs, result, { mode: 'detailed' });
      expect(detailedModel.sections).toHaveLength(1);
      expect(detailedModel.sections[0].title).toBe('Monthly Accumulation Schedule');
    });

    test('CAGR adapter should generate growth trajectory table', () => {
      const inputs = { initialValue: '100000', finalValue: '200000', tenureValue: '5', tenureUnit: 'years' };
      const result = { cagr: 14.87, absoluteGain: 100000 };

      const detailedModel = getExportModelForCalculator('cagr', inputs, result, { mode: 'detailed' });
      expect(detailedModel.sections).toHaveLength(1);
      expect(detailedModel.sections[0].title).toBe('CAGR Growth Trajectory');
    });

    test('GST adapter should generate tax breakdown in exclusive and inclusive modes', () => {
      const inputs = { amount: '100000', gstRate: '18', mode: 'exclusive' };
      const result = { baseAmount: 100000, gstAmount: 18000, totalAmount: 118000 };

      const model = getExportModelForCalculator('gst', inputs, result);
      expect(model.primaryResult.value).toContain('1,18,000');
      expect(model.inputs[2].value).toContain('Exclusive');
    });
  });

  describe('PDF HTML Builder', () => {
    test('should build complete escaped HTML string for Quick and Detailed reports', () => {
      const model = getExportModelForCalculator(
        'home-loan-emi',
        { loanAmount: '1000000', interestRate: '8.5', tenureValue: '5', tenureUnit: 'years' },
        { monthlyEMI: 20517, totalInterest: 231020, totalPayment: 1231020, principal: 1000000 },
        { customTitle: 'My <Test> Loan', mode: 'detailed' }
      );

      const html = buildCalculationPdfHtml(model, 'detailed');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('FINZO');
      expect(html).toContain('My &lt;Test&gt; Loan');
      expect(html).toContain('CALCULATION INPUTS');
      expect(html).toContain('Yearly Repayment Summary');
      expect(html).toContain('Monthly Amortization Schedule');
      expect(html).toContain('Calculated with Finzo');
    });
  });
});

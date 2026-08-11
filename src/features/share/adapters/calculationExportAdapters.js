import createCalculationExportModel from '../models/calculationExportModel';
import { formatCurrency, formatPercentage } from '../../../utils/financeFormatters';
import { getCalculatorById } from '../../../calculators';
import { calculateAmortization } from '../../../calculations/emi';
import { calculateSIPYearlyProjection } from '../../../calculations/sip/calculateSIP';
import { calculateFDGrowthSchedule } from '../../../calculations/fd/calculateFD';
import { calculateRDGrowthSchedule } from '../../../calculations/rd/calculateRD';

const formatDuration = (val, unit = 'years') => {
  if (!val) return `0 ${unit}`;
  return `${val} ${String(unit).charAt(0).toUpperCase() + String(unit).slice(1)}`;
};

/**
 * Transforms any calculator result & input set into a unified ExportModel.
 * @param {string} calculatorId
 * @param {Object} inputs
 * @param {Object} result
 * @param {Object} options - { customTitle, date, mode: 'quick' | 'detailed' }
 */
export const getExportModelForCalculator = (
  calculatorId,
  inputs = {},
  result = {},
  options = {}
) => {
  const calcMetadata = getCalculatorById(calculatorId);
  const title = calcMetadata?.name || 'Calculator';
  const customTitle = options.customTitle || inputs.savedTitle || '';
  const date = options.date || inputs.savedAt || inputs.updatedAt || new Date().toISOString();
  const reportMode = options.mode || 'quick';

  // 1. LOAN FAMILY (Home, Personal, Car, Education, Business)
  if (['home-loan-emi', 'personal-loan-emi', 'car-loan-emi', 'education-loan-emi', 'business-loan-emi', 'loan-emi'].includes(calculatorId)) {
    const loanAmount = inputs.loanAmount || result.principal || 0;
    const rate = inputs.interestRate || result.annualInterestRate || 0;
    const tenureValue = inputs.tenureValue || (result.tenureMonths ? result.tenureMonths / 12 : 0);
    const tenureUnit = inputs.tenureUnit || 'years';

    const inputList = [
      { label: 'Loan Amount', value: formatCurrency(loanAmount) },
      { label: 'Interest Rate', value: formatPercentage(rate) },
      { label: 'Loan Tenure', value: formatDuration(tenureValue, tenureUnit) },
    ];

    const primaryResult = {
      label: 'Monthly EMI',
      value: formatCurrency(result.monthlyEMI || 0),
      supportingText: 'per month',
    };

    const secondaryResults = [
      { label: 'Total Interest Payable', value: formatCurrency(result.totalInterest || 0) },
      { label: 'Total Payment', value: formatCurrency(result.totalPayment || 0) },
      { label: 'Principal Amount', value: formatCurrency(result.principal || loanAmount) },
    ];

    const sections = [];

    if (reportMode === 'detailed') {
      let tenureMonths = parseFloat(tenureValue);
      if (!isNaN(tenureMonths) && tenureUnit === 'years') tenureMonths *= 12;

      const scheduleResult = calculateAmortization(loanAmount, rate, tenureMonths);
      if (scheduleResult.success && Array.isArray(scheduleResult.data.schedule)) {
        const schedule = scheduleResult.data.schedule;

        // Yearly Repayment Summary
        const yearlyRows = [];
        let currentYear = 1;
        let yrPrincipal = 0;
        let yrInterest = 0;
        let yrTotal = 0;

        schedule.forEach((row, idx) => {
          const principalPaid = row.principalComponent ?? row.principalPaid ?? 0;
          const interestPaid = row.interestComponent ?? row.interestPaid ?? 0;
          const emiPaid = row.payment ?? row.emi ?? 0;

          yrPrincipal += principalPaid;
          yrInterest += interestPaid;
          yrTotal += emiPaid;

          if (row.month % 12 === 0 || idx === schedule.length - 1) {
            yearlyRows.push([
              `Year ${currentYear}`,
              formatCurrency(yrPrincipal),
              formatCurrency(yrInterest),
              formatCurrency(yrTotal),
              formatCurrency(row.closingBalance),
            ]);
            currentYear++;
            yrPrincipal = 0;
            yrInterest = 0;
            yrTotal = 0;
          }
        });

        sections.push({
          type: 'table',
          title: 'Yearly Repayment Summary',
          headers: ['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Closing Balance'],
          alignments: ['left', 'right', 'right', 'right', 'right'],
          rows: yearlyRows,
        });

        // Complete Monthly Amortization Schedule
        const monthlyRows = schedule.map((row) => [
          String(row.month),
          formatCurrency(row.openingBalance),
          formatCurrency(row.payment ?? row.emi ?? 0),
          formatCurrency(row.principalComponent ?? row.principalPaid ?? 0),
          formatCurrency(row.interestComponent ?? row.interestPaid ?? 0),
          formatCurrency(row.closingBalance),
        ]);

        sections.push({
          type: 'table',
          title: 'Monthly Amortization Schedule',
          headers: ['Month', 'Opening Balance', 'EMI', 'Principal', 'Interest', 'Closing Balance'],
          alignments: ['center', 'right', 'right', 'right', 'right', 'right'],
          rows: monthlyRows,
        });
      }
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
      sections,
    });
  }

  // 2. SIP CALCULATOR
  if (calculatorId === 'sip') {
    const monthlyInv = inputs.monthlyInvestment || result.monthlyInvestment || 0;
    const rate = inputs.annualReturnRate || result.annualReturnRate || 0;
    const tenureValue = inputs.tenureValue || (result.tenureMonths ? result.tenureMonths / 12 : 0);
    const tenureUnit = inputs.tenureUnit || 'years';

    const inputList = [
      { label: 'Monthly Investment', value: formatCurrency(monthlyInv) },
      { label: 'Expected Return Rate', value: formatPercentage(rate) },
      { label: 'Investment Duration', value: formatDuration(tenureValue, tenureUnit) },
    ];

    const primaryResult = {
      label: 'Expected Future Value',
      value: formatCurrency(result.maturityAmount || 0),
      supportingText: 'total estimated portfolio',
    };

    const secondaryResults = [
      { label: 'Total Invested Amount', value: formatCurrency(result.totalInvested || 0) },
      { label: 'Estimated Wealth Gain', value: formatCurrency(result.estimatedReturns || 0) },
    ];

    const sections = [];

    if (reportMode === 'detailed') {
      let tenureMonths = parseFloat(tenureValue);
      if (!isNaN(tenureMonths) && tenureUnit === 'years') tenureMonths *= 12;

      const projection = calculateSIPYearlyProjection(monthlyInv, rate, tenureMonths);
      if (projection.length > 0) {
        const rows = projection.map((p) => [
          `Year ${p.year}`,
          formatCurrency(p.totalInvested),
          formatCurrency(p.estimatedReturns),
          formatCurrency(p.maturityAmount),
        ]);

        sections.push({
          type: 'table',
          title: 'Year-by-Year Growth Projection',
          headers: ['Year', 'Total Invested', 'Estimated Returns', 'Portfolio Value'],
          alignments: ['left', 'right', 'right', 'right'],
          rows,
        });
      }
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
      sections,
    });
  }

  // 3. FD CALCULATOR
  if (calculatorId === 'fd') {
    const principal = inputs.principal || result.principal || 0;
    const rate = inputs.annualInterestRate || result.annualInterestRate || 0;
    const tenureValue = inputs.tenureValue || result.tenureYears || 0;
    const tenureUnit = inputs.tenureUnit || 'years';
    const frequency = inputs.compoundingFrequency || result.compoundingFrequency || 'quarterly';

    const inputList = [
      { label: 'Deposit Principal', value: formatCurrency(principal) },
      { label: 'Interest Rate', value: formatPercentage(rate) },
      { label: 'Deposit Tenure', value: formatDuration(tenureValue, tenureUnit) },
      { label: 'Compounding Frequency', value: String(frequency).toUpperCase() },
    ];

    const primaryResult = {
      label: 'Maturity Amount',
      value: formatCurrency(result.maturityAmount || 0),
      supportingText: 'total value at maturity',
    };

    const secondaryResults = [
      { label: 'Interest Earned', value: formatCurrency(result.interestEarned || 0) },
      { label: 'Principal Deposited', value: formatCurrency(result.principal || principal) },
    ];

    const sections = [];

    if (reportMode === 'detailed') {
      let tenureYears = parseFloat(tenureValue);
      if (!isNaN(tenureYears) && tenureUnit === 'months') tenureYears /= 12;

      const schedule = calculateFDGrowthSchedule(principal, rate, tenureYears, frequency);
      if (schedule.length > 0) {
        const rows = schedule.map((s) => [
          `Period ${s.period} (${s.tenureYears} yrs)`,
          formatCurrency(s.principal),
          formatCurrency(s.interestEarned),
          formatCurrency(s.maturityAmount),
        ]);

        sections.push({
          type: 'table',
          title: 'Compounding Growth Schedule',
          headers: ['Period', 'Principal', 'Interest Accumulated', 'Maturity Value'],
          alignments: ['left', 'right', 'right', 'right'],
          rows,
        });
      }
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
      sections,
    });
  }

  // 4. RD CALCULATOR
  if (calculatorId === 'rd') {
    const monthlyDeposit = inputs.monthlyDeposit || result.monthlyDeposit || 0;
    const rate = inputs.annualInterestRate || result.annualInterestRate || 0;
    const tenureValue = inputs.tenureValue || (result.tenureMonths ? result.tenureMonths / 12 : 0);
    const tenureUnit = inputs.tenureUnit || 'years';

    const inputList = [
      { label: 'Monthly Deposit', value: formatCurrency(monthlyDeposit) },
      { label: 'Interest Rate', value: formatPercentage(rate) },
      { label: 'Tenure', value: formatDuration(tenureValue, tenureUnit) },
    ];

    const primaryResult = {
      label: 'Maturity Amount',
      value: formatCurrency(result.maturityAmount || 0),
      supportingText: 'total accumulated value',
    };

    const secondaryResults = [
      { label: 'Total Deposited', value: formatCurrency(result.totalDeposited || 0) },
      { label: 'Interest Earned', value: formatCurrency(result.interestEarned || 0) },
    ];

    const sections = [];

    if (reportMode === 'detailed') {
      let tenureMonths = parseFloat(tenureValue);
      if (!isNaN(tenureMonths) && tenureUnit === 'years') tenureMonths *= 12;

      const schedule = calculateRDGrowthSchedule(monthlyDeposit, rate, tenureMonths);
      if (schedule.length > 0) {
        const rows = schedule.map((s) => [
          `Month ${s.month}`,
          formatCurrency(s.totalDeposited),
          formatCurrency(s.interestEarned),
          formatCurrency(s.maturityAmount),
        ]);

        sections.push({
          type: 'table',
          title: 'Monthly Accumulation Schedule',
          headers: ['Month', 'Total Deposited', 'Interest Earned', 'Maturity Value'],
          alignments: ['left', 'right', 'right', 'right'],
          rows,
        });
      }
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
      sections,
    });
  }

  // 5. CAGR CALCULATOR
  if (calculatorId === 'cagr') {
    const initialVal = inputs.initialValue || result.initialValue || 0;
    const finalVal = inputs.finalValue || result.finalValue || 0;
    const tenureValue = inputs.tenureValue || result.tenureYears || 0;
    const tenureUnit = inputs.tenureUnit || 'years';

    const inputList = [
      { label: 'Beginning Value', value: formatCurrency(initialVal) },
      { label: 'Ending Value', value: formatCurrency(finalVal) },
      { label: 'Duration', value: formatDuration(tenureValue, tenureUnit) },
    ];

    const primaryResult = {
      label: 'Compound Annual Growth Rate (CAGR)',
      value: formatPercentage(result.cagr || 0),
      supportingText: 'annualized rate of return',
    };

    const secondaryResults = [
      { label: 'Total Absolute Gain', value: formatCurrency(result.absoluteGain || 0) },
    ];

    const sections = [];

    if (reportMode === 'detailed') {
      let tenureYears = parseFloat(tenureValue);
      if (!isNaN(tenureYears) && tenureUnit === 'months') tenureYears /= 12;

      const cagrRate = (result.cagr || 0) / 100;
      const yearsCount = Math.max(1, Math.round(tenureYears));
      const rows = [];

      for (let yr = 1; yr <= yearsCount; yr++) {
        const projVal = initialVal * Math.pow(1 + cagrRate, yr);
        rows.push([
          `Year ${yr}`,
          formatCurrency(projVal),
        ]);
      }

      sections.push({
        type: 'table',
        title: 'CAGR Growth Trajectory',
        headers: ['Year', 'Projected Value'],
        alignments: ['left', 'right'],
        rows,
      });
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
      sections,
    });
  }

  // 6. ROI CALCULATOR
  if (calculatorId === 'roi') {
    const inv = inputs.initialInvestment || result.initialInvestment || 0;
    const fVal = inputs.finalValue || result.finalValue || 0;

    const inputList = [
      { label: 'Initial Investment', value: formatCurrency(inv) },
      { label: 'Final Value / Return', value: formatCurrency(fVal) },
    ];

    const primaryResult = {
      label: 'Return on Investment (ROI)',
      value: formatPercentage(result.roi || 0),
      supportingText: result.isProfit ? 'net gain' : 'net loss',
    };

    const secondaryResults = [
      { label: 'Net Profit / Loss', value: formatCurrency(result.netProfit || 0) },
    ];

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
    });
  }

  // 7. GST CALCULATOR
  if (calculatorId === 'gst') {
    const amount = inputs.amount || result.totalAmount || result.baseAmount || 0;
    const rate = inputs.gstRate || result.gstRate || 0;
    const mode = inputs.mode || result.mode || 'exclusive';

    const inputList = [
      { label: 'Amount', value: formatCurrency(amount) },
      { label: 'GST Rate', value: formatPercentage(rate) },
      { label: 'Calculation Mode', value: mode === 'exclusive' ? 'Exclusive (Add GST)' : 'Inclusive (Extract GST)' },
    ];

    const primaryResult = {
      label: 'Total Amount',
      value: formatCurrency(result.totalAmount || 0),
      supportingText: mode === 'exclusive' ? 'amount + GST' : 'inclusive of GST',
    };

    const secondaryResults = [
      { label: 'Base Amount', value: formatCurrency(result.baseAmount || 0) },
      { label: 'GST Amount', value: formatCurrency(result.gstAmount || 0) },
    ];

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
    });
  }

  // 8. SIMPLE INTEREST
  if (calculatorId === 'simple-interest') {
    const principal = inputs.principal || result.principal || 0;
    const rate = inputs.annualInterestRate || result.annualInterestRate || 0;
    const tenureValue = inputs.tenureValue || result.tenureYears || 0;
    const tenureUnit = inputs.tenureUnit || 'years';

    const inputList = [
      { label: 'Principal Amount', value: formatCurrency(principal) },
      { label: 'Annual Interest Rate', value: formatPercentage(rate) },
      { label: 'Duration', value: formatDuration(tenureValue, tenureUnit) },
    ];

    const primaryResult = {
      label: 'Total Amount',
      value: formatCurrency(result.totalAmount || 0),
      supportingText: 'principal + simple interest',
    };

    const secondaryResults = [
      { label: 'Total Interest Earned', value: formatCurrency(result.interest || 0) },
    ];

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
    });
  }

  // 9. COMPOUND INTEREST
  if (calculatorId === 'compound-interest') {
    const principal = inputs.principal || result.principal || 0;
    const rate = inputs.annualInterestRate || result.annualInterestRate || 0;
    const tenureValue = inputs.tenureValue || result.tenureYears || 0;
    const tenureUnit = inputs.tenureUnit || 'years';
    const frequency = inputs.compoundingFrequency || result.compoundingFrequency || 'yearly';

    const inputList = [
      { label: 'Principal Amount', value: formatCurrency(principal) },
      { label: 'Annual Interest Rate', value: formatPercentage(rate) },
      { label: 'Duration', value: formatDuration(tenureValue, tenureUnit) },
      { label: 'Compounding Frequency', value: String(frequency).toUpperCase() },
    ];

    const primaryResult = {
      label: 'Maturity Amount',
      value: formatCurrency(result.maturityAmount || 0),
      supportingText: 'principal + compound interest',
    };

    const secondaryResults = [
      { label: 'Total Interest Earned', value: formatCurrency(result.interestEarned || 0) },
    ];

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
      results: secondaryResults,
    });
  }

  // 10. PERCENTAGE CALCULATOR
  if (calculatorId === 'percentage') {
    const mode = inputs.mode || result.mode || 'percentage-of';
    let inputList = [];
    let primaryResult = {};

    if (mode === 'percentage-of') {
      const p = inputs.percentage || 0;
      const total = inputs.totalValue || 0;
      inputList = [
        { label: 'Percentage', value: formatPercentage(p) },
        { label: 'Total Base Value', value: formatCurrency(total) },
      ];
      primaryResult = {
        label: `${p}% of ${formatCurrency(total)}`,
        value: formatCurrency(result.result || 0),
      };
    } else if (mode === 'percentage-change') {
      const oldV = inputs.oldValue || 0;
      const newV = inputs.newValue || 0;
      inputList = [
        { label: 'Original Value', value: formatCurrency(oldV) },
        { label: 'New Value', value: formatCurrency(newV) },
      ];
      primaryResult = {
        label: 'Percentage Change',
        value: formatPercentage(result.percentageChange || 0),
        supportingText: result.isIncrease ? 'increase' : 'decrease',
      };
    } else {
      const vA = inputs.valA || 0;
      const vB = inputs.valB || 0;
      inputList = [
        { label: 'Value A', value: formatCurrency(vA) },
        { label: 'Value B', value: formatCurrency(vB) },
      ];
      primaryResult = {
        label: 'Percentage Difference',
        value: formatPercentage(result.percentageDifference || 0),
      };
    }

    return createCalculationExportModel({
      calculatorId,
      title,
      customTitle,
      calculatedAt: date,
      inputs: inputList,
      primaryResult,
    });
  }

  // Generic fallback
  return createCalculationExportModel({
    calculatorId,
    title,
    customTitle,
    calculatedAt: date,
    inputs: Object.entries(inputs).map(([k, v]) => ({ label: k, value: String(v) })),
    primaryResult: { label: 'Result', value: JSON.stringify(result) },
  });
};

export default getExportModelForCalculator;

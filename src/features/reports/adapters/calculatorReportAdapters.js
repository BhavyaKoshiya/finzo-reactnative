import {
  createReportModel,
  createSummaryCard,
  createKeyValueItem,
  createSection,
  REPORT_TYPES,
} from '../models/reportModel';
import { formatCurrency, formatINR } from '../../../calculations/core/currency';
import { calculateAmortization } from '../../../calculations/emi/calculateAmortization';

/**
 * Calculator Report Adapters for Finzo PDF Export.
 * Maps inputs and calculation results from all 10 Finzo calculators into normalized report models.
 */

const formatMoney = (val) => formatINR(val, { symbol: '₹' });
const formatPct = (val) => `${Number(val || 0).toFixed(2)}%`;

/**
 * EMI / Loan Calculator Report Adapter
 */
export const buildEmiReport = ({ inputValues = {}, results = {}, title = 'EMI Calculator Report' }) => {
  const principal = Number(inputValues.principal || inputValues.p || results.principal) || 0;
  const rate = Number(inputValues.annualInterestRate || inputValues.r || results.annualInterestRate) || 0;
  const tenureMonths = Number(inputValues.tenureMonths || results.tenureMonths) || (Number(inputValues.tenureYears) * 12) || 0;
  const emi = Number(results.monthlyEMI || results.emi) || 0;
  const totalInterest = Number(results.totalInterest) || 0;
  const totalPayment = Number(results.totalPayment) || (principal + totalInterest);

  const summaryCards = [
    createSummaryCard({ label: 'Loan Amount', value: formatMoney(principal) }),
    createSummaryCard({ label: 'Monthly EMI', value: formatMoney(emi), highlight: true }),
    createSummaryCard({ label: 'Total Interest', value: formatMoney(totalInterest), color: '#D97706' }),
    createSummaryCard({ label: 'Total Payment', value: formatMoney(totalPayment) }),
  ];

  const sections = [
    createSection({
      title: 'Loan Configuration',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Original Loan Principal', value: formatMoney(principal) }),
        createKeyValueItem({ label: 'Annual Interest Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Loan Tenure', value: `${tenureMonths} months (${(tenureMonths / 12).toFixed(1)} yrs)` }),
        createKeyValueItem({ label: 'Interest Calculation Method', value: 'Monthly Reducing Balance' }),
      ],
    }),
    createSection({
      title: 'Payment Breakdown',
      type: 'chart_breakdown',
      chartData: {
        labelA: 'Principal Amount',
        valueA: principal,
        colorA: '#2563EB',
        labelB: 'Total Interest',
        valueB: totalInterest,
        colorB: '#F59E0B',
        formatter: formatMoney,
      },
    }),
  ];

  // Include detailed amortization schedule
  if (principal > 0 && rate > 0 && tenureMonths > 0) {
    try {
      const res = calculateAmortization(principal, rate, tenureMonths);
      const schedule = res.success ? res.data?.schedule : [];
      if (Array.isArray(schedule) && schedule.length > 0) {
        const tableHeaders = ['No.', 'Opening Bal', 'EMI', 'Interest', 'Principal', 'Closing Bal'];
        const tableRows = schedule.map((row) => [
          row.month,
          formatMoney(row.openingBalance),
          formatMoney(row.payment),
          formatMoney(row.interestComponent),
          formatMoney(row.principalComponent),
          formatMoney(row.closingBalance),
        ]);

        sections.push(
          createSection({
            title: 'Amortization Installment Schedule',
            type: 'table',
            tableHeaders,
            tableRows,
            description: `Full ${schedule.length}-month installment breakdown based on standard reducing balance math.`,
          })
        );
      }
    } catch (e) {
      // Fallback: continue report generation without schedule
    }
  }

  return createReportModel({
    title: 'EMI Calculation Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'emi',
    summaryCards,
    sections,
    assumptions: [
      `Interest is calculated on a monthly reducing balance at ${rate}% p.a.`,
      `Scheduled monthly EMI is assumed to be paid consistently on time.`,
    ],
  });
};

/**
 * SIP Calculator Report Adapter
 */
export const buildSipReport = ({ inputValues = {}, results = {}, title = 'SIP Investment Report' }) => {
  const monthly = Number(inputValues.monthlyInvestment || inputValues.monthly) || 0;
  const rate = Number(inputValues.expectedReturnRate || inputValues.rate) || 0;
  const years = Number(inputValues.tenureYears || inputValues.years) || 0;

  const totalInvested = Number(results.totalInvestment || results.totalInvested) || (monthly * years * 12);
  const totalValue = Number(results.futureValue || results.maturityAmount) || 0;
  const totalReturns = Number(results.estimatedReturns || results.totalReturns) || (totalValue - totalInvested);

  const summaryCards = [
    createSummaryCard({ label: 'Monthly SIP', value: formatMoney(monthly) }),
    createSummaryCard({ label: 'Total Invested', value: formatMoney(totalInvested) }),
    createSummaryCard({ label: 'Estimated Returns', value: formatMoney(totalReturns), color: '#10B981' }),
    createSummaryCard({ label: 'Estimated Future Value', value: formatMoney(totalValue), highlight: true, color: '#2563EB' }),
  ];

  const sections = [
    createSection({
      title: 'Investment Inputs',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Monthly SIP Amount', value: formatMoney(monthly) }),
        createKeyValueItem({ label: 'Expected Annual Return Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Investment Duration', value: `${years} years (${years * 12} months)` }),
      ],
    }),
    createSection({
      title: 'Investment vs Returns Breakdown',
      type: 'chart_breakdown',
      chartData: {
        labelA: 'Total Invested',
        valueA: totalInvested,
        colorA: '#3B82F6',
        labelB: 'Estimated Returns',
        valueB: Math.max(0, totalReturns),
        colorB: '#10B981',
        formatter: formatMoney,
      },
    }),
  ];

  // Include yearly growth table if available in results
  if (Array.isArray(results.yearlyBreakdown) && results.yearlyBreakdown.length > 0) {
    const tableHeaders = ['Year', 'Total Invested', 'Estimated Returns', 'Total Value'];
    const tableRows = results.yearlyBreakdown.map((row) => [
      `Year ${row.year}`,
      formatMoney(row.totalInvested),
      formatMoney(row.estimatedReturns),
      formatMoney(row.futureValue),
    ]);

    sections.push(
      createSection({
        title: 'Estimated Yearly Growth Table',
        type: 'table',
        tableHeaders,
        tableRows,
      })
    );
  }

  return createReportModel({
    title: 'SIP Calculation Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'sip',
    summaryCards,
    sections,
    assumptions: [
      `Returns are projected based on a compounded monthly expected return rate of ${rate}% p.a.`,
      `Projections are estimates and actual mutual fund / market returns may fluctuate.`,
    ],
  });
};

/**
 * FD Calculator Report Adapter
 */
export const buildFdReport = ({ inputValues = {}, results = {}, title = 'FD Calculation Report' }) => {
  const principal = Number(inputValues.principal || inputValues.p) || 0;
  const rate = Number(inputValues.annualInterestRate || inputValues.r) || 0;
  const years = Number(inputValues.tenureYears) || 0;
  const freq = String(inputValues.compoundingFrequency || 'quarterly');

  const maturityAmount = Number(results.maturityAmount) || 0;
  const interestEarned = Number(results.interestEarned) || (maturityAmount - principal);

  const summaryCards = [
    createSummaryCard({ label: 'Principal Deposit', value: formatMoney(principal) }),
    createSummaryCard({ label: 'Interest Rate', value: formatPct(rate) }),
    createSummaryCard({ label: 'Interest Earned', value: formatMoney(interestEarned), color: '#10B981' }),
    createSummaryCard({ label: 'Maturity Amount', value: formatMoney(maturityAmount), highlight: true }),
  ];

  const sections = [
    createSection({
      title: 'Fixed Deposit Terms',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Deposit Principal Amount', value: formatMoney(principal) }),
        createKeyValueItem({ label: 'Annual Interest Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Tenure', value: `${years} ${years === 1 ? 'year' : 'years'}` }),
        createKeyValueItem({ label: 'Compounding Frequency', value: freq.replace('-', ' ').toUpperCase() }),
      ],
    }),
    createSection({
      title: 'Principal vs Interest Breakdown',
      type: 'chart_breakdown',
      chartData: {
        labelA: 'Principal Deposit',
        valueA: principal,
        colorA: '#2563EB',
        labelB: 'Interest Earned',
        valueB: interestEarned,
        colorB: '#10B981',
        formatter: formatMoney,
      },
    }),
  ];

  return createReportModel({
    title: 'Fixed Deposit (FD) Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'fd',
    summaryCards,
    sections,
    assumptions: [
      `Interest compounds ${freq.replace('-', ' ')} at ${rate}% p.a.`,
      `Final payout subject to applicable TDS as per tax laws.`,
    ],
  });
};

/**
 * RD Calculator Report Adapter
 */
export const buildRdReport = ({ inputValues = {}, results = {}, title = 'RD Calculation Report' }) => {
  const monthly = Number(inputValues.monthlyDeposit || inputValues.p) || 0;
  const rate = Number(inputValues.annualInterestRate || inputValues.r) || 0;
  const years = Number(inputValues.tenureYears) || 0;
  const totalDeposit = Number(results.totalDeposit || results.totalDeposits) || (monthly * years * 12);

  const maturityAmount = Number(results.maturityAmount) || 0;
  const interestEarned = Number(results.interestEarned) || (maturityAmount - totalDeposit);

  const summaryCards = [
    createSummaryCard({ label: 'Monthly Deposit', value: formatMoney(monthly) }),
    createSummaryCard({ label: 'Total Deposits', value: formatMoney(totalDeposit) }),
    createSummaryCard({ label: 'Interest Earned', value: formatMoney(interestEarned), color: '#10B981' }),
    createSummaryCard({ label: 'Maturity Amount', value: formatMoney(maturityAmount), highlight: true }),
  ];

  const sections = [
    createSection({
      title: 'Recurring Deposit Terms',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Monthly Instalment', value: formatMoney(monthly) }),
        createKeyValueItem({ label: 'Annual Interest Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Tenure', value: `${years} years (${years * 12} months)` }),
        createKeyValueItem({ label: 'Compounding Method', value: 'Quarterly Compounded' }),
      ],
    }),
    createSection({
      title: 'Deposit vs Interest Breakdown',
      type: 'chart_breakdown',
      chartData: {
        labelA: 'Total Deposits',
        valueA: totalDeposit,
        colorA: '#3B82F6',
        labelB: 'Interest Earned',
        valueB: interestEarned,
        colorB: '#10B981',
        formatter: formatMoney,
      },
    }),
  ];

  return createReportModel({
    title: 'Recurring Deposit (RD) Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'rd',
    summaryCards,
    sections,
    assumptions: [
      `RD calculations assume consistent monthly deposits paid on time.`,
      `Quarterly compounding is applied as standard banking convention.`,
    ],
  });
};

/**
 * CAGR Calculator Report Adapter
 */
export const buildCagrReport = ({ inputValues = {}, results = {}, title = 'CAGR Report' }) => {
  const initial = Number(inputValues.beginningValue || inputValues.initial) || 0;
  const finalVal = Number(inputValues.endingValue || inputValues.final) || 0;
  const years = Number(inputValues.tenureYears || inputValues.years) || 0;

  const cagr = Number(results.cagr) || 0;
  const absoluteGain = Number(results.absoluteGain) || (finalVal - initial);

  const summaryCards = [
    createSummaryCard({ label: 'Initial Value', value: formatMoney(initial) }),
    createSummaryCard({ label: 'Final Value', value: formatMoney(finalVal) }),
    createSummaryCard({ label: 'Absolute Gain', value: formatMoney(absoluteGain), color: absoluteGain >= 0 ? '#10B981' : '#EF4444' }),
    createSummaryCard({ label: 'CAGR Rate', value: formatPct(cagr), highlight: true, color: cagr >= 0 ? '#2563EB' : '#EF4444' }),
  ];

  const sections = [
    createSection({
      title: 'Growth Performance Metrics',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Initial Investment Value', value: formatMoney(initial) }),
        createKeyValueItem({ label: 'Final Investment Value', value: formatMoney(finalVal) }),
        createKeyValueItem({ label: 'Investment Time Horizon', value: `${years} ${years === 1 ? 'year' : 'years'}` }),
        createKeyValueItem({ label: 'Compounded Annual Growth Rate (CAGR)', value: formatPct(cagr), highlight: true }),
        createKeyValueItem({ label: 'Absolute Growth Return', value: `${formatMoney(absoluteGain)} (${initial > 0 ? ((absoluteGain / initial) * 100).toFixed(2) : 0}%)` }),
      ],
    }),
  ];

  return createReportModel({
    title: 'Compound Annual Growth Rate (CAGR)',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'cagr',
    summaryCards,
    sections,
    assumptions: [
      `CAGR represents the annualized smooth growth rate over the specified period.`,
      `It is a derived historical metric and does not guarantee steady annual returns.`,
    ],
  });
};

/**
 * ROI Calculator Report Adapter
 */
export const buildRoiReport = ({ inputValues = {}, results = {}, title = 'ROI Calculation Report' }) => {
  const inv = Number(inputValues.initialInvestment || inputValues.inv) || 0;
  const fVal = Number(inputValues.finalValue || inputValues.fVal) || 0;
  const roi = Number(results.roi) || 0;
  const netProfit = Number(results.netProfit) || (fVal - inv);
  const isProfit = netProfit >= 0;

  const summaryCards = [
    createSummaryCard({ label: 'Cost / Investment', value: formatMoney(inv) }),
    createSummaryCard({ label: 'Return Value', value: formatMoney(fVal) }),
    createSummaryCard({ label: 'Net Profit / Loss', value: formatMoney(netProfit), color: isProfit ? '#10B981' : '#EF4444' }),
    createSummaryCard({ label: 'ROI %', value: formatPct(roi), highlight: true, color: isProfit ? '#2563EB' : '#EF4444' }),
  ];

  const sections = [
    createSection({
      title: 'Return On Investment Summary',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Initial Outlay / Cost', value: formatMoney(inv) }),
        createKeyValueItem({ label: 'Final Value / Revenue', value: formatMoney(fVal) }),
        createKeyValueItem({ label: 'Net Result', value: isProfit ? `Profit of ${formatMoney(netProfit)}` : `Loss of ${formatMoney(Math.abs(netProfit))}`, highlight: true }),
        createKeyValueItem({ label: 'Return On Investment (ROI)', value: formatPct(roi), highlight: true }),
      ],
    }),
  ];

  return createReportModel({
    title: 'Return On Investment (ROI) Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'roi',
    summaryCards,
    sections,
    assumptions: [
      `ROI formula: ((Final Value - Initial Investment) / Initial Investment) * 100.`,
      `Does not account for holding duration or taxation unless specified.`,
    ],
  });
};

/**
 * GST Calculator Report Adapter
 */
export const buildGstReport = ({ inputValues = {}, results = {}, title = 'GST Calculation Report' }) => {
  const amount = Number(inputValues.amount) || 0;
  const rate = Number(inputValues.gstRate) || 0;
  const mode = String(inputValues.gstMode || 'exclusive');

  const gstAmount = Number(results.gstAmount) || 0;
  const totalAmount = Number(results.totalAmount) || 0;
  const baseAmount = Number(results.baseAmount || results.netAmount) || (mode === 'inclusive' ? totalAmount - gstAmount : amount);

  const summaryCards = [
    createSummaryCard({ label: 'Base Net Amount', value: formatMoney(baseAmount) }),
    createSummaryCard({ label: 'GST Rate', value: formatPct(rate) }),
    createSummaryCard({ label: 'GST Amount', value: formatMoney(gstAmount), color: '#D97706' }),
    createSummaryCard({ label: 'Gross Total', value: formatMoney(totalAmount), highlight: true }),
  ];

  const sections = [
    createSection({
      title: 'GST Calculation Breakdown',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Calculation Mode', value: mode === 'inclusive' ? 'Inclusive GST (Extracted)' : 'Exclusive GST (Added)' }),
        createKeyValueItem({ label: 'Base Net Amount', value: formatMoney(baseAmount) }),
        createKeyValueItem({ label: 'Applicable GST Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Calculated GST Amount', value: formatMoney(gstAmount), highlight: true }),
        createKeyValueItem({ label: 'Gross Final Amount', value: formatMoney(totalAmount), highlight: true }),
      ],
    }),
  ];

  return createReportModel({
    title: 'Goods & Services Tax (GST) Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'gst',
    summaryCards,
    sections,
    assumptions: [
      mode === 'inclusive'
        ? `GST of ${rate}% was extracted from the inclusive gross total.`
        : `GST of ${rate}% was added onto the base net amount.`,
    ],
  });
};

/**
 * Simple Interest Calculator Report Adapter
 */
export const buildSimpleInterestReport = ({ inputValues = {}, results = {}, title = 'Simple Interest Report' }) => {
  const principal = Number(inputValues.principal || inputValues.p) || 0;
  const rate = Number(inputValues.annualInterestRate || inputValues.r) || 0;
  const years = Number(inputValues.tenureYears) || 0;

  const interest = Number(results.interest) || 0;
  const totalAmount = Number(results.totalAmount) || (principal + interest);

  const summaryCards = [
    createSummaryCard({ label: 'Principal', value: formatMoney(principal) }),
    createSummaryCard({ label: 'Interest Rate', value: formatPct(rate) }),
    createSummaryCard({ label: 'Interest Earned', value: formatMoney(interest), color: '#10B981' }),
    createSummaryCard({ label: 'Total Amount', value: formatMoney(totalAmount), highlight: true }),
  ];

  const sections = [
    createSection({
      title: 'Simple Interest Breakdown',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Principal Amount', value: formatMoney(principal) }),
        createKeyValueItem({ label: 'Annual Interest Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Time Duration', value: `${years} ${years === 1 ? 'year' : 'years'}` }),
        createKeyValueItem({ label: 'Interest Accumulated', value: formatMoney(interest) }),
        createKeyValueItem({ label: 'Final Maturity Amount', value: formatMoney(totalAmount), highlight: true }),
      ],
    }),
  ];

  return createReportModel({
    title: 'Simple Interest Calculation',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'simple_interest',
    summaryCards,
    sections,
    assumptions: [`Simple interest formula: (Principal * Rate * Time) / 100.`],
  });
};

/**
 * Compound Interest Calculator Report Adapter
 */
export const buildCompoundInterestReport = ({ inputValues = {}, results = {}, title = 'Compound Interest Report' }) => {
  const principal = Number(inputValues.principal || inputValues.p) || 0;
  const rate = Number(inputValues.annualInterestRate || inputValues.r) || 0;
  const years = Number(inputValues.tenureYears) || 0;
  const freq = String(inputValues.compoundingFrequency || 'yearly');

  const interest = Number(results.interestEarned || results.interest) || 0;
  const finalAmount = Number(results.maturityAmount || results.finalAmount) || (principal + interest);

  const summaryCards = [
    createSummaryCard({ label: 'Principal Deposit', value: formatMoney(principal) }),
    createSummaryCard({ label: 'Interest Rate', value: formatPct(rate) }),
    createSummaryCard({ label: 'Interest Earned', value: formatMoney(interest), color: '#10B981' }),
    createSummaryCard({ label: 'Final Amount', value: formatMoney(finalAmount), highlight: true }),
  ];

  const sections = [
    createSection({
      title: 'Compound Interest Terms',
      type: 'key_value',
      items: [
        createKeyValueItem({ label: 'Initial Principal', value: formatMoney(principal) }),
        createKeyValueItem({ label: 'Annual Rate', value: formatPct(rate) }),
        createKeyValueItem({ label: 'Duration', value: `${years} ${years === 1 ? 'year' : 'years'}` }),
        createKeyValueItem({ label: 'Compounding Frequency', value: freq.toUpperCase() }),
        createKeyValueItem({ label: 'Interest Earned', value: formatMoney(interest) }),
        createKeyValueItem({ label: 'Total Accumulated Value', value: formatMoney(finalAmount), highlight: true }),
      ],
    }),
  ];

  return createReportModel({
    title: 'Compound Interest Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'compound_interest',
    summaryCards,
    sections,
    assumptions: [`Interest compounds ${freq} at ${rate}% p.a. over ${years} years.`],
  });
};

/**
 * Percentage Calculator Report Adapter
 */
export const buildPercentageReport = ({ inputValues = {}, results = {}, title = 'Percentage Report' }) => {
  const mode = String(inputValues.mode || 'percentage_of');
  const sections = [];
  const summaryCards = [];

  if (mode === 'percentage_change') {
    const orig = Number(inputValues.originalValue) || 0;
    const newVal = Number(inputValues.newValue) || 0;
    const change = Number(results.change) || (newVal - orig);
    const pctChange = Number(results.percentageChange) || 0;

    summaryCards.push(createSummaryCard({ label: 'Original Value', value: String(orig) }));
    summaryCards.push(createSummaryCard({ label: 'New Value', value: String(newVal) }));
    summaryCards.push(createSummaryCard({ label: 'Change %', value: `${pctChange.toFixed(2)}%`, highlight: true, color: change >= 0 ? '#10B981' : '#EF4444' }));

    sections.push(
      createSection({
        title: 'Percentage Change Breakdown',
        type: 'key_value',
        items: [
          createKeyValueItem({ label: 'Original Base Value', value: String(orig) }),
          createKeyValueItem({ label: 'New Updated Value', value: String(newVal) }),
          createKeyValueItem({ label: 'Absolute Difference', value: String(change) }),
          createKeyValueItem({ label: 'Percentage Change', value: `${pctChange.toFixed(2)}% (${change >= 0 ? 'Increase' : 'Decrease'})`, highlight: true }),
        ],
      })
    );
  } else if (mode === 'percentage_difference') {
    const valA = Number(inputValues.valueA) || 0;
    const valB = Number(inputValues.valueB) || 0;
    const diff = Number(results.difference) || Math.abs(valA - valB);
    const pctDiff = Number(results.percentageDifference) || 0;

    summaryCards.push(createSummaryCard({ label: 'Value A', value: String(valA) }));
    summaryCards.push(createSummaryCard({ label: 'Value B', value: String(valB) }));
    summaryCards.push(createSummaryCard({ label: 'Difference %', value: `${pctDiff.toFixed(2)}%`, highlight: true }));

    sections.push(
      createSection({
        title: 'Percentage Difference Breakdown',
        type: 'key_value',
        items: [
          createKeyValueItem({ label: 'First Value (A)', value: String(valA) }),
          createKeyValueItem({ label: 'Second Value (B)', value: String(valB) }),
          createKeyValueItem({ label: 'Absolute Numeric Difference', value: String(diff) }),
          createKeyValueItem({ label: 'Percentage Difference', value: `${pctDiff.toFixed(2)}%`, highlight: true }),
        ],
      })
    );
  } else {
    // Default: Percentage Of
    const pct = Number(inputValues.percentage) || 0;
    const base = Number(inputValues.baseValue) || 0;
    const resVal = Number(results.result) || ((pct / 100) * base);

    summaryCards.push(createSummaryCard({ label: 'Percentage', value: `${pct}%` }));
    summaryCards.push(createSummaryCard({ label: 'Base Value', value: String(base) }));
    summaryCards.push(createSummaryCard({ label: 'Result', value: String(resVal), highlight: true }));

    sections.push(
      createSection({
        title: 'Percentage Of Value',
        type: 'key_value',
        items: [
          createKeyValueItem({ label: 'Percentage Selected', value: `${pct}%` }),
          createKeyValueItem({ label: 'Base Target Value', value: String(base) }),
          createKeyValueItem({ label: 'Calculated Result Value', value: String(resVal), highlight: true }),
        ],
      })
    );
  }

  return createReportModel({
    title: 'Percentage Calculation Report',
    subtitle: title,
    reportType: REPORT_TYPES.CALCULATOR,
    calculatorType: 'percentage',
    summaryCards,
    sections,
  });
};

/**
 * Universal Calculator Report Adapter Resolver
 */
export const getCalculatorReportAdapter = (calculatorId, inputValues, results, customTitle) => {
  switch (String(calculatorId).toLowerCase()) {
    case 'emi':
    case 'home_loan':
    case 'car_loan':
    case 'personal_loan':
    case 'education_loan':
    case 'business_loan':
      return buildEmiReport({ inputValues, results, title: customTitle });
    case 'sip':
      return buildSipReport({ inputValues, results, title: customTitle });
    case 'fd':
      return buildFdReport({ inputValues, results, title: customTitle });
    case 'rd':
      return buildRdReport({ inputValues, results, title: customTitle });
    case 'cagr':
      return buildCagrReport({ inputValues, results, title: customTitle });
    case 'roi':
      return buildRoiReport({ inputValues, results, title: customTitle });
    case 'gst':
      return buildGstReport({ inputValues, results, title: customTitle });
    case 'simple_interest':
      return buildSimpleInterestReport({ inputValues, results, title: customTitle });
    case 'compound_interest':
      return buildCompoundInterestReport({ inputValues, results, title: customTitle });
    case 'percentage':
      return buildPercentageReport({ inputValues, results, title: customTitle });
    default:
      return buildEmiReport({ inputValues, results, title: customTitle });
  }
};

export default getCalculatorReportAdapter;

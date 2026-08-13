import { format } from 'date-fns';

/**
 * Normalized Internal Report Model for Finzo PDF Generation.
 * Decouples calculation/loan business logic from PDF HTML rendering.
 */

export const REPORT_TYPES = {
  CALCULATOR: 'calculator',
  LOAN_SUMMARY: 'loan_summary',
  LOAN_STATEMENT: 'loan_statement',
  LOAN_INSIGHTS: 'loan_insights',
};

export const createSummaryCard = ({ label, value, subtitle, highlight = false, color = '#2563EB' }) => ({
  label: String(label || '').trim(),
  value: String(value || '').trim(),
  subtitle: subtitle ? String(subtitle).trim() : null,
  highlight: Boolean(highlight),
  color: String(color),
});

export const createKeyValueItem = ({ label, value, highlight = false, indent = false, isEstimate = false }) => ({
  label: String(label || '').trim(),
  value: String(value || '').trim(),
  highlight: Boolean(highlight),
  indent: Boolean(indent),
  isEstimate: Boolean(isEstimate),
});

export const createSection = ({
  title,
  type = 'key_value', // 'key_value' | 'table' | 'chart_breakdown' | 'text_block'
  items = [],
  tableHeaders = [],
  tableRows = [],
  chartData = null,
  description = null,
}) => ({
  title: String(title || '').trim(),
  type,
  items: Array.isArray(items) ? items : [],
  tableHeaders: Array.isArray(tableHeaders) ? tableHeaders : [],
  tableRows: Array.isArray(tableRows) ? tableRows : [],
  chartData,
  description: description ? String(description).trim() : null,
});

export const createReportModel = ({
  title = 'Finzo Financial Report',
  subtitle = 'Financial Summary',
  reportType = REPORT_TYPES.CALCULATOR,
  calculatorType = null,
  loanId = null,
  generatedAt = new Date(),
  fileName = null,
  summaryCards = [],
  sections = [],
  assumptions = [],
  disclaimer = "Finzo estimates are based on the information provided and may differ from your lender's actual calculations, dates, charges, or statements.",
}) => {
  const dateObj = generatedAt instanceof Date ? generatedAt : new Date(generatedAt);
  const formattedDate = !isNaN(dateObj.getTime()) ? format(dateObj, 'dd MMM yyyy, hh:mm a') : format(new Date(), 'dd MMM yyyy, hh:mm a');
  const dateISO = !isNaN(dateObj.getTime()) ? format(dateObj, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const defaultFileName = fileName || `Finzo_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateISO}.pdf`;

  return {
    title: String(title).trim(),
    subtitle: String(subtitle).trim(),
    reportType,
    calculatorType,
    loanId,
    generatedAt: formattedDate,
    generatedAtISO: dateISO,
    fileName: defaultFileName,
    summaryCards: Array.isArray(summaryCards) ? summaryCards : [],
    sections: Array.isArray(sections) ? sections : [],
    assumptions: Array.isArray(assumptions) ? assumptions : [],
    disclaimer: String(disclaimer).trim(),
  };
};

export default {
  REPORT_TYPES,
  createSummaryCard,
  createKeyValueItem,
  createSection,
  createReportModel,
};

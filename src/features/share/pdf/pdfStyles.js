import { PDF_THEME } from './pdfTheme';

/**
 * Returns clean, print-friendly CSS styles for PDF generation.
 */
export const getPdfCssStyles = () => `
  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
    background-color: #FFFFFF;
  }
  html, body {
    background-color: #FFFFFF !important;
    background: #FFFFFF !important;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: ${PDF_THEME.typography.fontFamily};
    color: ${PDF_THEME.colors.textPrimary};
    font-size: 12px;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  div.running-header {
    position: fixed;
    top: -12mm;
    left: 0;
    right: 0;
    height: 8mm;
    border-bottom: 1px solid ${PDF_THEME.colors.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    font-weight: 600;
    color: ${PDF_THEME.colors.textSecondary};
  }
  div.running-footer {
    position: fixed;
    bottom: -12mm;
    left: 0;
    right: 0;
    height: 8mm;
    border-top: 1px solid ${PDF_THEME.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: ${PDF_THEME.colors.textMuted};
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid ${PDF_THEME.colors.primary};
    padding-bottom: 14px;
    margin-bottom: 20px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .brand-title {
    font-size: 22px;
    font-weight: 800;
    color: ${PDF_THEME.colors.primary};
    letter-spacing: -0.5px;
  }
  .brand-sub {
    font-size: 11px;
    color: ${PDF_THEME.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 2px;
  }
  .report-info {
    text-align: right;
  }
  .report-title {
    font-size: 16px;
    font-weight: 700;
    color: ${PDF_THEME.colors.textPrimary};
  }
  .report-date {
    font-size: 11px;
    color: ${PDF_THEME.colors.textSecondary};
    margin-top: 4px;
  }
  .custom-title-banner {
    background-color: ${PDF_THEME.colors.surfaceSubtle};
    border: 1px solid ${PDF_THEME.colors.border};
    border-left: 4px solid ${PDF_THEME.colors.primary};
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 13px;
    font-weight: 600;
    color: ${PDF_THEME.colors.textPrimary};
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .hero-card {
    background-color: ${PDF_THEME.colors.primaryLight};
    border: 1px solid ${PDF_THEME.colors.primary}33;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 20px;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .hero-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${PDF_THEME.colors.textSecondary};
    margin-bottom: 4px;
  }
  .hero-value {
    font-size: 30px;
    font-weight: 800;
    color: ${PDF_THEME.colors.primary};
    line-height: 1.2;
  }
  .hero-support {
    font-size: 11px;
    color: ${PDF_THEME.colors.textSecondary};
    margin-top: 4px;
  }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: ${PDF_THEME.colors.textSecondary};
    margin-top: 16px;
    margin-bottom: 10px;
    border-bottom: 1px solid ${PDF_THEME.colors.border};
    padding-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .grid-container {
    display: table;
    width: 100%;
    margin-bottom: 20px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .grid-row {
    display: table-row;
  }
  .grid-cell {
    display: table-cell;
    width: 50%;
    vertical-align: top;
    padding-right: 10px;
  }
  .grid-cell:last-child {
    padding-right: 0;
    padding-left: 10px;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  .data-table thead {
    display: table-header-group;
  }
  .data-table tbody {
    display: table-row-group;
  }
  .data-table tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .data-table th, .data-table td {
    padding: 7px 10px;
    border-bottom: 1px solid ${PDF_THEME.colors.borderLight};
    font-size: 11px;
  }
  .data-table th {
    background-color: ${PDF_THEME.colors.surfaceSubtle};
    color: ${PDF_THEME.colors.textSecondary};
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
  }
  .data-table td.number, .data-table th.number {
    text-align: right;
  }
  .data-table tr:nth-child(even) {
    background-color: #FAFBFD;
  }
  .footer {
    margin-top: 30px;
    border-top: 1px solid ${PDF_THEME.colors.border};
    padding-top: 10px;
    text-align: center;
    font-size: 10px;
    color: ${PDF_THEME.colors.textMuted};
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .page-break {
    page-break-before: always;
    break-before: always;
  }
`;

export default getPdfCssStyles;

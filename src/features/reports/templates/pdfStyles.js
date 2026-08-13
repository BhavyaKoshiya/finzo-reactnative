/**
 * Print-Friendly CSS Stylesheet for Finzo HTML-to-PDF Reports.
 * Provides clean typography, executive branding, responsive layout,
 * aligned numeric columns, and repeated headers for paginated schedules.
 */

export const getPdfCss = () => `
  @page {
    size: A4 portrait;
    margin: 15mm 12mm 15mm 12mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1E293B;
    background-color: #FFFFFF;
    font-size: 11pt;
    line-height: 1.45;
  }

  .report-container {
    width: 100%;
  }

  /* Header Section */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 12pt;
    border-bottom: 2pt solid #2563EB;
    margin-bottom: 14pt;
  }

  .brand-title {
    font-size: 18pt;
    font-weight: 800;
    color: #1E3A8A;
    letter-spacing: -0.5pt;
  }

  .brand-tagline {
    font-size: 8pt;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 1pt;
    font-weight: 600;
    margin-top: 1pt;
  }

  .report-title-box {
    text-align: right;
  }

  .report-title {
    font-size: 14pt;
    font-weight: 700;
    color: #0F172A;
  }

  .report-meta {
    font-size: 8.5pt;
    color: #64748B;
    margin-top: 2pt;
  }

  /* Summary Cards Row */
  .summary-cards-grid {
    display: table;
    width: 100%;
    margin-bottom: 14pt;
    table-layout: fixed;
    border-spacing: 6pt;
  }

  .summary-card {
    display: table-cell;
    background: #F8FAFC;
    border: 1pt solid #E2E8F0;
    border-radius: 6pt;
    padding: 8pt 10pt;
    vertical-align: top;
  }

  .summary-card.highlight {
    background: #EFF6FF;
    border-color: #BFDBFE;
  }

  .summary-label {
    font-size: 8pt;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
  }

  .summary-value {
    font-size: 14pt;
    font-weight: 800;
    color: #1E293B;
    margin-top: 2pt;
  }

  .summary-subtitle {
    font-size: 7.5pt;
    color: #64748B;
    margin-top: 2pt;
  }

  /* Section Styling */
  .section-block {
    margin-bottom: 14pt;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: #1E3A8A;
    border-left: 3pt solid #2563EB;
    padding-left: 6pt;
    margin-bottom: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
  }

  /* Key-Value Tables */
  .kv-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6pt;
  }

  .kv-table tr {
    border-bottom: 1pt solid #F1F5F9;
  }

  .kv-table tr:last-child {
    border-bottom: none;
  }

  .kv-table td {
    padding: 5pt 0;
    font-size: 9.5pt;
  }

  .kv-label {
    color: #475569;
    width: 55%;
  }

  .kv-label.indent {
    padding-left: 12pt;
  }

  .kv-value {
    color: #0F172A;
    font-weight: 600;
    text-align: right;
    width: 45%;
  }

  .kv-value.highlight {
    font-weight: 700;
    color: #2563EB;
  }

  /* Data Schedules / Amortization Tables */
  .data-table-wrapper {
    width: 100%;
    margin-top: 4pt;
    margin-bottom: 8pt;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
  }

  .data-table thead {
    display: table-header-group;
  }

  .data-table tr {
    page-break-inside: avoid;
  }

  .data-table th {
    background-color: #F1F5F9;
    color: #334155;
    font-weight: 700;
    text-align: right;
    padding: 5pt 6pt;
    border-bottom: 1.5pt solid #CBD5E1;
    font-size: 8pt;
    text-transform: uppercase;
  }

  .data-table th:first-child,
  .data-table td:first-child {
    text-align: left;
  }

  .data-table td {
    padding: 4.5pt 6pt;
    border-bottom: 1pt solid #E2E8F0;
    text-align: right;
    color: #1E293B;
  }

  .data-table tr:nth-child(even) {
    background-color: #F8FAFC;
  }

  .chip-tag {
    display: inline-block;
    padding: 2pt 5pt;
    border-radius: 4pt;
    font-size: 7.5pt;
    font-weight: 600;
  }

  .chip-emi { background: #E0E7FF; color: #3730A3; }
  .chip-prepayment { background: #D1FAE5; color: #065F46; }
  .chip-correction { background: #FEF3C7; color: #92400E; }
  .chip-custom { background: #F3E8FF; color: #6B21A8; }

  /* Chart Breakdown Visual Bar */
  .chart-container {
    margin: 8pt 0 12pt 0;
    background: #F8FAFC;
    border: 1pt solid #E2E8F0;
    border-radius: 6pt;
    padding: 8pt 10pt;
  }

  .chart-bar-track {
    display: flex;
    height: 12pt;
    border-radius: 6pt;
    overflow: hidden;
    margin: 6pt 0;
    background-color: #E2E8F0;
  }

  .chart-bar-segment {
    height: 100%;
  }

  .chart-legend {
    display: flex;
    justify-content: space-around;
    margin-top: 4pt;
  }

  .legend-item {
    display: flex;
    align-items: center;
    font-size: 8pt;
    color: #475569;
  }

  .legend-color {
    width: 8pt;
    height: 8pt;
    border-radius: 2pt;
    margin-right: 4pt;
  }

  /* Assumptions & Disclaimer Box */
  .assumptions-box {
    background: #F8FAFC;
    border-top: 1pt solid #E2E8F0;
    padding: 8pt 10pt;
    margin-top: 14pt;
    border-radius: 4pt;
    page-break-inside: avoid;
  }

  .assumptions-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #334155;
    margin-bottom: 3pt;
  }

  .assumptions-list {
    padding-left: 12pt;
    font-size: 7.5pt;
    color: #64748B;
    margin-bottom: 6pt;
  }

  .assumptions-list li {
    margin-bottom: 2pt;
  }

  .disclaimer-text {
    font-size: 7pt;
    color: #94A3B8;
    font-style: italic;
    line-height: 1.3;
  }

  /* Page Footer */
  .report-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.5pt;
    color: #94A3B8;
    border-top: 0.5pt solid #E2E8F0;
    padding-top: 4pt;
  }
`;

export default getPdfCss;

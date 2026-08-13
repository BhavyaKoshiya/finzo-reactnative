# PDF Report Architecture — FINZO Phase 16.9

## 1. Overview
Finzo Phase 16.9 introduces a 100% offline, local, professional PDF report generation and native sharing system (`src/features/reports/`).

It supports exporting:
- **Calculator Reports**: Saved and live calculations across all 10 Finzo calculators (EMI with 360-month amortization schedule, SIP with yearly growth table, FD, RD, CAGR, ROI, GST, Simple Interest, Compound Interest, Percentage).
- **Loan Summary Report**: Loan account configuration, lender info, current balance position, and interest method.
- **Loan Statement Report**: Complete payment transaction ledger, prepayments, balance corrections, and historical snapshot preservation.
- **Loan Insights Report**: Principal progress, remaining interest/tenure, payoff date, prepayment impact, and latest payment breakdown.

---

## 2. Privacy & Offline Policy
- **100% Local Generation**: PDFs are compiled on-device via `react-native-html-to-pdf`.
- **Zero Cloud Storage**: No PDFs, financial records, or payment histories are uploaded to Firebase or third-party servers.
- **Native Share Integration**: Files are shared directly using system native share sheets (`Share.share({ url: 'file://...' })`).

---

## 3. Layered Architecture

```
src/features/reports/
  models/
    reportModel.js               # Normalized internal report model
  adapters/
    calculatorReportAdapters.js  # Adapters for all 10 calculators
    loanReportAdapters.js        # Adapters for Loan Summary, Statement, Insights
  templates/
    pdfHtmlRenderer.js           # Converts reportModel into HTML
    pdfStyles.js                 # Executive print-friendly CSS stylesheet
  utils/
    pdfChartUtils.js             # Inline HTML/SVG progress bars & breakdown charts
  services/
    pdfReportService.js          # Generation, caching, & native share service
  components/
    ExportOptionsModal.jsx       # Modal UI for selecting loan report type
  index.js                       # Public API barrel
```

---

## 4. Normalized Report Model Schema
Calculator and Loan business logic is decoupled from HTML rendering using a normalized report model:

```javascript
{
  title: string,
  subtitle: string,
  reportType: 'calculator' | 'loan_summary' | 'loan_statement' | 'loan_insights',
  calculatorType: string,
  loanId: string | null,
  generatedAt: string,
  fileName: string,
  summaryCards: [ { label, value, subtitle, highlight, color } ],
  sections: [
    {
      title: string,
      type: 'key_value' | 'table' | 'chart_breakdown' | 'text_block',
      items: [ { label, value, highlight, indent, isEstimate } ],
      tableHeaders: Array<string>,
      tableRows: Array<Array<string|Object>>,
      chartData: Object | null,
      description: string | null,
    }
  ],
  assumptions: Array<string>,
  disclaimer: string,
}
```

---

## 5. Key Design Principles
- **Print-Friendly Styling**: Light theme, crisp typography, clean cards, right-aligned numeric columns, and subtle section separators.
- **Repeated Table Headers**: Large installment schedules (up to 360 rows) use CSS `@page` and `thead { display: table-header-group; }` to repeat headers across page breaks cleanly.
- **Historical Snapshot Preservation**: Loan statement reports consume stored `calculationSnapshot` properties so historical interest/principal splits are preserved even if the loan profile's interest rate changes later.
- **Estimate Labeling**: All projections (payoff date, remaining interest, SIP returns) are explicitly tagged **(Estimated)**.

# FINZO — CALCULATOR ARCHITECTURE & EXTENSION GUIDE

This document serves as the developer guide and architectural reference for the Finzo calculator platform.

---

## 1. Architectural Philosophy

Finzo enforces strict separation between calculation math, metadata, state management, and UI rendering:

```text
Pure Math & Logic (`src/calculations/`)
        ↓
Calculator Registry & Metadata (`src/calculators/`)
        ↓
Feature Hooks & Local Form State (`src/features/calculators/<category>/<calc>/hooks/`)
        ↓
Reusable UI Primitives & Result Cards (`src/components/`, `src/features/calculators/`)
```

### Core Separation Laws
1. **Calculation Engine Purity**: Files inside `src/calculations/` must NEVER import React, React Native, Redux, AsyncStorage, or UI components. All calculation math is executed using high-precision Decimal math (`decimal.js`) and formatted cleanly for display.
2. **Metadata Registry Authority**: `CALCULATOR_REGISTRY` in `src/calculators/registry/calculatorRegistry.js` is the single source of truth for calculator catalog info, icons, status, routes, popular flags, and search keywords.
3. **Local Form State vs Durable Redux**: Live form inputs (principal, interest rate, tenure, modes) remain strictly in local React state (`useState`). Redux (`savedCalculationsSlice`) only receives immutable calculation snapshots when the user explicitly saves a calculation.

---

## 2. Directory Layout & Layer Responsibilities

```text
src/
  calculators/
    registry/
      calculatorIds.js         # Standardized string IDs for all calculators
      calculatorCategories.js  # Category definitions (Loans, Investments, Business, Everyday)
      calculatorRegistry.js    # Single source of truth array of all 14 calculators
    search/
      calculatorSearch.js      # Pure JS search engine (Exact > Substring > Keyword > Description)
    index.js                   # Public metadata API methods

  calculations/
    core/                      # Math helpers (decimal.js wrapper, rounding, currency, validation)
    emi/                       # EMI loan calculation & amortization math
    sip/                       # SIP investment compounding & yearly projection math
    fd/                        # Fixed Deposit compounding schedule math
    rd/                        # Recurring Deposit monthly accumulation math
    gst/                       # GST inclusive & exclusive tax math
    interest/                  # Simple & Compound Interest compounding math
    investment/                # CAGR & ROI growth math
    percentage/                # Percentage of, change, and difference math

  features/
    home/                      # HomeScreen with greeting, search entry, popular cards, recently saved
    search/                    # CalculatorSearchScreen with search bar & category filters
    calculators/               # Category screens & 14 production calculator screens
    saved/                     # SavedScreen, SavedCalculationCard, restore adapters, Redux persistence
    share/                     # Phase 11 Share & PDF Export (Adapters, Export Model, PDF HTML Builder, Services)

  store/
    slices/
      savedCalculationsSlice.js # Durable saved calculations state (whitelisted in redux-persist)
```

---

## 3. Financial Calculation Engine API (`src/calculations/`)

All calculation functions return a standardized result object:

### Success Contract
```js
{
  success: true,
  data: {
    // Domain specific rounded display numbers
  }
}
```

### Validation Failure Contract
```js
{
  success: false,
  errors: [
    { field: 'loanAmount', message: 'Loan amount must be greater than zero' }
  ]
}
```

---

## 4. Calculator Registry Metadata (`src/calculators/`)

The calculator registry provides public helper methods:

```js
import {
  getAllCalculators,
  getCalculatorById,
  getCalculatorsByCategory,
  getPopularCalculators,
  getCalculatorCategories,
} from './src/calculators';
```

---

## 5. Production Calculator List (14 Calculators)

### Loans Category
1. **Home Loan EMI** (`home-loan-emi`)
2. **Personal Loan EMI** (`personal-loan-emi`)
3. **Car Loan EMI** (`car-loan-emi`)
4. **Education Loan EMI** (`education-loan-emi`)
5. **Business Loan EMI** (`business-loan-emi`)

### Investments Category
6. **SIP Calculator** (`sip`)
7. **Fixed Deposit (FD)** (`fd`)
8. **Recurring Deposit (RD)** (`rd`)
9. **CAGR Calculator** (`cagr`)
10. **ROI Calculator** (`roi`)

### Business Category
11. **GST Calculator** (`gst`)

### Everyday Category
12. **Simple Interest** (`simple-interest`)
13. **Compound Interest** (`compound-interest`)
14. **Percentage Calculator** (`percentage`)

---

## 6. Shared Loan Family Architecture
Location: `src/features/calculators/loans/LoanCalculatorScreen.jsx`

All 5 loan calculators share a unified, configurable screen wrapper and feature hook `useLoanCalculator(config, initialInputs)`:

```text
[Home Loan / Personal Loan / Car Loan / Education Loan / Business Loan] Config
        ↓
LoanCalculatorScreen.jsx
        ↓
useLoanCalculator()
        ↓
calculateEMI() & calculateAmortization()
```

---

## 7. Category Feature Organization

```text
src/features/calculators/
├── loans/                      → LoanCalculatorScreen.jsx (Config-driven for all 5 loan types)
├── emi/                        → EMICalculatorScreen.jsx & AmortizationSection.jsx
├── investments/sip/            → useSIPCalculator()             → calculateSIP()               → SIPResultCard & Chart
├── investments/fd/             → useFDCalculator()              → calculateFD()                → FDResultCard & Chart
├── investments/rd/             → useRDCalculator()              → calculateRD()                → RDResultCard & Chart
├── investments/cagr/           → useCAGRCalculator()            → calculateCAGR()              → CAGRResultCard
├── investments/roi/            → useROICalculator()             → calculateROI()               → ROIResultCard
├── business/gst/               → useGSTCalculator()             → calculateGST()               → GSTResultCard
├── everyday/simpleInterest/    → useSimpleInterestCalculator()    → calculateSimpleInterest()    → SimpleInterestResultCard
├── everyday/compoundInterest/  → useCompoundInterestCalculator()  → calculateCompoundInterest()  → CompoundInterestResultCard & Chart
└── everyday/percentage/        → usePercentageCalculator()        → percentageOf/Change/Diff     → PercentageResultCard
```

---

## 8. Saved Calculation & Persistence Architecture
Location: `src/store/slices/savedCalculationsSlice.js` & `src/features/saved/`

```text
Calculator Screen (Save Action)
        ↓
Save Modal (Custom Title / Update Existing / Save New)
        ↓
Snapshot Creator (createCalculationSnapshot)
        ↓
Redux Store (savedCalculationsSlice)
        ↓
Redux Persist (@react-native-async-storage/async-storage)
```

- **Snapshot Contract**: Saved items store serializable normalized inputs, calculated results, custom titles, ISO 8601 timestamps, favorite flags, and `schemaVersion: 1`.
- **Pre-Calculated Defaults**: Valid default inputs auto-calculate on mount (`isCalculated = true`, `isResultStale = false`).
- **Stale Result UX**: Editing inputs after calculation sets `isResultStale = true` and displays `StaleResultBanner`. The Save action is disabled while `isResultStale === true`.
- **Primary Result Presenter**: `getSavedCalculationPrimaryResult(savedItem)` extracts domain-specific primary metrics (EMI, Maturity Amount, CAGR %, GST total) for list card rendering.
- **Input Restoration**: Opening a saved item from `SavedScreen` or `HomeScreen` navigates to its calculator route passing `savedCalculation: item` in params to populate initial hook inputs and perform a fresh calculation.

---

## 9. Calculator Search Architecture
Location: `src/calculators/search/calculatorSearch.js` & `src/features/search/CalculatorSearchScreen.jsx`

- **Registry-Driven Engine**: Pure JS function `searchCalculators(query, calculators, categoryFilter)` operating on `CALCULATOR_REGISTRY` metadata. Zero third-party search dependencies.
- **Ranking Priority**: Exact Name Match > Prefix Match > Substring Match > Keyword Match > Description Match > Category Match.
- **Search UI**: `CalculatorSearchScreen.jsx` with auto-focusing search bar, clear button, category filter chips (`All`, `Loans`, `Investments`, `Business`, `Everyday`), results count, and empty state.

---

## 10. Home Dashboard Architecture
Location: `src/features/home/HomeScreen.jsx`

- **Search Bar Entry**: Prominent search bar navigating directly to `ROUTES.CALCULATOR_SEARCH`.
- **Popular Calculators**: Dynamically rendered via `getPopularCalculators()`.
- **Categories Grid**: Dynamically rendered via `getCalculatorCategories()`.
- **Recently Saved Section**: Displays top 3 saved items from Redux `selectSavedCalculations`; automatically hidden when zero saved items exist.

---

## 11. Step-by-Step Guide: Adding a New Calculator

To add a new calculator in future phases:

1. **Add Calculator ID**: Add identifier in `src/calculators/registry/calculatorIds.js`.
2. **Add Navigation Route**: Add route constant in `src/navigation/routes.js`.
3. **Register Route in Navigator**: Import screen component in `src/navigation/RootNavigator.jsx`.
4. **Create Feature Folder**: Create dedicated directory under `src/features/calculators/<category>/<calculatorName>/`.
5. **Create Feature Hook**: Create custom hook managing local inputs, validating using Phase 3 validation, calling Phase 3 formulas, and exposing `isResultStale`.
6. **Create Screen Component**: Build screen using `ScreenContainer`, `AppHeader`, `CalculatorInputSection`, `CalculatorResultSection`, `StaleResultBanner`, and `SaveModal`.
7. **Add Unit Tests**: Create `use<CalculatorName>.test.js` under `__tests__/`.
8. **Update Registry Metadata**: In `src/calculators/registry/calculatorRegistry.js`, set `route: ROUTES.<ROUTE_KEY>` and `status: CALCULATOR_STATUS.AVAILABLE`.
9. **Verify**: Run `npm run lint` and `npm test`.

---

## 12. Reports & PDF Export Architecture (Phase 16.9)
Location: `src/features/reports/`

```text
Existing Calculation Engine / Saved Snapshot / Loan Ledger
        ↓
Report Adapters (getCalculatorReportAdapter / getLoanReportAdapter)
        ↓
Normalized Internal Report Model (createReportModel)
        ↓
PDF HTML Renderer (buildReportPdfHtml & pdfStyles.js)
        ↓
RNHTMLtoPDF (generateReportPdf) → Local PDF File
        ↓
Native System Share Sheet (shareReportPdf)
```

- **Calculator Report Coverage**: Adapters cover all 10 calculators (EMI with 360-month amortization schedule, SIP with growth table, FD, RD, CAGR, ROI with positive/negative indicators, GST inclusive/exclusive, Simple Interest, Compound Interest, Percentage).
- **Loan Report Coverage**: Loan Summary, Loan Statement (with full payment ledger & snapshot preservation), and Loan Insights.
- **100% Offline & Private**: All PDFs are generated on-device. No cloud upload, no network calls, no external server dependency.


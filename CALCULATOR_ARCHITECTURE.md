# Finzo — Calculator Architecture Guide

This document outlines the system architecture for financial calculators in the Finzo codebase. It defines the contracts, boundaries, registry patterns, and step-by-step instructions for adding new calculators.

---

## 1. High-Level Architectural Flow

```text
Calculator Registry (Discovery & Metadata)
        ↓
Navigation Routes & Stacks
        ↓
Calculator Feature Screen (UI Layout)
        ↓
Calculator Feature Hook (Local Form State & Validation)
        ↓
Phase 3 Calculation Engine (Pure Math Functions)
```

---

## 2. Calculation Engine Boundary Laws
- **Pure Math**: Financial formulas reside under `src/calculations/`. They are pure JavaScript functions that NEVER import React, React Native, Redux, or UI elements.
- **Local Hook State**: Calculator form state (live input values, interest rates, tenures) lives strictly inside feature hooks (e.g. `useGSTCalculator.js`). Zero transient form state is placed into Redux or `redux-persist`.
- **No Direct Formula Calls from UI**: Screen components interact exclusively with their feature hook; they do not call math formulas directly.

---

## 3. Calculator Registry System
Location: `src/calculators/`

- **Single Source of Truth**: `CALCULATOR_REGISTRY` contains all discovery metadata for cataloging, search, navigation, and category grouping across `HomeScreen` and `CalculatorsScreen`.
- **Metadata Contract**:
  - `id`: Stable string identifier (from `CALCULATOR_IDS`)
  - `name`: Display title (e.g., `'Goods & Services Tax'`)
  - `shortName`: Abbreviated title (e.g., `'GST Calculator'`)
  - `description`: Subtitle explanation of functionality
  - `category`: Domain category ID (from `CATEGORY_IDS`)
  - `icon`: Lucide icon component
  - `route`: Navigation route constant (from `ROUTES`) or `null` for coming soon
  - `status`: `'available'` | `'comingSoon'`
  - `popular`: Boolean flag for home screen featuring
  - `keywords`: Array of search terms

---

## 4. Reusable Calculator Primitives
Location: `src/components/calculator/`

- **`CalculatorInputSection`**: Card container for grouping input fields with title & subtitle.
- **`CalculatorResultSection`**: Container for output metrics, breakdown charts, and summary rows.
- **`CalculatorSummaryRow`**: Key-value metric row supporting bolding and highlight states.
- **`CalculatorActionBar`**: Standard primary/secondary/save button row (e.g., Calculate, Reset & Save).
- **`StaleResultBanner`**: Subtle notification banner displayed above results when inputs are edited post-calculation.

---

## 5. Loan Calculator Family Architecture
Location: `src/features/calculators/loans/`

All 5 loan calculators (**Home Loan**, **Personal Loan**, **Car Loan**, **Education Loan**, **Business Loan**) share a unified architecture:

```text
Loan Calculator Screen (LoanCalculatorScreen.jsx)
        ↓
Loan Preset Config (loanConfigs.js)
        ↓
Generic Loan Hook (useLoanCalculator.js)
        ↓
Phase 3 Math Engine (calculateEMI & calculateAmortization)
```

---

## 6. Investment Calculator Family Architecture
Location: `src/features/calculators/investments/`

The 5 investment calculators (**SIP**, **FD**, **RD**, **CAGR**, and **ROI**) have materially distinct mathematical models. Each calculator uses a dedicated hook while reusing shared UI primitives:

```text
src/features/calculators/investments/
├── sip/   → useSIPCalculator()   → calculateSIP()   → SIPResultCard & SIPBreakdownChart
├── fd/    → useFDCalculator()    → calculateFD()    → FDResultCard & FDBreakdownChart
├── rd/    → useRDCalculator()    → calculateRD()    → RDResultCard & RDBreakdownChart
├── cagr/  → useCAGRCalculator()  → calculateCAGR()  → CAGRResultCard
└── roi/   → useROICalculator()   → calculateROI()   → ROIResultCard
```

---

## 7. Tax & General Financial Calculator Architecture
Location: `src/features/calculators/business/` & `src/features/calculators/everyday/`

The 4 tax and general financial calculators (**GST**, **Simple Interest**, **Compound Interest**, and **Percentage**) support domain-specific modes and frequencies:

```text
src/features/calculators/
├── business/gst/               → useGSTCalculator()               → calculateGST()               → GSTResultCard
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
- **Input Restoration**: Opening a saved item from `SavedScreen` navigates to its calculator route passing `savedCalculation: item` in params to populate initial hook inputs.

---

## 9. Step-by-Step Guide: Adding a New Calculator

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

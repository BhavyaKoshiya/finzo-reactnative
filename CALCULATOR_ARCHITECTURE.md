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
- **Local Hook State**: Calculator form state (live input values, interest rates, tenures) lives strictly inside feature hooks (e.g. `useSIPCalculator.js`). Zero transient form state is placed into Redux or `redux-persist`.
- **No Direct Formula Calls from UI**: Screen components interact exclusively with their feature hook; they do not call math formulas directly.

---

## 3. Calculator Registry System
Location: `src/calculators/`

- **Single Source of Truth**: `CALCULATOR_REGISTRY` contains all discovery metadata for cataloging, search, navigation, and category grouping across `HomeScreen` and `CalculatorsScreen`.
- **Metadata Contract**:
  - `id`: Stable string identifier (from `CALCULATOR_IDS`)
  - `name`: Display title (e.g., `'Systematic Investment Plan'`)
  - `shortName`: Abbreviated title (e.g., `'SIP Calculator'`)
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
- **`CalculatorActionBar`**: Standard primary/secondary button row (e.g., Calculate & Reset).

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

- **Dedicated Hooks**: Each investment calculator owns its local inputs, validation, calculation trigger, and reset logic.
- **Zero Math Duplication**: All investment calculators execute pure Phase 3 formulas.
- **Non-Guaranteed Language**: Results use neutral, non-guaranteed wording (e.g. "Estimated Future Value", "Estimated Returns", "Maturity Amount").

---

## 7. Step-by-Step Guide: Adding a New Calculator (e.g. GST)

To add a new calculator (e.g., GST) in future phases:

1. **Add Calculator ID**:
   Add `GST: 'gst'` in `src/calculators/registry/calculatorIds.js`.
2. **Add Navigation Route**:
   Add `GST_CALCULATOR: 'GSTCalculator'` in `src/navigation/routes.js`.
3. **Register Route in Navigator**:
   Import `GSTCalculatorScreen` in `src/navigation/RootNavigator.jsx`.
4. **Create Feature Folder**:
   Create `src/features/calculators/business/gst/`.
5. **Create Feature Hook**:
   Create `useGSTCalculator.js` managing local inputs, validating using Phase 3 `validateGSTInput()`, and calling Phase 3 `calculateGST()`.
6. **Create Screen Component**:
   Build `GSTCalculatorScreen.jsx` using `ScreenContainer`, `AppHeader`, `CalculatorInputSection`, `CalculatorResultSection`, and `CalculatorActionBar`.
7. **Add Unit Tests**:
   Create `useGSTCalculator.test.js` under `src/features/calculators/business/gst/__tests__/`.
8. **Update Registry Metadata**:
   In `src/calculators/registry/calculatorRegistry.js`, update the GST entry:
   - Change `route: ROUTES.GST_CALCULATOR`
   - Change `status: CALCULATOR_STATUS.AVAILABLE`
9. **Verify**:
   Run `npm run lint` and `npm test`. The registry will automatically expose GST on `HomeScreen` and `CalculatorsScreen` without modifying tab screens!

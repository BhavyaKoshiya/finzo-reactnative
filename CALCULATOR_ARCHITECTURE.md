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
- **Local Hook State**: Calculator form state (live input values, interest rates, tenures) lives strictly inside feature hooks (e.g. `useLoanCalculator.js`). Zero transient form state is placed into Redux or `redux-persist`.
- **No Direct Formula Calls from UI**: Screen components interact exclusively with their feature hook; they do not call math formulas directly.

---

## 3. Calculator Registry System
Location: `src/calculators/`

- **Single Source of Truth**: `CALCULATOR_REGISTRY` contains all discovery metadata for cataloging, search, navigation, and category grouping across `HomeScreen` and `CalculatorsScreen`.
- **Metadata Contract**:
  - `id`: Stable string identifier (from `CALCULATOR_IDS`)
  - `name`: Display title (e.g., `'Home Loan EMI'`)
  - `shortName`: Abbreviated title (e.g., `'EMI Calculator'`)
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
- **`CalculatorResultSection`**: Container for output metrics, breakdown charts, and amortization schedules.
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

- **Zero Math Duplication**: All loan calculators execute pure Phase 3 `calculateEMI` and `calculateAmortization`.
- **Configurable Defaults**: Each loan type defines realistic presets (e.g. ₹10L @ 8.5% for Home, ₹5L @ 12% for Personal, ₹8L @ 9% for Car, ₹10L @ 9% for Education, ₹10L @ 11% for Business).

---

## 6. Step-by-Step Guide: Adding a New Calculator (e.g. SIP)

To add a new calculator (e.g., SIP) in future phases:

1. **Add Calculator ID**:
   Add `SIP: 'sip'` in `src/calculators/registry/calculatorIds.js`.
2. **Add Navigation Route**:
   Add `SIP_CALCULATOR: 'SIPCalculator'` in `src/navigation/routes.js`.
3. **Register Route in Navigator**:
   Import `SIPCalculatorScreen` in `src/navigation/RootNavigator.jsx`.
4. **Create Feature Folder**:
   Create `src/features/calculators/sip/`.
5. **Create Feature Hook**:
   Create `useSIPCalculator.js` managing local inputs, validating using Phase 3 `validateSIPInput()`, and calling Phase 3 `calculateSIP()`.
6. **Create Screen Component**:
   Build `SIPCalculatorScreen.jsx` using `ScreenContainer`, `AppHeader`, `CalculatorInputSection`, `CalculatorResultSection`, and `CalculatorActionBar`.
7. **Add Unit Tests**:
   Create `useSIPCalculator.test.js` under `src/features/calculators/sip/__tests__/`.
8. **Update Registry Metadata**:
   In `src/calculators/registry/calculatorRegistry.js`, update the SIP entry:
   - Change `route: ROUTES.SIP_CALCULATOR`
   - Change `status: CALCULATOR_STATUS.AVAILABLE`
9. **Verify**:
   Run `npm run lint` and `npm test`. The registry will automatically expose SIP on `HomeScreen` and `CalculatorsScreen` without modifying tab screens!

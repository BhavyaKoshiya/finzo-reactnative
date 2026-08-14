# Finzo — UX & Visual Standards Specification (Phase 18)

This document specifies Finzo's UI hierarchy, empty states, loading indicators, error handling, typography, spacing, card design tokens, accessibility rules, and terminology.

---

## 1. Unified Terminology Standards

To maintain coherent product communication, Finzo strictly uses the following vocabulary across all screens:

- **`Outstanding Principal`**: Current unpaid balance on a loan profile (Primary metric).
- **`Total Loan Amount`**: Historical original principal borrowed (Secondary metric).
- **`Principal Paid`**: Cumulative principal paid to date.
- **`Monthly EMI`**: Scheduled monthly installment amount.
- **`Payment`**: Any recorded payment transaction.
- **`Prepayment`**: Lump-sum payment applied directly to reduce principal.
- **`Bank Confirmed`**: Balance anchor updated directly from official lender statements.
- **`Finzo Estimate`**: Outstanding balance calculated automatically from payment ledger history.
- **`Ad-Free`**: Active entitlement pausing ordinary banner/native/interstitial ads.

---

## 2. Metric Hierarchy Standards

Summary cards (`LoanDashboardSummary.jsx`, `LoanDetailsScreen.jsx`) MUST adhere to the following visual hierarchy:

```
[ Hero Metric ]
OUTSTANDING PRINCIPAL
₹25,00,000  (fontSize: 28, fontWeight: '800')

[ Secondary Grid ]
Total Loan Amount          Monthly EMI
₹35,00,000                 ₹31,266 / mo

[ Progress Bar ]
₹10,00,000 principal paid (28.57%)
```

---

## 3. Empty States & Useful CTAs

Every list view features a branded empty state component containing:
1. **Icon**: Relevant Lucide icon.
2. **Title**: Concise state header (`No Loans Yet`, `No Payments Recorded Yet`, `No Notes Saved`).
3. **Description**: Non-technical explanation.
4. **Primary CTA**: Action button leading directly to creation flow.

---

## 4. Financial Workflow Protection & Ad Boundaries

To preserve user trust, sensitive financial tasks are **100% ad-free**:
- `Add Loan` / `Edit Loan`
- `Record Payment` / `Edit Payment` / `Delete Payment`
- `Correct Balance`
- `Prepayment Simulator` / `Payoff Planner`
- `Loan Goals`
- `Private Details` / `Private Notes`
- `PDF Generation` & `PDF Export`
- `Destructive Confirmations`

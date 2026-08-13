# LOAN LEDGER ARCHITECTURE — FINZO

This document details the architectural specifications, balance anchor models, ledger versioning, historical calculation snapshots, and current reconstruction engine for **Loan Ledger Hardening** in Finzo.

---

## 1. ARCHITECTURAL PRINCIPLES & SOURCE OF TRUTH

Finzo distinguishes between three distinct data categories:
1. **User Facts**: User-reported inputs such as original loan amount, loan start date, interest rate, and configured EMI.
2. **Bank-Confirmed Anchors**: Explicit bank balance entries (`balanceSource: 'bank_confirmed'`) verified by the user.
3. **Finzo Estimates**: Finzo's chronological calculation projections (`balanceSource: 'estimated'`) based on payment history replay.

---

## 2. BALANCE TERMINOLOGY & DATA FIELDS

| Field | Type | Description |
| :--- | :--- | :--- |
| `originalPrincipal` | `number` | Original principal loan amount entered during profile setup. |
| `currentOutstandingPrincipal` | `number` | Current active balance (bank-confirmed if available, otherwise Finzo estimate). |
| `userConfirmedBalance` | `number \| null` | Most recent bank-confirmed balance entered by user. |
| `balanceSource` | `'bank_confirmed' \| 'estimated'` | Indicator of current balance confidence. |
| `lastBalanceConfirmationDate` | `string \| null` | ISO date of last balance confirmation. |
| `ledgerVersion` | `number` | Incrementing integer counter tracking material ledger mutations. |

---

## 3. BALANCE ANCHOR ARCHITECTURE

A **Balance Anchor** is a trusted balance checkpoint that serves as the starting point for all subsequent payment replay calculations:

```
[ Balance Anchor ]
       ↓
[ Chronological Payments / Prepayments Replay ]
       ↓
[ Finzo Estimated Outstanding Balance ]
```

### Anchor Resolution Hierarchy (`getPaymentBalanceAnchor`):
1. **Latest Bank-Confirmed Payment**: If any payment record contains `balanceSource: 'bank_confirmed'` with a valid `actualClosingBalance`, it serves as the anchor.
2. **Loan Profile Bank Confirmation**: `loan.userConfirmedBalance` if specified.
3. **Original Setup Principal**: `loan.originalPrincipal` as the baseline.

---

## 4. IMMUTABLE CALCULATION SNAPSHOTS

Each payment record preserves an explicit `calculationSnapshot` object:

```json
{
  "annualRate": 8.5,
  "interestMethod": "monthly_reducing",
  "openingBalance": 742500,
  "estimatedInterest": 5259,
  "estimatedPrincipal": 16191,
  "estimatedClosingBalance": 726309
}
```

- **Immutability**: Editing the loan's interest rate in the future does **NOT** rewrite past payment calculation snapshots.
- **Reconstruction**: Current projections replay remaining payments from the active balance anchor using the prevailing rate for current calculations.

---

## 5. LEDGER VERSIONING (`ledgerVersion`)

Each loan profile maintains a lightweight integer `ledgerVersion`:
- Initialized to `1` on loan profile creation.
- Incremented on:
  - Adding a payment
  - Deleting a payment
  - Updating a payment
  - Correcting loan balance (`correctLoanBalance`)

---

## 6. CENTRAL BALANCE HELPER (`getCurrentLoanBalance`)

All UI screens consume the single authoritative helper:

```javascript
import { getCurrentLoanBalance } from '../utils/paymentBalanceUtils';

const balanceState = getCurrentLoanBalance(loanProfile, payments);
// Returns:
// {
//   currentBalance: 726050,
//   balanceSource: 'bank_confirmed',
//   isBankConfirmed: true,
//   lastConfirmedDate: '2026-08-12T00:00:00.000Z',
//   ledgerVersion: 3
// }
```

---

## 7. PAYMENT CORRECTION & ACTUAL BANK VALUES (PHASE 16.4)

Users may optionally provide actual bank statement figures:
- `actualInterest`: Bank statement interest charge.
- `actualPrincipal`: Bank statement principal deduction.
- `actualClosingBalance`: Exact closing balance on bank receipt.
- **Bank-Confirmed Toggle**: Explicit user confirmation sets `balanceSource = 'bank_confirmed'`, establishing a new active balance anchor for future payment replays.
- **Preservation of Estimates**: Finzo's original `calculationSnapshot` is never overwritten when actual bank values are entered; both remain preserved and auditable.

---

## 9. PREPAYMENT SIMULATION & WHAT-IF ANALYSIS (PHASE 16.5)

- **Pure Read-Only Engine**: `simulateLoanPrepayment` runs hypothetical lump-sum prepayments under **Reduce Tenure** or **Reduce EMI** strategies without mutating `loanProfilesSlice`, `loanPaymentsSlice`, or `AsyncStorage`.
- **Anchor Consistency**: Simulations resolve starting balance directly from `getCurrentLoanBalance(loan, payments)` (respecting bank-confirmed anchors).
- **Recording Transition**: Tapping "Record this prepayment" routes to `AddPaymentScreen` with pre-filled `paymentType = 'prepayment'` and simulated amount, preserving the Phase 16.4 payment recording flow as the single source of truth.

---

## 10. LOAN INSIGHTS & ANALYTICS CONSUMPTION (PHASE 16.8)

- **Pure Read-Only Consumption**: `loanInsightUtils` consumes ledger state exclusively via `getCurrentLoanBalance(loan, payments)` and `sortPaymentsChronologically(payments)`.
- **Snapshot Fidelity**: Cumulative principal and interest analytics consume stored `calculationSnapshot` values and bank-confirmed actual figures without recalculating historical records at current interest rates.
- **Zero Mutation**: Insight calculations do not alter `ledgerVersion`, balance anchors, or recorded payment structures.

---

## 11. FINANCIAL REPORTS & PDF STATEMENT EXPORT (PHASE 16.9)

- **Statement Generation**: `buildLoanStatementReport` formats full payment ledgers into print-friendly PDF reports.
- **Ledger Fidelity**: PDF statements preserve `calculationSnapshot` values for past payments and display explicit badge tags for Regular EMI, Prepayment, Balance Correction, and Custom Payments.
- **100% Offline & Private**: Reports are generated on-device and shared via native system share sheet without cloud uploads or external network calls.

---

## 12. PAYOFF PLANNER & WHAT-IF SCENARIO ENGINE (PHASE 16.11)

- **Strict Non-Mutation Guarantee**: `loanScenarioEngine.js` performs temporary in-memory simulations (Extra Monthly Payment, Increased EMI, Lump Sum Prepayment, Multiple Prepayments, Target Payoff Date). It **NEVER** mutates `loanProfilesSlice`, `loanPaymentsSlice`, `ledgerVersion`, or past payment `calculationSnapshot` objects.
- **Active Balance Anchor Resolution**: All scenario calculations start from `getCurrentLoanBalance(loan, payments)` to respect bank-confirmed balance anchors.
- **Zero Ledger Side Effects**: Scenario execution generates read-only comparative metrics (`formattedTenureReduction`, `estimatedInterestAvoided`) without writing to AsyncStorage or scheduling local notifications.

---

## 13. LOAN GOALS & PROGRESS TRACKING (PHASE 16.12)

- **Read-Only Ledger Consumer**: `loanGoalUtils.js` derives progress dynamics strictly by reading actual payments recorded in `loanPaymentsSlice` and evaluating balances via `getCurrentLoanBalance(loan, payments)`.
- **Zero Ledger Side Effects**: Saving, updating, pausing, or deleting a loan goal **NEVER** creates payment records, alters loan balance, or increments `ledgerVersion`.
- **Baseline Snapshot Fidelity**: Informational `baselineSnapshot` objects preserve historical setup parameters without overriding `getCurrentLoanBalance()` as the single source of truth for active loan balances.



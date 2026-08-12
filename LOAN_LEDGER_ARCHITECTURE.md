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

## 7. PRIVACY & LOCAL DATA BOUNDARIES

- **100% Offline**: All ledger records reside strictly in `@react-native-async-storage/async-storage` via `redux-persist`.
- **Zero Cloud Leakage**: No loan balances, payment history, interest rates, or financial payloads are transmitted to Firebase or remote services.
- **Log Privacy**: System logs contain technical events only without financial amounts.

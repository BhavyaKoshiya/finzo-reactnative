# LOAN PAYMENT ARCHITECTURE — FINZO

This document details the architectural principles, data models, state management, balance snapshot policies, interest/principal breakdown calculation models, bank balance correction flows, payment deletion replay algorithms, and local privacy rules for **Loan Payment History & Balance Tracking** in Finzo.

---

## 1. ARCHITECTURAL PRINCIPLES & BALANCE SOURCE MODEL

1. **Estimated Interest & Principal Allocation**:
   For regular EMI payments (`regular_emi`) and custom payments (`custom_payment`), Finzo computes:
   $$\text{Estimated Monthly Interest} = \text{round}\left( \text{Opening Balance} \times \frac{\text{Annual Interest Rate}}{100 \times 12} \right)$$
   $$\text{Estimated Principal Paid} = \max(0, \text{Payment Amount} - \text{Estimated Monthly Interest})$$
   $$\text{Estimated Closing Balance} = \max(0, \text{Opening Balance} - \text{Estimated Principal Paid})$$
2. **Prepayment Allocation**:
   Prepayments (`prepayment`) are 100% principal reductions ($\text{Estimated Interest} = 0$, $\text{Principal Paid} = \text{Payment Amount}$).
3. **Bank Balance Override & Confirmation**:
   When a user supplies an actual bank balance (`[ Use Bank Balance ]`), `balanceSource: 'bank_confirmed'` is set on the loan profile. All future payment calculations begin from this bank-confirmed starting balance.
4. **Immutable Payment History Snapshots**:
   Each payment record preserves an immutable snapshot (`openingBalance`, `estimatedInterest`, `estimatedPrincipal`, `estimatedClosingBalance`, `actualClosingBalance`, `balanceSource`). Correcting the loan balance later does **NOT** rewrite past payment records.
5. **100% Offline & Private**:
   All payment records and balance snapshots reside strictly on the user's local device (`redux-persist` + `@react-native-async-storage/async-storage`). Zero payment data is uploaded to cloud backends, Firebase, or analytics.

---

## 2. PAYMENT DATA MODEL (`schemaVersion: 1`)

Each payment record is represented by a normalized object created via `createLoanPayment()`:

```json
{
  "id": "payment_1786523456_a1b2c3",
  "schemaVersion": 1,
  "loanId": "loan_1786520000_x9y8z7",
  "amount": 21450,
  "paymentAmount": 21450,
  "paymentDate": "2026-08-15",
  "paymentType": "regular_emi",
  "principalAmount": 16184,
  "estimatedPrincipal": 16184,
  "interestAmount": 5266,
  "estimatedInterest": 5266,
  "feesAmount": 0,
  "outstandingBefore": 742500,
  "openingBalance": 742500,
  "outstandingAfter": 726316,
  "estimatedClosingBalance": 726316,
  "actualClosingBalance": 726050,
  "balanceSource": "bank_confirmed",
  "balanceUpdated": true,
  "note": "Receipt #SBI-884219",
  "createdAt": "2026-08-15T10:00:00.000Z",
  "updatedAt": "2026-08-15T10:00:00.000Z"
}
```

---

## 3. SUPPORTED PAYMENT TYPES (`loanPaymentConstants.js`)

| Key | Value | Label | Badge Color | Icon (`lucide-react-native`) |
| :--- | :--- | :--- | :--- | :--- |
| `REGULAR_EMI` | `regular_emi` | Regular EMI | `#3B82F6` (Blue) | `Wallet` |
| `CUSTOM_PAYMENT` | `custom_payment` | Custom Payment | `#8B5CF6` (Purple) | `HelpCircle` |
| `PREPAYMENT` | `prepayment` | Prepayment | `#10B981` (Green) | `ArrowDownCircle` |

---

## 4. REDUX STATE MANAGEMENT & PERSISTENCE

### Redux Slice (`src/store/slices/loanPaymentsSlice.js`)

```javascript
initialState = {
  payments: [],
  schemaVersion: 1,
}
```

#### Redux Actions:
- `addPayment`: Adds a new payment record.
- `updatePayment`: Updates an existing payment record by ID.
- `deletePayment`: Deletes a payment record by ID.
- `deletePaymentsForLoan`: Deletes all payment records linked to a `loanId`.
- `deleteLoanPaymentWithRecalculation`: Thunk action that deletes a payment, chronologically replays remaining payments from the active balance anchor, updates affected payment snapshots, and updates the loan's current estimated outstanding balance.

#### Persistence Whitelist (`src/store/index.js`)
`whitelist: ['settings', 'savedCalculations', 'rewards', 'loanProfiles', 'loanPayments']`

---

## 5. BALANCE SNAPSHOTS & TIMELINE UTILITIES

### Balance Snapshot Utilities (`src/features/loans/utils/loanBalanceUtils.js`)

- `calculateEmiBreakdown(params)`: Computes interest/principal split and estimated closing balance for regular EMIs, custom payments, and prepayments.
- `getBalanceHistory(payments, loanId)`: Filters payments containing `outstandingAfter` and produces chronological balance snapshots.
- `getLatestKnownBalance(payments, loanId)`: Returns the most recent `outstandingAfter` balance recorded.
- `groupPaymentsByMonth(payments)`: Groups payment records into monthly timeline sections (`"August 2026"`, `"July 2026"`) using `date-fns`.
- `getPaymentStats(payments, loanId)`: Computes Total Paid, Payment Count, EMI Count, Prepayment Count, Total EMI Paid, Total Prepaid, and Latest Payment info.

---

## 6. PAYMENT DELETION & BALANCE RECALCULATION (`paymentBalanceUtils.js`)

### Why `currentBalance + paymentAmount` is Never Used:
1. **Interest vs Principal**: A payment amount consists of both interest and principal reduction. Raw addition (`currentBalance + paymentAmount`) incorrectly adds back interest that never reduced principal.
2. **Timeline Dependency**: Subsequent payments depend on the opening balance created by earlier payments. Deleting a first or middle payment alters the interest calculation for all later payments.

### Replay Rebuild Algorithm (`recalculateLoanBalanceFromPayments`):
1. **Balance Anchor Identification**:
   - Locates the latest valid `bank_confirmed` balance anchor.
   - Payments occurring after the confirmed anchor are replayed starting from that confirmed balance.
   - Payments before a bank-confirmed anchor are not re-estimated in a way that mathematically alters the confirmed anchor.
2. **Deterministic Chronological Sorting**:
   - Sorts remaining payments by `paymentDate` (asc) $\rightarrow$ `createdAt` (asc) $\rightarrow$ `id` (asc).
3. **Sequential Replay**:
   - Replays remaining payments (`regular_emi`, `custom_payment`, `prepayment`) in sequence.
   - Computes live interest/principal allocations based on the opening balance at each step.
   - Updates `outstandingBefore`, `principalAmount`, `interestAmount`, and `outstandingAfter` for affected subsequent payment snapshots.
   - Clamps closing balances to $\ge 0$.
4. **Loan Profile Update**:
   - Updates `loanProfilesSlice` with the final recalculated `currentOutstandingPrincipal`.

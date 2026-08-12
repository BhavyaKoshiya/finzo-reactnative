# LOAN PROFILE ARCHITECTURE — FINZO

This document details the architectural boundaries, data model, state management, validation rules, presentation adapters, and privacy policies for the **Real User Loan Profiles, Payment History & Balance Correction Correction System** in Finzo.

---

## 1. ARCHITECTURAL SEPARATION & DOMAIN BOUNDARIES

Finzo maintains a strict separation between two distinct financial domains:

```
                  ┌─────────────────────────────────────────────────┐
                  │                 FINZO APP                       │
                  └────────────────────────┬────────────────────────┘
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
┌───────────────────────────┐                               ┌───────────────────────────┐
│   CALCULATOR LOANS (A)    │                               │     REAL USER LOANS (B)   │
│ src/features/calculators/ │                               │    src/features/loans/    │
├───────────────────────────┤                               ├───────────────────────────┤
│ • Hypothetical "What-If"  │                               │ • Real-world existing     │
│   loan projections        │                               │   loans owed by the user  │
│ • No durable entity ID    │                               │ • Stored in Redux &       │
│   persisted via AsyncStorage│                               │ • Persisted via AsyncStorage│
│ • Isolated pure math      │                               │ • Bank-confirmed or       │
│ • Never auto-overwrites   │                               │   estimated user balance  │
│   real user loan profiles │                               │                           │
└───────────────────────────┘                               └───────────────────────────┘
```

> **Primary Workspace Note**: My Loans is the primary user-facing workspace for accessing real loan profiles.

### Key Policy Laws:
1. **Separation of Concerns**: `src/features/calculators/loans/` and `src/features/loans/` operate as separate modules with zero cross-side-effect dependencies.
2. **User Data Authority & Bank Confirmation**: Finzo distinguishes between `bank_confirmed` balance and `estimated` balance. When a user enters an actual bank balance, it overrides Finzo's estimate and serves as the starting balance for future payments.
3. **Local-First Privacy**: User loan profiles and payment histories exist strictly on the user's physical device via `redux-persist` + `@react-native-async-storage/async-storage`. Firebase RTDB remains configuration-only. No user loan data is ever uploaded to any cloud backend or analytics.

---

## 2. DATA MODEL & SCHEMA (`schemaVersion: 1`)

Each user loan profile is represented by a normalized JavaScript object created via `createLoanProfile()`:

```json
{
  "id": "loan_1786523456_a9b8c7",
  "schemaVersion": 1,
  "name": "My Home Loan",
  "loanType": "home_loan",
  "lenderName": "SBI",
  "originalPrincipal": 1000000,
  "currentOutstandingPrincipal": 742500,
  "annualInterestRate": 8.5,
  "emiAmount": 21450,
  "balanceSource": "bank_confirmed",
  "userConfirmedBalance": 742500,
  "originalTenure": {
    "value": 60,
    "unit": "months"
  },
  "remainingTenure": {
    "value": 42,
    "unit": "months"
  },
  "loanStartDate": "2024-02-15",
  "nextEmiDate": "2026-08-15",
  "emiFrequency": "monthly",
  "processingFee": 5000,
  "notes": "Branch: MG Road. Acc #12345678",
  "isPrimary": true,
  "status": "active",
  "createdAt": "2026-08-12T08:10:00.000Z",
  "updatedAt": "2026-08-12T08:10:00.000Z"
}
```

### Invariants:
- All monetary amounts (`originalPrincipal`, `currentOutstandingPrincipal`, `emiAmount`, `processingFee`) are stored as **pure high-precision numbers**. Currency formatting (`₹7,42,500`) is applied strictly at presentation time.
- Dates are stored as ISO calendar strings (`YYYY-MM-DD`).

---

## 3. PAYMENT HISTORY & BALANCE CORRECTION INTEGRATION

- **Redux Slice**: `loanPaymentsSlice.js` whitelisted in `redux-persist`.
- **Payment Types**: `regular_emi`, `custom_payment`, `prepayment`.
- **Balance Sources**: `estimated` vs `bank_confirmed`.
- **Immutable Payment Snapshots**: Each payment record preserves an immutable snapshot (`openingBalance`, `estimatedInterest`, `estimatedPrincipal`, `estimatedClosingBalance`, `balanceSource`). Correcting current loan balance never alters historical payment records.
- **Bank Balance Confirmation**: `correctLoanBalance` action sets `currentOutstandingPrincipal = bankBalance` and `balanceSource = 'bank_confirmed'`.
- **Orphan Payment Cleanup**: Deleting a loan profile dispatches `deletePaymentsForLoan(loanId)` to clean up associated payments.

---

## 4. SCHEDULED EMI VS. ACTUAL PAYMENT AMOUNT (PHASE 16.4)

- **`loan.emiAmount`**: Stores the scheduled monthly commitment for the loan profile.
- **Actual Payment Amount**: Recording a payment with a different amount (e.g. ₹22,000 paid vs ₹21,450 scheduled) **NEVER** updates `loan.emiAmount`.
- **Fast Recording Shortcut**: A `"Use scheduled EMI"` option pre-fills `loan.emiAmount` on recording forms while keeping actual paid amount overrides distinct.

---

## 5. REDUX STATE MANAGEMENT & PERSISTENCE

### Redux Slices:
- `loanProfilesSlice.js` (`profiles: []`)
- `loanPaymentsSlice.js` (`payments: []`)

#### Persistence Whitelist (`src/store/index.js`)
`whitelist: ['settings', 'savedCalculations', 'rewards', 'loanProfiles', 'loanPayments']`

---

## 6. VALIDATION RULES (`loanProfileValidation.js`)

| Field | Rule | Error Message |
| :--- | :--- | :--- |
| `name` | Required, non-empty, max 50 chars | "Loan name is required." |
| `loanType` | Must be supported in `LOAN_TYPES` | "Please select a valid loan type." |
| `originalPrincipal` | `> 0` | "Original loan amount must be greater than zero." |
| `currentOutstandingPrincipal` | `>= 0`, `<= originalPrincipal` | "Current outstanding cannot exceed original loan amount." |
| `annualInterestRate` | `>= 0`, `<= 100` | "Interest rate cannot be negative." |
| `emiAmount` | `> 0` | "Monthly EMI amount must be greater than zero." |
| `originalTenure` | `> 0` | "Original tenure must be greater than zero." |
| `remainingTenure` | `>= 0`, `<= originalTenure` | "Remaining tenure cannot exceed original tenure." |
| `loanStartDate` | Valid ISO date string | "Please select a valid loan start date." |
| `nextEmiDate` | Valid ISO date string | "Please select a valid next EMI date." |
| `processingFee` | `>= 0` | "Processing fee cannot be negative." |

---

## 7. CALENDAR & DATE HANDLING (`loanDateUtils.js`)

All date comparisons use `date-fns` calendar-safe functions:
- `getNextEmiInfo(nextEmiDate)` computes:
  - `daysUntilPayment`: Difference in calendar days from today.
  - `isDueToday`: `daysUntilPayment === 0`
  - `isPastDue`: `daysUntilPayment < 0`
  - `isUpcoming`: `daysUntilPayment > 0`
  - `formattedDate`: `dd MMM yyyy` (e.g. `15 Aug 2026`).

---

## 8. DASHBOARD METRICS & REPAYMENT PROGRESS

### Principal Progress Formula:
$$\text{Principal Repaid} = \max(0, \text{originalPrincipal} - \text{currentOutstandingPrincipal})$$
$$\text{Progress Ratio} = \min\left(1, \max\left(0, \frac{\text{Principal Repaid}}{\text{originalPrincipal}}\right)\right)$$
$$\text{Progress Percentage} = \text{Progress Ratio} \times 100$$

Display Text: `"Approx. principal repaid ₹2,57,500 (25.75%)"`

---

## 9. LOAN REMINDER & DUE DATE CONFIGURATION (PHASE 16.6)

- **Due Day (`dueDay`)**: Configurable day of month (1..31, default `5`). Month length overflows (Feb 31) map safely to month end without crashing.
- **Reminder Preferences**: Per-loan `remindersEnabled` (`boolean`), `reminderDaysBefore` (`1, 3, 5, 7`), and `reminderTime` (`HH:mm`).
- **Global Settings Override**: Master toggle `loanRemindersEnabled` in `settingsSlice` can globally suppress all local payment alerts.
- **Ledger Non-Mutation Invariant**: Updating reminder preferences updates loan profile metadata but leaves financial `ledgerVersion` untouched.


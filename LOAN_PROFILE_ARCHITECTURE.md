# LOAN PROFILE ARCHITECTURE — FINZO

This document details the architectural boundaries, data model, state management, validation rules, presentation adapters, and privacy policies for the **Real User Loan Profiles & Loan Dashboard Foundation** (Phase 16) in Finzo.

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
│ • Isolated pure math      │                               │   persisted via AsyncStorage│
│ • Never auto-overwrites   │                               │ • Stated user balance,    │
│   real user loan profiles │                               │   never auto-overwritten  │
└───────────────────────────┘                               └───────────────────────────┘
```

### Key Policy Laws:
1. **Separation of Concerns**: `src/features/calculators/loans/` and `src/features/loans/` operate as separate modules with zero cross-side-effect dependencies.
2. **User Data Authority**: Finzo **never** auto-overwrites user-entered outstanding principal, EMI, or remaining tenure using financial formulas. The profile is the user's explicit, stated real-world balance.
3. **Local-First Privacy**: User loan profiles exist strictly on the user's physical device via `redux-persist` + `@react-native-async-storage/async-storage`. Firebase RTDB remains configuration-only. No user loan data is ever uploaded to any cloud backend or analytics.

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

## 3. SUPPORTED LOAN TYPES & STATUSES

### Centralized Constants (`src/features/loans/constants/loanConstants.js`)

| Key | Label | Badge Color | Icon (`lucide-react-native`) |
| :--- | :--- | :--- | :--- |
| `home_loan` | Home Loan | `#3B82F6` (Blue) | `Home` |
| `personal_loan` | Personal Loan | `#EC4899` (Pink) | `User` |
| `car_loan` | Car Loan | `#10B981` (Green) | `Car` |
| `education_loan` | Education Loan | `#8B5CF6` (Purple) | `GraduationCap` |
| `business_loan` | Business Loan | `#F59E0B` (Amber) | `Briefcase` |
| `other` | Other Loan | `#6B7280` (Gray) | `Landmark` |

### Statuses:
- `active`: Contributes to dashboard totals (`Total Outstanding`, `Total Monthly EMI`, `Active Loan Count`).
- `archived`: Preserved in local storage, excluded from active dashboard summary metrics unless viewing archived tab.

---

## 4. REDUX STATE MANAGEMENT & PERSISTENCE

### Redux Slice (`src/store/slices/loanProfilesSlice.js`)

```javascript
initialState = {
  profiles: [],
  schemaVersion: 1,
}
```

#### Slice Actions:
- `addLoanProfile`: Adds a new loan profile. If set to primary (or if it's the first active loan), automatically clears primary flag from previous loans.
- `updateLoanProfile`: Updates an existing loan profile by ID.
- `deleteLoanProfile`: Deletes a loan profile. If the deleted loan was primary, automatically designates the next active loan as primary.
- `archiveLoanProfile`: Toggles `status` between `active` and `archived`.
- `setPrimaryLoan`: Sets target loan as primary and removes primary status from all other loans.

#### Redux Selectors:
- `selectLoanProfiles`: Returns all valid, hydrated profiles.
- `selectActiveLoanProfiles`: Returns only active profiles.
- `selectArchivedLoanProfiles`: Returns archived profiles.
- `selectPrimaryLoan`: Returns the primary active loan (or first active loan if none designated).
- `selectTotalOutstanding`: Pure sum of `currentOutstandingPrincipal` across active loans.
- `selectTotalMonthlyEMI`: Pure sum of `emiAmount` across active loans.
- `selectActiveLoanCount`: Number of active loans.

#### Persistence Whitelist (`src/store/index.js`)
`whitelist: ['settings', 'savedCalculations', 'rewards', 'loanProfiles']`

---

## 5. VALIDATION RULES (`loanProfileValidation.js`)

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

## 6. CALENDAR & DATE HANDLING (`loanDateUtils.js`)

All date comparisons use `date-fns` calendar-safe functions:
- `getNextEmiInfo(nextEmiDate)` computes:
  - `daysUntilPayment`: Difference in calendar days from today.
  - `isDueToday`: `daysUntilPayment === 0`
  - `isPastDue`: `daysUntilPayment < 0`
  - `isUpcoming`: `daysUntilPayment > 0`
  - `formattedDate`: `dd MMM yyyy` (e.g. `15 Aug 2026`).

---

## 7. DASHBOARD METRICS & REPAYMENT PROGRESS

### Principal Progress Formula:
$$\text{Principal Repaid} = \max(0, \text{originalPrincipal} - \text{currentOutstandingPrincipal})$$
$$\text{Progress Ratio} = \min\left(1, \max\left(0, \frac{\text{Principal Repaid}}{\text{originalPrincipal}}\right)\right)$$
$$\text{Progress Percentage} = \text{Progress Ratio} \times 100$$

Display Text: `"Approx. principal repaid ₹2,57,500 (25.75%)"`

---

## 8. FUTURE EXTENSION POINTS (PHASES 17+)

1. **Prepayment Simulation**: Prepayment options will use the user's `LoanProfile` as input without mutating the underlying profile until confirmed.
2. **EMI Payment Reminders**: Local device notifications will hook into `getNextEmiInfo()`.
3. **Foreclosure & Refinancing**: What-if comparisons will consume `LoanProfile` inputs.

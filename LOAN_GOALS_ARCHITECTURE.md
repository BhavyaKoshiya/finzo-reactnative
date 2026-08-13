# LOAN_GOALS_ARCHITECTURE.md — Finzo Loan Goals & Progress Tracking Architecture

## 1. Overview
Finzo Phase 16.12 introduces the **Loan Goals & Progress Tracking Architecture** (`src/features/loans/types/loanGoalTypes.js`, `src/features/loans/utils/loanGoalUtils.js`, and `src/store/slices/loanGoalsSlice.js`).

It allows users to convert What-If payoff scenarios (Extra Monthly Payments, Target Payoff Date, Prepayment Target, Multiple Prepayment Plan, Target Outstanding Balance) into persistent, local personal financial goals and track actual payment progress over time.

---

## 2. Core Separation & Non-Mutation Laws

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                        REAL LOAN                            │
  │   loanProfilesSlice & loanPaymentsSlice (Financial Facts)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ (Read-Only Consumption)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    PAYOFF PLANNER SCENARIO                  │
  │      loanScenarioEngine.js (Temporary In-Memory Math)       │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ ("Save as Goal")
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                         SAVED GOAL                          │
  │ loanGoalsSlice + baselineSnapshot + deriveGoalProgress()    │
  └─────────────────────────────────────────────────────────────┘
```

### Laws of Non-Mutation:
1. **Goal $\neq$ Payment**: A saved goal is an informational tracking overlay. Saving, updating, pausing, or deleting a goal **NEVER** creates fake payment records, alters loan balances, or modifies `loan.emiAmount`.
2. **Goal $\neq$ Ledger Event**: Creating a goal does not increment `ledgerVersion` or alter historical payment `calculationSnapshot` objects.
3. **Derived Real-Time Progress**: Goal progress is derived dynamically from `getCurrentLoanBalance(loan, payments)` and `loanPaymentsSlice`. Goal entities store scenario configurations and baseline snapshots, not cached/authoritative progress numbers.
4. **100% Local & Offline**: Goals are stored in Redux + `redux-persist` + `AsyncStorage`. Zero goal data is uploaded to Firebase or cloud servers.

---

## 3. Data Model (`schemaVersion: 1`)

```json
{
  "id": "goal_1786523456_a1b2c3",
  "schemaVersion": 1,
  "loanId": "loan_123",
  "type": "extra_monthly_payment",
  "title": "Pay ₹5,000 extra per month",
  "description": "Finish home loan ~28 months earlier",
  "scenario": {
    "type": "extra_monthly",
    "extraMonthlyAmount": 5000
  },
  "baselineSnapshot": {
    "outstandingBalance": 726316,
    "currentEmi": 21450,
    "interestRate": 8.5,
    "estimatedPayoffDate": "May 2032",
    "estimatedRemainingInterest": 420000,
    "baselineLedgerVersion": 3,
    "createdAt": "2026-08-13T12:00:00.000Z"
  },
  "remindersEnabled": false,
  "reminderDay": 5,
  "reminderTime": "09:00",
  "status": "active",
  "createdAt": "2026-08-13T12:00:00.000Z",
  "updatedAt": "2026-08-13T12:00:00.000Z"
}
```

---

## 4. Goal Progress Engine (`loanGoalUtils.js`)

| Goal Type | Target Metric | Progress Derivation Logic | On-Track Evaluation |
| :--- | :--- | :--- | :--- |
| `extra_monthly_payment` | `extraMonthlyAmount` | Scans current month payments (`regular_emi`, `custom_payment`); calculates `actualPaid - scheduledEmi` | `ahead` if paid $\ge$ target; `behind` if 0 |
| `prepayment_target` | `amount` | Sums recorded prepayments (`paymentType === 'prepayment'`) dated $\ge$ `goal.createdAt` | `completed` if sum $\ge$ target; `on_track` if $\ge 50\%$ |
| `target_balance` | `targetBalance` | Measures reduction from baseline balance toward target: $\frac{P_{base} - P_{curr}}{P_{base} - P_{target}} \times 100$ | `completed` if $P_{curr} \le P_{target}$ |
| `target_payoff_date` | `targetMonths` | Re-runs `loanScenarioEngine` from active balance; compares estimated payoff vs target date | `ahead` if estimated payoff $\le$ target date |

---

## 5. Safeguards & Limits
- **Max Goal Guard**: Maximum **5 active goals per loan**. Attempting to add a 6th active goal triggers a user alert.
- **Cascade Loan Deletion**: Deleting a loan profile dispatches `deleteGoalsForLoan(loanId)` to clean up associated goals.
- **Loan Archiving Safety**: Archiving a loan retains historical goals intact for audit review.
- **Baseline Immutability**: The initial `baselineSnapshot` is preserved untouched when payments occur, allowing users to view exact progress since goal creation.

---

## 6. PDF Goal Report Export
- Integrates with Phase 16.9 PDF engine (`generateAndShareReport`).
- PDF report includes baseline snapshot, current progress, actual relevant payment history, projected payoff, and explicit disclaimer: *"Personal Goal — Not an actual payment instruction."*

---

## 7. PRIVATE DETAILS & GOAL SEPARATION (PHASE 16.13)

- **Domain Isolation**: Goal objects retain purely financial scenario metrics and baseline snapshots. They do NOT contain private lender details, notes, or protected credentials.
- **Cascade Deletion Isolation**: Deleting a loan removes loan goals via `deleteGoalsForLoan(loanId)`, while preserving unrelated loans untouched.

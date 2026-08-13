# LOAN_PAYOFF_PLANNER_ARCHITECTURE.md — Finzo Loan Payoff Planner Architecture

## 1. Overview
Finzo Phase 16.11 introduces the **Loan Payoff Planner & What-If Scenario Engine** (`src/features/loans/utils/loanScenarioEngine.js` & `src/features/loans/screens/LoanPayoffPlannerScreen.jsx`).

It allows users to explore hypothetical repayment strategies (Extra Monthly Payment, Increased EMI, One-Time Lump Sum Prepayment, Multiple Planned Prepayments, and Target Payoff Date) and see their potential impact on payoff date and interest avoided without modifying their actual loan ledger, Redux state, payment history, or reminder schedules.

---

## 2. Core Non-Mutation & Local Privacy Laws

1. **Strict Non-Mutation Rule**: Running any payoff scenario is 100% read-only and in-memory. It **NEVER** mutates:
   - `loanProfilesSlice`
   - `loanPaymentsSlice`
   - `ledgerVersion`
   - `payment.calculationSnapshot`
   - Notifee payment reminders / notification schedules
   - Balance corrections
2. **Current Balance Anchor**: Starts simulations from authoritative `getCurrentLoanBalance(loan, payments)` to respect bank-confirmed balance anchors rather than replaying from original principal.
3. **100% Local & Offline**: All scenario math runs locally on device without uploading data to Firebase or third-party servers.

---

## 3. Scenario Engine Architecture (`loanScenarioEngine.js`)

```text
Active Loan Profile + Payment History
                  ↓
       getCurrentLoanBalance()
                  ↓
        Active Balance Anchor
                  ↓
       simulateLoanScenario()
  ┌───────────────┴───────────────┐
  │  Current Baseline Amortization│
  └───────────────┬───────────────┘
                  │
  ┌───────────────┴─────────────────────────────────────────┐
  │ Scenario Strategy Execution                              │
  │ • EXTRA_MONTHLY (EMI + Extra)                          │
  │ • INCREASED_EMI (New Simulated EMI)                    │
  │ • ONE_TIME_PREPAYMENT (Lump Sum at Month N)            │
  │ • MULTIPLE_PREPAYMENTS (List of Dated Lump Sums)       │
  │ • TARGET_PAYOFF_DATE (Solves Required Target EMI)      │
  └───────────────┬─────────────────────────────────────────┘
                  │
                  ▼
  Comparative Output Payload:
  • startingBalance & simulatedEmi
  • totalSimulatedInterest
  • estimatedPayoffDate & remainingMonths
  • tenureReduction (monthsEarlier & formattedStr)
  • interestImpact (estimatedInterestAvoided & formattedStr)
  • compact & full amortization schedule arrays
```

---

## 4. Scenario Types & Validation Rules

| Scenario Type | Inputs | Calculation Logic | Safety / Edge Case Guard |
| :--- | :--- | :--- | :--- |
| `EXTRA_MONTHLY` | `extraMonthlyAmount` | `simulatedEmi = baseEmi + extra` | Checks `simulatedEmi > firstMonthInterest` |
| `INCREASED_EMI` | `newEmi` | `simulatedEmi = Math.max(baseEmi, newEmi)` | Checks `simulatedEmi > firstMonthInterest` |
| `ONE_TIME_PREPAYMENT` | `amount`, `monthIndex` | Prepayment applies 100% to principal reduction at month $N$ | Skipped if amount $\le 0$ |
| `MULTIPLE_PREPAYMENTS` | `prepayments: [{ monthIndex, amount }]` | Sorted `monthIndex ASC`; applied to principal at matching month | Max 50 years projection limit |
| `TARGET_PAYOFF_DATE` | `targetMonths` | Solves `calculateRequiredEmiForTargetMonths(P, r, N)` | Returns error if `targetMonths <= 0` or target date in past |

---

## 5. Non-Guaranteed Language & Disclaimers
- All UI labels and PDF report summaries strictly use non-guaranteed terminology:
  - *"Estimated payoff date"*
  - *"Potential interest avoided"*
  - *"Estimated tenure reduction"*
- Avoids claims of guaranteed savings because actual bank compounding policies or rate variations may differ.

---

## 6. PDF Export Integration
- Integrates with Phase 16.9 PDF engine (`generateAndShareReport`).
- Generated scenario PDF includes an explicit header: *"Hypothetical Scenario Report — Not an actual payment record"*.

---

## 7. SAVED GOAL INTEGRATION (PHASE 16.12)

- **Scenario Persistence via Goals**: Any evaluated What-If scenario in `LoanPayoffPlannerScreen` can be saved directly as a personal goal via `SaveGoalModal.jsx`.
- **Baseline Snapshot Capture**: Saving a scenario captures a snapshot (`outstandingBalance`, `currentEmi`, `estimatedPayoffDate`, `baselineLedgerVersion`) inside `loanGoalsSlice` without creating fake payment records or altering the financial ledger.
- **Max 5 Active Goals**: Enforces max 5 active goals per loan account.

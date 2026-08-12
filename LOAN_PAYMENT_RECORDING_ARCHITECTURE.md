# LOAN PAYMENT RECORDING ARCHITECTURE

## 1. Executive Overview
This document specifies the real-world payment recording, preview, calculation, and correction architecture in **Finzo**. It builds upon the Phase 16.3 **Loan Ledger Hardening** foundation.

---

## 2. Core Concepts & Boundaries

### Scheduled EMI vs. Actual Paid Amount
- **Loan Profile Scheduled EMI (`loan.emiAmount`)**: User's configured monthly loan commitment. Recording a payment (e.g. ₹22,000 paid vs ₹21,450 scheduled) **NEVER** modifies `loan.emiAmount`.
- **"Use scheduled EMI" Shortcut**: Checkbox toggle on payment forms pre-filling `loan.emiAmount` for fast monthly logging.
- **Actual Paid Amount**: The recorded event payload preserves the exact amount paid (`amount`).

### Payment Types
1. **Regular EMI (`regular_emi`)**: Splits payment into interest and principal reduction based on annual interest rate and monthly-reducing formula.
2. **Custom Payment (`custom_payment`)**: Non-scheduled payment amount; computes estimated interest/principal split without altering `loan.emiAmount`.
3. **Prepayment (`prepayment`)**: 100% principal reduction ($\text{Interest} = \$0$). Does not alter `loan.emiAmount` or automatically simulate tenure reductions in this phase.

---

## 3. Dynamic Calculation Preview
Before saving, payment forms invoke `createPaymentPreview()` using `getCurrentLoanBalance()`:
- **Opening Balance**: Determined by active balance anchor + historical replay.
- **Estimated Interest & Principal**: Calculated dynamically according to monthly-reducing strategy.
- **Estimated Closing Balance**: Opening balance minus principal reduction.
- **UI Label**: Explicitly labeled **"Finzo Estimate"** to prevent confusion with bank statements.

---

## 4. Optional Bank Statement Correction & Anchors
- Expandable section **"Have your bank's statement?"** allows optional input of:
  - `actualInterest`
  - `actualPrincipal`
  - `actualClosingBalance`
- Toggling **"Is this the balance shown by your bank?"** sets `balanceSource = 'bank_confirmed'`, establishing a trusted anchor for subsequent calculations.
- Actual bank values are stored in `actualPaymentDetails` and do **NOT** overwrite original Finzo calculation snapshots (`calculationSnapshot`).

---

## 5. Ledger Replay & Historical Immutability
- **Editing / Deleting Payments**: Replaces the target event in the chronological sequence and replays subsequent payments via `recalculateLoanBalanceFromPayments`.
- **Historical Snapshots**: Preserved on payment records (`annualRate`, `interestMethod`, `openingBalance`, `estimatedInterest`, `estimatedPrincipal`, `estimatedClosingBalance`). Updating loan rates in the future does not alter historical snapshots.

---

## 6. Privacy Enforcement
- 100% local device storage (`redux-persist` + `@react-native-async-storage/async-storage`).
- Zero loan profiles, balances, payments, or notes uploaded to Firebase or cloud backends.

---

## 7. PAYMENT PERIOD MATCHING & REMINDER RECONCILIATION (PHASE 16.6)

- **Period Identifier**: Scheduled EMIs are tracked per deterministic month period (`loanId_YYYY-MM`).
- **Regular EMI Satisfaction**: Only payments with `paymentType === 'regular_emi'` (or full settlement) satisfy the scheduled period.
- **Prepayments & Custom Payments**: Standalone prepayments and unassigned custom payments reduce principal but do **NOT** satisfy the scheduled monthly EMI period unless explicitly recorded as the regular EMI.
- **Reminder Cancellation**: Recording a regular EMI payment for the target period automatically cancels the active local notification for that period.


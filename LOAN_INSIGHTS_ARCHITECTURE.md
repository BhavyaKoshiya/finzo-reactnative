# LOAN_INSIGHTS_ARCHITECTURE.md — Finzo Loan Insights & Financial Health Architecture

## 1. Overview
Finzo Loan Insights (Phase 16.8) provides read-only financial analytics for loan accounts. It enables users to visualize principal repayment progress, total recorded payments, cumulative interest paid, estimated remaining interest, estimated payoff dates, prepayment impacts, and historical trend series without modifying the financial ledger or profile parameters.

---

## 2. Core Architectural Principles

### 2.1 Read-Only & Non-Mutating Safeguards
- Insights are purely derived from the loan profile and recorded payments.
- Running insight calculations **never** mutates loan profiles, Redux state, payment records, interest rates, EMIs, or `ledgerVersion`.
- Insights do not trigger background side effects or ledger events.

### 2.2 Facts vs. Estimates Policy
- **Facts**: Recorded payment amounts, bank-confirmed actual closing balances, original loan principal, and user-entered initial loan parameters.
- **Estimates**: Future remaining interest, estimated payoff date, remaining tenure, interest avoided, and projected amortization paths.
- **Labeling Rules**: Every projected metric is explicitly tagged as **"Finzo Estimate"** or **"Estimated"**. Guaranteed outcomes are never claimed unless backed by bank-confirmed data.

---

## 3. Pure Calculation Engine (`loanInsightUtils.js`)

All calculations are encapsulated as pure, deterministic JavaScript functions without React or Redux dependencies:

1. **`calculatePrincipalProgress(loan, payments)`**:
   - Calculates principal reduced: $\max(0, \text{originalPrincipal} - \text{currentBalance})$.
   - Clamps progress percentage between `0%` and `100%`.
   - Uses single source of truth balance logic (`getCurrentLoanBalance`).

2. **`calculateRecordedPaymentSummary(payments)`**:
   - Filters out balance correction events (`paymentType !== 'balance_correction'`).
   - Counts and categorizes payments into Regular EMI, Custom Payments, and Prepayments.
   - Computes cumulative actual recorded payments sum.

3. **`calculateInterestAndPrincipalPaid(loan, payments)`**:
   - Replays historical payments.
   - Uses actual bank-confirmed interest/principal values (`actualInterest`, `actualPrincipal`) when present.
   - Falls back to calculation snapshots (`calculationSnapshot.estimatedInterest`, `calculationSnapshot.estimatedPrincipal`) stored at payment time.
   - **Historical Safety**: Changing a loan's current interest rate in the profile does **not** alter historical payment breakdowns.

4. **`calculateRemainingInterestAndPayoff(loan, currentBalance)`**:
   - Evaluates remaining loan schedule based on current balance, annual rate, and EMI amount using monthly reducing balance math.
   - Handles edge cases: zero balance (`Paid Off`), zero rate, and `EMI too low to cover interest`.

5. **`calculatePrepaymentImpact(loan, payments)`**:
   - Summarizes total prepayments made and estimates interest avoided compared to a baseline schedule without prepayments.

6. **`buildLoanInsightSummary(loan, payments)`**:
   - Assembles a unified, immutable Loan Insights Model per render. Filters payments strictly by `loan.id` to guarantee multi-loan isolation.

7. **`buildLoanInsightHistorySeries(loan, payments)`**:
   - Generates chronological data series for outstanding balance trends and principal vs. interest breakdown charts.

---

## 4. UI Layer Architecture

### 4.1 Component Breakdown
- **`LoanInsightsScreen.jsx`**: Main feature screen featuring hero progress, principal comparison, payment summary, payoff projections, prepayment impact, latest payment breakdown, SVG trend charts, and assumptions accordion.
- **`LoanInsightsPreviewCard.jsx`**: Compact preview widget on `LoanDetailsScreen` showing % principal paid, interest paid, estimated payoff date, and navigation button.
- **`LoanInsightsTrendChart.jsx`**: Interactive dual-tab chart (Balance Trend & Payment Breakdown) rendered using SVG paths and Reanimated bars without external chart libraries.

### 4.2 Navigation Entry Points
- **Route**: `ROUTES.LOAN_INSIGHTS` (`LoanInsightsScreen`).
- Accessible directly from `LoanDetailsScreen` via preview card or action button.

---

## 5. Local Privacy & Security
- All analytics calculations run 100% locally on the device.
- No loan balances, payment histories, interest amounts, or payoff estimates are uploaded or logged to Firebase or external servers.

---

## 6. PDF Insights Report Export (Phase 16.9)
- **`buildLoanInsightsReport`**: Formats all loan analytics (principal progress, remaining interest/tenure, payoff date, prepayment impact, and latest payment breakdown) into print-friendly PDF reports.
- **Export Action**: Accessible via "Export Insights (PDF)" on `LoanInsightsScreen` or "Export Report" option on `LoanDetailsScreen`.
- **100% Offline**: Renders on-device via `pdfReportService` and shares via system native share sheet without cloud uploads.

---

## 7. PAYOFF PLANNER & WHAT-IF SCENARIOS (PHASE 16.11)

- **Scenario Expansion**: Loan Insights provides the baseline analytics, while the **Payoff Planner** (`LoanPayoffPlannerScreen.jsx`) extends analysis into hypothetical future scenarios (Extra Monthly Payments, Increased EMI, Multiple Prepayments, Target Payoff Date).
- **Direct Navigation Entry**: `LoanInsightsScreen` features a direct action button **"Plan Payoff Scenarios"** navigating to `ROUTES.LOAN_PAYOFF_PLANNER`.
- **Zero Ledger Side Effects**: Both Insights and Payoff Planner operate on temporary in-memory computations without mutating loan profiles, payment histories, or ledger versioning.

---

## 8. SAVED GOALS & PROGRESS TRACKING INTEGRATION (PHASE 16.12)

- **Goal Integration**: Loan Insights features a direct action button **"View Payoff Goals"** navigating to `ROUTES.LOAN_GOALS`.
- **Read-Only Progress Metrics**: Goal progress shown in Insights or Goals screens consumes `deriveGoalProgress()`, which derives metrics dynamically from authoritative loan state without mutating Redux slices or ledger anchors.

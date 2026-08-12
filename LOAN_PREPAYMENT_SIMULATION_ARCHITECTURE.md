# LOAN PREPAYMENT SIMULATION ARCHITECTURE

## 1. Executive Overview
The **Loan Prepayment Simulator** (Phase 16.5) is a pure, read-only "What-If" analysis engine designed to help users model the impact of hypothetical lump-sum prepayments on their real-world loans.

It supports two distinct prepayment strategies:
1. **Reduce Tenure**: Keeps scheduled monthly EMI unchanged and calculates earlier payoff duration & total interest savings.
2. **Reduce EMI**: Keeps target remaining tenure constant and recalculates required lower EMI and monthly cashflow savings.

---

## 2. Invariant: Read-Only Non-Mutation Guarantee
The simulation engine is **100% read-only and hypothetical**:
- Simulating prepayments **NEVER** mutates `loanProfilesSlice`, `loanPaymentsSlice`, or `AsyncStorage`.
- Closing or navigating away from `LoanPrepaymentSimulatorScreen` discards the scenario without affecting stored loan state.
- Only when the user explicitly taps **"Record this prepayment"** does Finzo transition to the existing Phase 16.4 payment recording flow (`AddPaymentScreen`), where the user confirms and saves the transaction into the durable ledger.

---

## 3. Starting Balance Resolution & Anchor Priority
The simulator resolves the loan's current starting balance using `getCurrentLoanBalance(loan, payments)`:

```
[ Active Payment History ]
         │
         ├──> Active 'bank_confirmed' payment anchor present?
         │         ├── YES ──> Use bank-confirmed closing balance (Label: "Bank Confirmed")
         │         └── NO  ──> Use userConfirmedBalance / currentOutstandingPrincipal (Label: "Finzo Estimate")
```

---

## 4. Pure Simulation Engine Mechanics

### Strategy A: Reduce Tenure Mode
- **Input**: `prepaymentAmount`, `currentBalance`, `annualRate`, `currentEmi`, `remainingTenureMonths`.
- **Opening Balance**: `simulatedOpeningBalance = currentBalance - prepaymentAmount`.
- **Payoff Simulation**: Month-by-month schedule using monthly-reducing interest:
  $$\text{Monthly Interest} = \text{Opening Balance} \times \frac{\text{Rate}}{12 \times 100}$$
  $$\text{Principal Paid} = \min(\text{EMI}, \text{Opening Balance} + \text{Interest}) - \text{Interest}$$
- **Savings Calculation**:
  $$\text{Interest Saved} = \text{Baseline Remaining Interest} - \text{Simulated Remaining Interest}$$
  $$\text{Months Saved} = \text{Baseline Remaining Months} - \text{Simulated Remaining Months}$$

### Strategy B: Reduce EMI Mode
- **Target Tenure**: $N = \text{remainingTenureMonths}$.
- **New EMI Calculation**:
  $$\text{New EMI} = P \times \frac{r(1+r)^N}{(1+r)^N - 1} \quad \text{where } P = \text{simulatedOpeningBalance}, r = \frac{\text{Rate}}{12 \times 100}$$
- **Savings Calculation**:
  $$\text{Monthly Cashflow Saving} = \text{Current EMI} - \text{New EMI}$$
  $$\text{Interest Saved} = \text{Baseline Remaining Interest} - \text{Simulated Remaining Interest}$$

---

## 5. Edge Cases & Boundary Handling
- **Full Payoff ($\text{Prepayment} \ge \text{Outstanding}$)**:
  - Sets `isFullyPaidOff = true`, `remainingMonths = 0`, `remainingInterest = 0`.
  - Emits user notification: *"Prepayment covers or exceeds current outstanding balance."*
- **0% Interest Loans**:
  - Handles division-by-zero safely: $\text{Tenure} = \lceil P / \text{EMI} \rceil$, $\text{Interest Saved} = \$0$.
- **Low EMI ($\text{EMI} \le \text{Monthly Interest}$)**:
  - Emits clear warning: *"Your current EMI may not fully cover monthly interest."* Caps iteration to prevent infinite loops.

---

## 6. Integration with Payment Recording Flow
When the user taps **"Record this prepayment"**:
```javascript
navigation.navigate(ROUTES.ADD_PAYMENT, {
  loanId: loan.id,
  initialValues: {
    paymentType: PAYMENT_TYPES.PREPAYMENT,
    amount: String(prepaymentAmount),
  },
});
```
`AddPaymentScreen` pre-fills the form with `paymentType = 'prepayment'` and the simulated amount, requiring user confirmation before appending to the Redux ledger.

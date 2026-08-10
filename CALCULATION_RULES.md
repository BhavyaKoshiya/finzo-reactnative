# CALCULATION_RULES.md — Finzo Financial Precision & Formula Specifications

This document specifies the mandatory mathematical formulas, precision rules, compounding conventions, and validation contracts for all financial calculation engines in **Finzo**.

---

## 1. CALCULATION PRECISION & DECIMAL.JS STRATEGY

To eliminate JavaScript floating-point errors (e.g. `0.1 + 0.2 = 0.30000000000000004`), Finzo strictly uses **Decimal.js** for all financial formulas:
- **Precision**: 30 significant digits (`precision: 30`).
- **Rounding Mode**: `Decimal.ROUND_HALF_UP` (standard financial half-up rounding).
- **Separation**: Intermediate values retain high precision; final outputs are rounded to 2 decimal places (`roundCurrency`, `roundPercentage`).

---

## 2. STANDARD RESULT CONTRACT

Every calculation function returns a normalized result object:

### Success Response
```js
{
  success: true,
  data: {
    ...calculationValues // Numeric/Decimal-derived output fields
  },
  errors: []
}
```

### Error Response (User Input Failure)
```js
{
  success: false,
  data: null,
  errors: [
    {
      field: 'principal',
      code: 'MUST_BE_POSITIVE',
      message: 'Loan amount must be greater than zero.'
    }
  ]
}
```

Standard Error Codes: `REQUIRED`, `INVALID_NUMBER`, `MUST_BE_POSITIVE`, `MUST_BE_NON_NEGATIVE`, `BELOW_MINIMUM`, `ABOVE_MAXIMUM`, `INVALID_PERCENTAGE`, `INVALID_FREQUENCY`, `INVALID_DURATION`.

---

## 3. FORMULA SPECIFICATIONS & CONVENTIONS

### 3.1 Reducing-Balance EMI
- **Inputs**: `principal` ($P$), `annualInterestRate` ($R$), `tenureMonths` ($N$).
- **Formula**:
  $$r = \frac{R}{12 \times 100}$$
  $$\text{EMI} = P \times r \times \frac{(1+r)^N}{(1+r)^N - 1} \quad (r > 0)$$
  $$\text{EMI} = \frac{P}{N} \quad (r = 0)$$
- **Outputs**: `monthlyEMI`, `totalPayment`, `totalInterest`, `principal`.

### 3.2 Amortization Schedule
- **Schedule Row**: `{ month, openingBalance, payment, principalComponent, interestComponent, closingBalance }`.
- **Adjustment**: Final month principal component is adjusted to ensure closing balance becomes exactly `0.00`.

### 3.3 Systematic Investment Plan (SIP)
- **Inputs**: `monthlyInvestment` ($P$), `annualReturnRate` ($R$), `tenureMonths` ($N$).
- **Timing Assumption**: Annuity Due compounding (deposits made at the **beginning of each month**).
- **Formula**:
  $$i = \frac{R}{12 \times 100}$$
  $$M = P \times \frac{(1+i)^N - 1}{i} \times (1+i) \quad (i > 0)$$
  $$M = P \times N \quad (i = 0)$$
- **Outputs**: `maturityAmount`, `totalInvested`, `estimatedReturns`. Note: Results are indicative estimates, not guaranteed returns.

### 3.4 Fixed Deposit (FD)
- **Inputs**: `principal` ($P$), `annualInterestRate` ($R$), `tenureYears` ($T$), `compoundingFrequency` ($n = 12, 4, 2, 1$).
- **Formula**:
  $$A = P \times \left(1 + \frac{R/100}{n}\right)^{n \times T}$$
- **Outputs**: `maturityAmount`, `interestEarned`, `principal`.

### 3.5 Recurring Deposit (RD)
- **Inputs**: `monthlyDeposit` ($P$), `annualInterestRate` ($R$), `tenureMonths` ($N$).
- **Convention**: Standard Indian bank quarterly compounding for monthly deposits.
- **Formula**:
  $$M = \sum_{m=1}^N P \times \left(1 + \frac{R/100}{4}\right)^{4 \times \frac{N - m + 1}{12}}$$
- **Outputs**: `maturityAmount`, `totalDeposited`, `interestEarned`.

### 3.6 Goods & Services Tax (GST)
- **Modes**:
  - **Exclusive**: $\text{Base} = A$, $\text{GST} = A \times \frac{R}{100}$, $\text{Total} = \text{Base} + \text{GST}$.
  - **Inclusive**: $\text{Total} = A$, $\text{Base} = \frac{A}{1 + R/100}$, $\text{GST} = \text{Total} - \text{Base}$.

### 3.7 Simple & Compound Interest
- **Simple Interest**: $SI = \frac{P \times R \times T}{100}$.
- **Compound Interest**: $A = P \left(1 + \frac{R/100}{n}\right)^{n T}$.

### 3.8 CAGR & ROI
- **CAGR**: $CAGR = \left(\frac{\text{EV}}{\text{BV}}\right)^{1 / Y} - 1$. Requires $\text{BV} > 0, \text{EV} \ge 0, Y > 0$.
- **ROI**: $ROI = \frac{\text{Net Profit}}{\text{Initial Investment}} \times 100$. Supports positive & negative ROI.

---

## 4. CURRENCY & NUMBER FORMATTING

- **Numbering System**: Indian numbering system (`en-IN` e.g. `₹10,00,000`).
- **Compact Notation**: `formatCurrencyCompact` outputs `₹10 L`, `₹1.5 Cr`, `₹50 K`.
- **Parsing**: `parseINR` / `normalizeNumberInput` strips `₹`, `,`, and whitespace before calculation.

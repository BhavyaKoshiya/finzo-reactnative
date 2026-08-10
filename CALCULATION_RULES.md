# CALCULATION_RULES.md — Financial Precision & Calculation Guidelines

This document specifies the mandatory mathematical and precision standards for implementing financial calculation engines in **Finzo**.

---

## 1. CALCULATION PRECISION VS DISPLAY ROUNDING

To prevent cumulative floating-point errors, Finzo strictly separates **Calculation Precision** from **Display Rounding**:

1. **Calculation Precision**:
   - All intermediate mathematical operations (interest compounding, monthly amortization schedules, compounding factors) must retain maximum double-precision floating-point precision (or integer cents/paise where appropriate).
   - Do NOT round intermediate numbers inside loops or compounding steps.

2. **Display Rounding**:
   - Rounding is applied ONLY at the final presentation layer (UI component or display formatter).
   - Standard rounding rule for currency display in India (`INR ₹`): Standard half-up rounding to nearest integer or 2 decimal places as defined per currency standard.

---

## 2. MONETARY & PERCENTAGE CALCULATIONS

- **Interest Rates**: Annual interest rates input as percentage (e.g. `10.5%`) must be converted to monthly interest decimal rate: `r = (Annual Rate / 12) / 100`.
- **Tenure**: Months = `Years * 12`.
- **EMI Formula Standard**:
  $$EMI = P \times r \times \frac{(1 + r)^n}{(1 + r)^n - 1}$$
  where:
  - $P$ = Principal loan amount
  - $r$ = Monthly interest rate in decimal
  - $n$ = Total tenure in months

---

## 3. CURRENCY FORMATTING

- All currency amounts must be formatted using Indian numbering system standard (`en-IN`):
  - Example: `₹1,00,000` (Lakhs) and `₹1,00,000.50`.
- Use localized formatting helpers built upon standard JS `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

---

## 4. ISOLATION & TEST COVERAGE LAWS

Every financial calculator engine in `src/calculations/` must be accompanied by comprehensive Jest tests covering:
- **Normal Values**: Realistic market inputs (e.g., ₹25 Lakhs loan @ 8.5% for 20 years).
- **Minimum Values**: Smallest valid principal (e.g. ₹1,000, 1 month).
- **Maximum Values**: Large boundary amounts (e.g., ₹100 Crores).
- **Boundary & Zero Values**: Handling 0% interest rate where applicable.
- **Decimal Inputs**: Fractional rates (e.g., 8.75%) and fractional tenures.
- **Rounding Verification**: Comparing outputs against known reference amortization schedules.

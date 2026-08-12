# FINZO PRODUCT ROADMAP

- [x] Phase 0 — Foundation
- [x] Phase 1 — Design System
- [x] Phase 2 — Navigation Shell
- [x] Phase 3 — Calculation Engine
- [x] Phase 4 — EMI Vertical Slice
- [x] Phase 5 — Calculator Framework + Registry
- [x] Phase 6 — Loan Calculator Family
- [x] Phase 7 — Investment Calculator Family
- [x] Phase 8 — Tax & General Financial Calculators
- [x] Phase 9 — Saved Calculations
- [x] Phase 10 — Home Dashboard + Search
- [x] Phase 11 — Share + Premium Detailed PDF Export
- [x] Phase 11.5 — Profile Tab & Settings Restructure
- [x] Phase 13 — Rewards Foundation & Daily Check-In
- [x] Phase 14 — Rewards Store, Point Redemption & Ad-Free Entitlements
- [x] Phase 15 — Firebase RTDB + Dynamic Rewards + Streak Check-In + Discounts + Configurable Rewards UI
- [x] Phase 16 — Real Loan Profiles + Loan Dashboard Foundation
- [x] Phase 16.1 — My Loans Access & Multi-Loan UX
- [x] Phase 16.2 — My Loans Personal Financial Workspace
- [x] Phase 16.3 — Loan Ledger Hardening & Balance Integrity
- [x] Phase 16.4 — Real-World Loan Payment Recording, Correction & Prepayment Foundation
- [x] Phase 17 — Loan Payment History + Balance Tracking
- [x] Phase 17.1 — Loan Balance & Payment Calculation Correction
- [x] Phase 17.2 — Loan Ledger Hardening
- [x] Phase 16.5 — Loan Prepayment Simulator & What-If Analysis
- [x] Phase 16.6 — Loan Payment Reminders & Payment Due Tracking
- [x] Phase 16.6.1 — Real Local Notifications with @notifee/react-native
- [x] Phase 16.8 — Loan Insights, Payoff Progress & Financial Health
- [ ] Phase 18 — Prepayment Simulator
- [ ] Phase 19 — Monetization & Rewarded Ads SDK
- [ ] Phase 20 — Final QA + Store Preparation

---

## Architectural Notes: Real-World Loan Payment Recording (Phase 16.4)

- **Scheduled EMI vs. Actual Payment Amount**: Fast "Use scheduled EMI" shortcut pre-fills `loan.emiAmount`. Recording custom actual paid amounts **NEVER** modifies `loan.emiAmount`.
- **Dynamic Payment Preview**: `createPaymentPreview()` computes opening balance, estimated interest, principal reduction, and estimated closing balance using `getCurrentLoanBalance()`, labeled explicitly as "Finzo Estimate".
- **Prepayments**: Treated as 100% principal reduction ($\text{Interest} = 0$). Does not alter `loan.emiAmount` or force simulation changes.
- **Optional Bank Statement Correction**: Allows input of actual bank interest, principal, and closing balance. Toggling "Is this the balance shown by your bank?" sets `balanceSource = 'bank_confirmed'` as a trusted anchor.
- **Full Ledger Replay**: Editing or deleting a payment replaces the event in the chronological sequence and replays remaining payments via `recalculateLoanBalanceFromPayments`.
- **100% Local Privacy**: All loan data, payment records, bank corrections, and notes remain local on device.

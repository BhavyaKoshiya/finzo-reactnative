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
- [ ] Phase 17 — Monetization & Rewarded Ads SDK
- [ ] Phase 18 — Final QA + Store Preparation

---

## Architectural Notes: Real Loan Profiles & Loan Dashboard Foundation (Phase 16)

- **Domain Separation**: Strict architectural boundary separating hypothetical calculator loans (`src/features/calculators/loans/`) from real user loan accounts (`src/features/loans/`).
- **Data Model**: `schemaVersion: 1` data model with high-precision numeric values, ISO calendar dates, and support for 6 loan types (`home_loan`, `personal_loan`, `car_loan`, `education_loan`, `business_loan`, `other`).
- **State Management & Persistence**: Redux Toolkit `loanProfilesSlice` whitelisted in `redux-persist` via `@react-native-async-storage/async-storage`. Hydration safety guards ignore corrupted records automatically.
- **Primary Loan Invariant**: Single-primary constraint enforced across creation, edits, switches, archives, and deletions.
- **Loan Dashboard & Cards**: Dashboard summary displaying Total Outstanding, Total Monthly EMI, and Active Loan Count. Tabbed view for Active vs Archived loans.
- **Date Handling & Progress**: `date-fns` calendar calculations for next EMI status (`daysUntilPayment`, `isDueToday`, `isPastDue`). Approximate principal repayment progress indicator clamped to $[0, 1]$.
- **Home & Profile Integration**: Compact primary loan widget and "Track Your Loans" banner on Home tab; "My Loans" section on Profile tab.
- **Privacy Enforcement**: 100% local device storage. Zero loan data uploaded to Firebase RTDB, Firestore, or cloud backends.

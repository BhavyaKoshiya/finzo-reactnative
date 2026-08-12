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
- [x] Phase 17 — Loan Payment History + Balance Tracking
- [x] Phase 17.1 — Loan Balance & Payment Calculation Correction
- [x] Phase 17.2 — Loan Ledger Hardening
- [x] Phase 17.3 — RTDB Configuration Provisioning & Hardening
- [ ] Phase 18 — Prepayment Simulator
- [ ] Phase 19 — Monetization & Rewarded Ads SDK
- [ ] Phase 20 — Final QA + Store Preparation

---

## Architectural Notes: RTDB Configuration Provisioning & Hardening (Phase 17.3)

- **Provisioned Firebase RTDB `/config`**: Persisted authoritative production JSON configuration payload containing `version`, `rewards`, `redemption`, `discounts`, and `ads` (disabled).
- **3-Tier Fallback Hierarchy**: Valid Firebase RTDB `/config` $\rightarrow$ Last-Known-Good AsyncStorage config (`@finzo_last_known_config`) $\rightarrow$ Local defaults (`DEFAULT_REALTIME_CONFIG`).
- **Hardened Schema Validation**: Bounded integer validation (`pointsCost >= 1`, `durationMinutes >= 1`), strict daily reward ladder validation ($> 0$), string length caps, and discount percentage floor safety.
- **Empty RTDB & Offline Resilience**: Empty (`null`), malformed, or unreachable remote payloads safely fall back to cached/default configuration without crashing or modifying user state.
- **100% User Data Privacy**: Zero user points, streaks, loan profiles, payment history, or saved calculations reside in Firebase. RTDB is strictly read-only remote config.

# Finzo — Advertising Architecture & Provider Specification

This document outlines the provider-agnostic, moderate, privacy-first advertising architecture for the **Finzo** application.

> **⚠️ PLACEMENT FREEZE (Phase 18.2)**: The placement map below is intentionally frozen. Do NOT add, remove, move, reorder, or change the type of any existing ad placement without explicit approval.

---

## 1. Overview & Core Philosophy

Finzo is an offline-first financial calculator and loan tracking utility.
- **Financial Integrity**: Financial workflows (recording payments, editing loans, balance correction, private notes, credentials, PDF exports) are **100% AD-FREE**.
- **Privacy First**: Zero financial data (loan amounts, EMIs, interest rates, account numbers, balances, payment history) is ever passed to the advertising layer or external services.
- **Swappable Infrastructure**: React Native screens do not depend directly on any specific advertising SDK (e.g. AdMob, AppLovin, Unity Ads). All screens interact through `adService` and `AdPlacement`.

---

## 2. Supported Ad Types

Finzo supports 4 standardized ad types built upon a common provider interface:

1. **BANNER AD (`banner`)**: Compact, predictable height (~54px) horizontal placement.
2. **NATIVE AD (`native`)**: Card integrated naturally into content flows, styled with `Sponsored` badge, headline, description, and CTA.
3. **INTERSTITIAL AD (`interstitial`)**: Full-screen modal ad displayed ONLY at natural non-financial transition points (e.g. leaving a calculator result area).
4. **REWARDED AD (`rewarded`)**: User-initiated ad that grants the configured reward ONLY after complete, uninterrupted playback.

---

## 3. Provider Architecture & Data Flow

```
UI Screen / Component
       ↓
  AdPlacement Component
       ↓
    adService (Boundary Service)
       ↓
  AdProviderFactory
       ↓
┌───────────────────────────────┬───────────────────────────────┐
│ Development (__DEV__ = true)  │ Production (__DEV__ = false)  │
├───────────────────────────────┼───────────────────────────────┤
│ SimulatedAdProvider           │ ApprovedAdProvider (Future)   │
│ (Development Simulator)       │ OR NoAdProvider (Fallback)    │
└───────────────────────────────┴───────────────────────────────┘
```

### Production Safety Guard
`SimulatedAdProvider` is strictly guarded by `__DEV__ === true`. The `AdProviderFactory` contains a **hard production gate** using the real `__DEV__` global (not overridable options). SimulatedAdProvider can **NEVER** be selected or rendered in production builds, even if `isDev` or `devSimulationEnabled` options are tampered with.

---

## 4. Frozen Placement Map

| # | Screen | File | Ad Type | Placement ID | Position |
|---|---|---|---|---|---|
| 1 | Home | `HomeScreen.jsx` | Native | `home_native` | Between loan summary & popular calculators |
| 2 | Home | `HomeScreen.jsx` | Banner | `home_banner` | After explore categories section |
| 3 | Tabs | `MainTabNavigator.jsx` | Banner | `tab_bottom_banner` | Above bottom tab bar |
| 4 | Calculators (cat 1) | `CalculatorsScreen.jsx` | Native | `calculator_native` | After Loan & Repayment category |
| 5 | Calculators (cat 2) | `CalculatorsScreen.jsx` | Banner | `calculator_banner` | After Investment & Wealth category |
| 6 | Calculators (cat 3) | `CalculatorsScreen.jsx` | Native | `calculator_native` | After Tax & Business category |
| 7 | EMI Calculator | `EMICalculatorScreen.jsx` | Banner | `calculator_banner` | After results section |
| 8 | My Loans | `MyLoansScreen.jsx` | Native | `home_native` | After primary loan card |
| 9 | My Loans | `MyLoansScreen.jsx` | Banner | `my_loans_banner` | After "Add Another Loan" button |
| 10 | Loan Details | `LoanDetailsScreen.jsx` | Native | `loan_details_native` | Between payment history & overview |
| 11 | Loan Details | `LoanDetailsScreen.jsx` | Native | `loan_details_native` | After settings/actions |
| 12 | Profile | `ProfileScreen.jsx` | Banner | `profile_banner` | After rewards card |
| 13 | Rewards | `RewardsScreen.jsx` | Native | `rewards_native` | After reward catalog items |
| 14 | Loan Calculators | `LoanCalculatorScreen.jsx` | Interstitial | `calculator_interstitial` | On back button press |
| 15 | EMI Calculator | `EMICalculatorScreen.jsx` | Interstitial | `calculator_interstitial` | On back button press |

### Centralized Placement Registry (`AD_PLACEMENTS`)

All IDs in `adPlacementConstants.js`:

- `HOME_BANNER` / `HOME_NATIVE` / `TAB_BOTTOM_BANNER`
- `CALCULATOR_BANNER` / `CALCULATOR_NATIVE` / `CALCULATOR_INTERSTITIAL`
- `MY_LOANS_BANNER` / `LOAN_DETAILS_NATIVE` / `LOAN_INSIGHTS_BANNER`
- `PROFILE_BANNER` / `PROFILE_NATIVE` / `PROFILE_REWARDED`
- `REWARDS_BANNER` / `REWARDS_NATIVE` / `REWARDS_REWARDED`

---

## 5. Interstitial Frequency & Decision Precedence

### Defaults (remotely configurable)
- **Cooldown**: 3 minutes between impressions
- **Max per Session**: 3 impressions per app session

### Decision Precedence Hierarchy
1. Financial Workflow Protection (100% ad-free protected screen)
2. Ad-Free Entitlement (`adFreeUntil > now`)
3. Offline Connectivity (`isOnline === false`)
4. Global Ads Disabled (`ads.enabled === false`)
5. Placement Disabled (per-screen RTDB config)
6. Provider Unavailable
7. Cooldown Active (< 3 mins elapsed)
8. Session Limit Reached (>= 3 impressions)
9. Double-Tap Guard (ref-based deduplication)
10. Show Impression

### Back Navigation Safety
If the interstitial is blocked for any reason, `navigation.goBack()` executes immediately. The user is **never trapped** on a screen due to ad failures.

---

## 6. Remote Configuration (`Firebase RTDB /config`)

```json
{
  "ads": {
    "enabled": true,
    "banner": { "enabled": true },
    "native": { "enabled": true },
    "interstitial": {
      "enabled": true,
      "cooldownMinutes": 3,
      "maxPerSession": 3
    },
    "rewarded": { "enabled": true },
    "placements": {
      "home": { "banner": true, "native": true, "interstitial": false },
      "calculators": { "banner": true, "native": true, "interstitial": true },
      "myLoans": { "banner": true, "native": true, "interstitial": false },
      "loanDetails": { "banner": true, "native": true, "interstitial": false },
      "profile": { "banner": true, "native": true, "interstitial": false },
      "rewards": { "banner": true, "native": true, "interstitial": false, "rewarded": true }
    }
  }
}
```

### Strict Validation Bounds
- `cooldownMinutes`: number between `1` and `1440`.
- `maxPerSession`: integer between `0` and `20`.
If remote config is malformed or invalid, `DEFAULT_ADS_CONFIG` local defaults (3 mins / 3 per session) are applied.

---

## 7. Ad-Free Entitlement & Connectivity Rules

1. **Ad-Free Entitlement (`adFreeUntil > now`)**: Automatically suppresses ordinary banner, native, and interstitial ads. Rewarded ads remain available (user-initiated).
2. **Internet Connection Requirement (`isInternetReachable`)**: Ads require internet. If offline, ad loading is bypassed cleanly without error toasts or broken UI.
3. **No Financial Actions Interruption**: AddPaymentScreen, balance updates, private details, notes, PDF generation, and repayment actions remain **100% ad-free**.

---

## 8. Protected Financial Workflows (100% Ad-Free)

These screens are always ad-free regardless of any configuration:

- Add Loan / Edit Loan
- Record Payment / Edit Payment / Delete Payment
- Balance Correction
- Prepayment Simulator / Payoff Planner
- Loan Goals / Loan Goal Details
- Private Details / Notes
- PDF Export / PDF Generation
- Local Data Privacy

RTDB configuration **cannot** override these protections.

---

## 9. Financial Data Firewall

Ad providers receive **ONLY**: `placementId`, `adType`, generic options.

They **NEVER** receive: loan amounts, EMIs, interest rates, balances, payment history, account numbers, notes, private details, credentials, or financial goals.

---

## 10. Real Provider Replacement Path

When Finzo obtains ad network approvals in the future:
1. Provision the approved SDK (AdMob / AppLovin / Unity).
2. Implement `ApprovedAdProvider` methods mapping `placementId` to real ad units.
3. No UI screen or component changes will be required.

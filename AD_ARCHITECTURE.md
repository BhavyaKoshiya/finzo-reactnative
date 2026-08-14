# Finzo — Advertising Architecture & Provider Specification (Feature-Frozen)

This document outlines the provider-agnostic, moderate, privacy-first advertising architecture for the **Finzo** application.

> **⚠️ ARCHITECTURE & PLACEMENT FREEZE (Phase 23)**: The advertising architecture, placement map, and `adTime` opportunity engine are **FEATURE-FROZEN**. Do NOT introduce new ad placements, ad networks, or alternative frequency models.

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
┌─────────────────────────────────────────────────────────────┐
│ MarketingAdProvider (react-native-marketing-plugin v0.4.0)   │
├──────────────────────────────┬──────────────────────────────┤
│ Development (__DEV__ = true) │ Production (__DEV__ = false) │
├──────────────────────────────┼──────────────────────────────┤
│ Test Ad Units / Test Config  │ Live Ad Units / Prod Config  │
└──────────────────────────────┴──────────────────────────────┘
```

### Production Safety Guard
`SimulatedAdProvider` is strictly prohibited in production builds (`__DEV__ === false`). Both development and production run on `MarketingAdProvider` (adapting `react-native-marketing-plugin` backed by `react-native-google-mobile-ads`), ensuring identical lifecycle behavior while separating test and production ad unit configurations.

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

## 5. Interstitial Frequency & App-Side `adTime` Architecture (Phase 22)

### Defaults & Configuration Source
- **Opportunity Gating (`adTime`)**: Read from marketing JSON model (`adTime: 3` default). An interstitial is presented every $N$-th eligible non-financial opportunity.
- **Max per Session (`maxPerSession`)**: Hard ceiling of 3 impressions per app session.
- **State Scope**: In-memory / session state managed by `interstitialFrequencyService`. Zero persistence in financial Redux slices.

### Decision Precedence Hierarchy
1. **Financial Workflow Protection** (15 protected screens $\rightarrow$ STOP, zero counter accumulation)
2. **Ad-Free Entitlement** (`adFreeUntil > now` $\rightarrow$ STOP, zero counter accumulation)
3. **Offline Connectivity** (`isOnline === false` $\rightarrow$ STOP, zero counter accumulation)
4. **Global Ads Disabled** (`ads.enabled === false` $\rightarrow$ STOP, zero counter accumulation)
5. **Placement Disabled** (per-screen RTDB config $\rightarrow$ STOP, zero counter accumulation)
6. **Session Limit Reached** (`sessionCount >= 3` $\rightarrow$ STOP)
7. **Opportunity Counting & Threshold Check**:
   - Increments in-memory `opportunityCounter++`.
   - If `opportunityCounter < adTime` $\rightarrow$ suppress (`THRESHOLD_NOT_MET`).
   - If `opportunityCounter >= adTime` $\rightarrow$ reset `opportunityCounter = 0`, increment `sessionCount++`, trigger interstitial show.
8. **Double-Tap / Concurrency Guard** (`isInterstitialShowing` request lock)
9. **Show Impression** via `MarketingAdProvider`

### Back Navigation Safety & Provider Failure
If an interstitial is suppressed or the provider fails to load, `navigation.goBack()` executes immediately. The opportunity counter remains consumed/reset to prevent repeated immediate ad attempts on subsequent taps.

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

---

## 11. Startup Ad Initialization & Preloading (Phase 27)

### Startup Sequence & 5-Second Splash Cap
1. **BootSplash Visibility**: The native BootSplash is displayed upon app launch while `AppStartupGate` performs startup tasks.
2. **Ad SDK Initialization & Preloading**: `MarketingAdProvider` initializes `react-native-marketing-plugin` and begins preloading supported ad inventory (Banner descriptors, Native descriptors, Interstitial ads, and Rewarded ads if configured).
3. **Maximum 5-Second Splash Wait**:
   - `AppStartupGate` awaits ad initialization/preload and realtime configuration for a **maximum of 5.0 seconds** (`AD_STARTUP_TIMEOUT_MS = 5000`).
   - If ad initialization completes early (e.g. at 1s or 2s), Splash dismisses immediately.
   - If ad initialization takes longer than 5 seconds, Splash dismisses at 5s and startup continues past Splash.
4. **Non-Cancelling Async Background Continuation**:
   - The 5-second timeout applies **strictly to the Splash screen wait**.
   - It **NEVER** cancels, aborts, or resets underlying in-flight ad preload requests.
   - Late-loading ads continue loading asynchronously in the background.
5. **Late-Loaded Ad Behavior**:
   - When late-loaded banner and native ads finish loading, they render immediately upon component mount.
   - Late-loaded interstitials remain cached in memory for future authorized use.
   - **CRITICAL**: Preloaded or late-loaded ads **NEVER** automatically display. Interstitials and rewarded ads only display when explicitly requested by user action and authorized by `adDecisionEngine`.
6. **Zero Impact on Frequency & Session Limits**:
   - Preload operations do NOT increment `opportunityCounter`.
   - Preload operations do NOT consume the 3/session interstitial limit.
   - Preload operations do NOT bypass `adDecisionEngine` or financial workflow protections.


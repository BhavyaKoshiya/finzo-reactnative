# Finzo — Advertising Architecture & Provider Specification (Phase 16.16)

This document outlines the provider-agnostic, moderate, privacy-first advertising architecture for the **Finzo** application.

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
`SimulatedAdProvider` is strictly guarded by `__DEV__ === true`. It can **NEVER** be selected or rendered in production builds.

---

## 4. Centralized Placement Registry (`AD_PLACEMENTS`)

Placement IDs are centrally registered to prevent string literal scattering:

- `HOME_BANNER` / `HOME_NATIVE`
- `CALCULATOR_BANNER` / `CALCULATOR_NATIVE` / `CALCULATOR_INTERSTITIAL`
- `MY_LOANS_BANNER`
- `LOAN_DETAILS_NATIVE`
- `PROFILE_BANNER` / `PROFILE_NATIVE` / `PROFILE_REWARDED`
- `REWARDS_BANNER` / `REWARDS_NATIVE` / `REWARDS_REWARDED`

---

## 5. Frequency Management (`adFrequencyService`)

Interstitial ads are strictly frequency-capped locally:
- **Max per Session**: 1 impression default (`interstitial.maxPerSession = 1`).
- **Cooldown Duration**: At least 10 minutes between impressions default (`interstitial.cooldownMinutes = 10`).
- **Local In-Memory State**: Frequency tracking is strictly local and never transmitted to Firebase or analytics.

---

## 6. Remote Configuration (`Firebase RTDB /config`)

Ad behavior is controlled dynamically via RTDB `/config/ads`:

```json
{
  "ads": {
    "enabled": true,
    "banner": { "enabled": true },
    "native": { "enabled": true },
    "interstitial": {
      "enabled": true,
      "cooldownMinutes": 10,
      "maxPerSession": 1
    },
    "rewarded": { "enabled": true },
    "placements": {
      "home": { "banner": true, "native": false, "interstitial": false },
      "calculators": { "banner": true, "native": true, "interstitial": true },
      "myLoans": { "banner": true, "native": false, "interstitial": false },
      "loanDetails": { "banner": false, "native": true, "interstitial": false },
      "profile": { "banner": true, "native": false, "interstitial": false },
      "rewards": { "banner": true, "native": true, "interstitial": false }
    }
  }
}
```

### Safe Fallbacks
If remote configuration is missing, malformed, or invalid, `DEFAULT_ADS_CONFIG` ensures safe fallback behavior without breaking app rendering.

---

## 7. Ad-Free Entitlement & Connectivity Rules

1. **Ad-Free Entitlement (`adFreeUntil > now`)**:
   Automatically suppresses ordinary banner, native, and interstitial ads across all screens.
2. **Internet Connection Requirement (`isInternetReachable`)**:
   Ads require internet access. If offline, ad loading is bypassed cleanly without error toasts or broken UI placeholders.
3. **No Financial Actions Interruption**:
   `AddPaymentScreen`, balance updates, private details, notes, PDF generation, and repayment actions remain **100% ad-free**.

---

## 8. Real Provider Replacement Path

When Finzo obtains ad network approvals in the future:
1. Provision the approved SDK (AdMob / AppLovin / Unity).
2. Implement `ApprovedAdProvider` methods mapping `placementId` to real ad units.
3. No UI screen or component changes will be required.

# Finzo — Advertising Provider Architecture (Phase 21)

This document specifies the technical integration of **react-native-marketing-plugin v0.4.0** (backed by `react-native-google-mobile-ads` and `react-native-device-info`) as Finzo's official advertising provider adapter.

---

## 1. Architectural Authority Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Finzo UI & Financial Workflows (AdPlacement / useInterstitial)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Finzo adService & adDecisionEngine (Authoritative Engine)    │
│  - interstitialFrequencyService (adTime Opportunity Counter) │
│  - 3/Session Limit - 15 Protected Screens - Ad-Free Timer    │
│  - Offline Gating  - 5 Rewarded/Day Cap                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ AdProviderFactory                                           │
│  - Development (__DEV__ === true) → MarketingAdProvider     │
│  - Production (__DEV__ === false) → MarketingAdProvider     │
│  - SimulatedAdProvider: Isolated QA / unit testing only     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ MarketingAdProvider (src/services/ads/marketingAdProvider.js)│
│  - Wraps react-native-marketing-plugin                      │
│  - Dispatches BannerAdView & NativeAdComponent               │
│  - Enforces enableAppOpenOnResume: false                    │
│  - Handles fail-safe continuation on interstitial failure   │
│  - Binds rewarded ad completion to rewardedAdSessionManager │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ react-native-marketing-plugin → react-native-google-mobile-ads│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environment-Aware Configuration & Single Source of Truth for adTime

### Authoritative Resolution Path
```
Marketing JSON ("adTime": N)
       ↓
react-native-marketing-plugin (marketingPlugin.adModel.adTime)
       ↓
MarketingAdProvider.getAdTime() [Normalizes to integer >= 1]
       ↓
adService.getAdTime() [Provides single authoritative accessor]
       ↓
interstitialFrequencyService.checkFrequencyStatus() / recordEligibleOpportunity()
       ↓
adDecisionEngine.canShowAd()
       ↓
MarketingAdProvider.showInterstitial()
```

### Environment Endpoints
The marketing plugin resolves its configuration JSON via `baseUrl` and `bundleId`:
- **Development (`__DEV__ === true`)**:
  - Connects to development configuration endpoint (`https://ad-config-dev.finzocalculator.com/api` or configured test URL).
  - Uses test ad unit IDs (`TestIds.BANNER`, `TestIds.INTERSTITIAL`, `TestIds.REWARDED`).
- **Production (`__DEV__ === false`)**:
  - Connects to production configuration endpoint (`https://ad-config.finzocalculator.com/api` or remote RTDB config).
  - Serves live production ad units according to remote JSON model.

---

## 3. Financial Firewall & Security Invariants

1. **Zero Financial Data Ingestion**:
   - `MarketingAdProvider` receives strictly generic metadata (`placementId`, `adType`, `screen`).
   - Loan amount, interest rate, EMI, bank balance, account numbers, and private notes NEVER cross into the ad layer.
2. **App-Open Protection**:
   - `enableAppOpenOnResume` is strictly hard-coded to `false` during plugin initialization, protecting user financial calculations and navigation from intrusive full-screen disruptions.
3. **Fail-Safe Continuation**:
   - If an ad fails to load, times out, or throws, `MarketingAdProvider` catches the error and finishes cleanly, allowing user navigation and calculator exits to proceed without interruption.
4. **Rewarded Session Verification**:
   - Completion callbacks invoke `rewardedAdSessionManager.claimRewardForSession(sessionId)` to guarantee idempotent, single-grant rewards that strictly adhere to the 5-ads/day limit.

---

## 4. Startup Ad Initialization & Preloading Lifecycle (Phase 27)

### Provider Preload Responsibilities
`MarketingAdProvider` executes the following preload sequence during app startup:
1. **Banner Preload**: Calls `bannerAdManager.preloadAll()` to populate pre-built configuration descriptors for AdMob, Ad Manager, and Qureka fallback.
2. **Native Preload**: Calls `nativeAdManager.preloadAll(MyAds.nativeNormal)` to prepare NativeTemplateStyle and BoxConstraints.
3. **Interstitial Preload**: Calls `interstitialAdManager.preloadAds()` to load AdMob / Ad Manager full-screen interstitial inventory into memory cache.
4. **Rewarded Preload**: If `isrewarded` is enabled in `adModel`, calls `rewardedAdManager.preloadAds()`.

### Safety & Timing Guarantees
- **5-Second Startup Cap**: Splash screen waits for at most 5 seconds for ad readiness; if ready earlier, continues immediately.
- **Asynchronous Continuation**: Timeout does not abort in-flight ad requests; they continue loading in the background.
- **No Auto-Display**: Preloaded interstitials and rewarded ads remain strictly in memory and are ONLY displayed upon explicit, authorized user action.
- **No Side-Effects on Counters**: Preloading does not mutate `opportunityCounter`, does not consume the 3/session limit, and does not bypass `adDecisionEngine`.


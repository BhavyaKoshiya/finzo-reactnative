# Finzo Swappable Advertising Architecture (Phase 16.15)

## 1. Overview & Principles
Finzo implements a provider-agnostic, multi-tier advertising architecture designed for maximum developer safety, zero financial data leakage, and clean separation between UI components and provider SDKs.

### Core Safeguards:
- **No Real Advertising SDK Installed**: Finzo currently has no active third-party advertising SDK installed (e.g. AdMob / AppLovin / Unity).
- **Development Simulation**: Local testing is performed via `SimulatedAdProvider`, strictly gated by `__DEV__ === true` AND developer simulation flag.
- **Production Safeguard**: In production (`__DEV__ === false`), `AdProviderFactory` strictly returns `NoAdProvider`. Simulated ads cannot be selected or rendered in production.
- **Zero Data Leakage**: User financial data (loan amounts, EMI, balances, notes, credentials) is NEVER passed to the advertising layer or external SDKs.
- **Firebase Configuration Only**: Firebase RTDB supplies remote configuration parameters (`pointsPerAd`, `dailyWatchLimit`, `cooldownMinutes`, `milestone`). User reward balances and progress remain strictly local.

---

## 2. Architectural Flow

```
UI Screens (ProfileScreen, RewardsScreen)
  ↓
Reusable Components (AdBanner, RewardedAdButton, RewardedAdModal)
  ↓
Ad Service Boundary (adService.js)
  ↓
Provider Contract (baseAdProvider.js)
  ↓
Provider Factory (adProviderFactory.js)
  ├── Development (__DEV__ = true) ──→ SimulatedAdProvider.js
  ├── Production (__DEV__ = false) ───→ NoAdProvider.js
  └── Future Real SDK ───────────────→ ApprovedAdProvider.js
```

---

## 3. Directory & File Structure
```
src/
  services/
    adService.js                     # Main application-facing advertising API
    adProviderFactory.js             # Determines active provider based on environment
    ads/
      adPlacementConstants.js        # Centralized placement IDs (HOME_BANNER, PROFILE_REWARDED, etc.)
      adProviderTypes.js             # Provider type & lifecycle state enums
      baseAdProvider.js              # Provider contract interface
      noAdProvider.js                # Production-safe fallback provider
      simulatedAdProvider.js         # Development-only simulation provider
      approvedAdProvider.js          # Future real provider stub interface
      mockRealAdProvider.js          # Mock provider for contract compatibility testing
  components/
    ads/
      AdBanner.jsx                   # Reusable banner component
      RewardedAdButton.jsx           # Reusable rewarded ad button CTA
      RewardedAdModal.jsx            # Development test video ad modal container
      DevAdControlsModal.jsx         # Development-only controls modal
```

---

## 4. Provider Contract Interface
All providers implement the exact same contract methods:
- `getType()`
- `isConfigured()`
- `isBannerAvailable(placementId)`
- `loadBanner(placementId)`
- `destroyBanner(placementId)`
- `isRewardedAvailable(placementId)`
- `loadRewarded(placementId)`
- `showRewarded(placementId, options)`
- `destroyRewarded(placementId)`

---

## 5. Rewarded Ad & Daily Milestone Flow
1. User taps `<RewardedAdButton placementId="profile_rewarded" />`.
2. Button invokes `adService.showRewarded()`.
3. In `__DEV__`, `SimulatedAdProvider` launches `RewardedAdModal` countdown modal (5s playback).
4. Upon completion, provider returns `{ status: 'COMPLETED', transactionId, provider: 'simulated' }`.
5. `rewardService.processRewardedAdCompletion(dispatch, result, state)` dispatches `recordRewardedAdCompletion` (+10 points).
6. When `rewardedAdsWatchedToday >= milestone.requiredAds` (e.g. 5 ads), `rewardService` dispatches `claimRewardedAdMilestone` (+30 minutes ad-free).
7. Milestone claims are idempotent per calendar day (`dateKey = YYYY-MM-DD`). Duplicate claims on the same day are ignored.
8. Ad-free entitlement stacks onto existing `adFreeUntil` if active.

---

## 6. Future Approved Provider Replacement Steps
When advertising SDK approval is obtained:
1. Install approved advertising SDK package.
2. Update `ApprovedAdProvider.js` to initialize real SDK.
3. Configure native App IDs and Ad Unit IDs in central config.
4. Update `AdProviderFactory.js` to return `ApprovedAdProvider` in production when initialized.
5. **No UI redesign is required** — screens will continue calling `adService`, `<AdBanner />`, and `<RewardedAdButton />`.

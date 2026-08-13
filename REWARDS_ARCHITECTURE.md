# Finzo Rewards & Entitlements Architecture (Phase 16.15 Update)

## 1. Summary
The Finzo Rewards system provides habit-forming incentives (Daily Check-In, Rewarded Ads, Ad-Free Milestones, and Points Redemptions) while upholding Finzo's offline-first privacy standards.

---

## 2. Remote Configuration vs Local User State
- **Firebase RTDB (`/config`)**:
  - Remote control over feature flags, points per ad, daily watch limits, cooldowns, and milestone targets.
  - NEVER receives or stores user points, transaction history, check-in dates, or ad-free expiration dates.
- **Redux Persistence (`rewardsSlice.js`)**:
  - All user balances, streaks, history transactions, daily watch counts, and ad-free expiry dates reside 100% locally on the device using `@react-native-async-storage/async-storage`.

---

## 3. Rewarded-Ad Milestone & Points Specification
- **Points per Ad**: Firebase RTDB configurable (`rewardedAds.pointsPerAd`, default `10`).
- **Daily Watch Limit**: Firebase RTDB configurable (`rewardedAds.dailyWatchLimit`, default `5`).
- **Cooldown**: Firebase RTDB configurable (`rewardedAds.cooldownMinutes`, default `0`).
- **Daily Milestone**:
  - Target: Firebase RTDB configurable (`rewardedAds.milestone.requiredAds`, default `5`).
  - Reward: Firebase RTDB configurable (`rewardedAds.milestone.adFreeMinutes`, default `30`).
  - Idempotency: Identity `milestone_YYYY-MM-DD` guarantees the milestone reward can only be claimed ONCE per calendar day.
  - Entitlement Stacking: Ad-free duration stacks onto unexpired `adFreeUntil` timestamps.

---

## 4. Schema & Validation Safety
Validation in `realtimeConfigSchema.js` rejects impossible configurations:
- `milestone.requiredAds > dailyWatchLimit` (e.g. required 5 ads but limit is 3) $\rightarrow$ Validation fails, falling back to safe local defaults.

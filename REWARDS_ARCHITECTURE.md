# FINZO REWARDS ARCHITECTURE & ENTITLEMENT MODEL

This document details the architecture, state model, streak logic, redemption ledger, entitlement stacking, dynamic RTDB config, discount engine, and future expansion boundaries for the **Finzo Rewards System**.

---

## 1. Core Principles

1. **Strictly Optional**: Rewards, points, daily check-ins, dynamic ladders, and ad-free redemptions are 100% optional. Financial calculation tools, formulas, saved snapshots, and PDF generation must **NEVER** depend on rewards or require watching an ad.
2. **Local-First & Offline**: All point transactions, streaks, check-in dates, and ad-free entitlements are stored locally on the device via Redux Toolkit and `redux-persist` (`@react-native-async-storage/async-storage`).
3. **Configuration Engine**: Remote configuration (RTDB `/config`) dynamically controls check-in schedules, UI copy, package pricing, discounts, and feature flags with complete offline fallback protection.

---

## 2. Redux State (`rewardsSlice`)

State location: `src/store/slices/rewardsSlice.js`

```javascript
{
  points: 0,              // Total accumulated Finzo points (Integer >= 0)
  currentStreak: 0,       // Active consecutive day streak
  longestStreak: 0,       // All-time highest streak count
  lastCheckInDate: null,  // ISO string timestamp of latest check-in
  totalCheckIns: 0,       // Lifetime check-in count
  adFreeUntil: null,      // ISO string timestamp for ad-free entitlement (null = inactive)
  rewardHistory: [],      // Array of recent reward transactions with metadata (max 100 entries)
  schemaVersion: 1
}
```

---

## 3. Dynamic Daily Check-In Reward Ladder

Schedule calculated dynamically via `dailyCheckInUtils.js`:
- **Default Schedule**:
  - Day 1 $\rightarrow$ 5 points
  - Day 2 $\rightarrow$ 7 points
  - Day 3 $\rightarrow$ 9 points
  - Day 4 $\rightarrow$ 12 points
  - Day 5 $\rightarrow$ 15 points
  - Day 6 $\rightarrow$ 17 points
  - Day 7 $\rightarrow$ 20 points
- **Day 8+ Behavior**: When `repeatLastReward: true`, streak counts $\ge 7$ receive max reward (20 points) without resetting streak count.
- **Missed Day Rule**: Missing a calendar day resets `currentStreak` to 0 before today's claim. Today's successful claim becomes Day 1 (5 points). Longest streak and existing points remain intact.
- **Idempotency**: 1 claim per calendar day.

---

## 4. Configurable Store & Discount Engine

- Central catalog loaded from active configuration (`rewards.redeemable`).
- **Discount Support**:
  - `percentage`: $0 < \text{value} \le 100\%$
  - `fixed`: $0 < \text{value} < \text{pointsCost}$
  - Supports `startsAt` and `endsAt` date windows.
  - Price floor invariant: $\text{finalPointsCost} \ge 1$.
- **Redemption Authority**: `calculateRewardPrice(reward, now)` re-evaluates active discounts at moment of redemption.

---

## 5. Transaction Snapshots (`rewardHistory`)

All transactions record permanent snapshots in `rewardHistory` (max 100 entries):
- **Daily Check-In Snapshot**:
  `metadata: { streakDay, rewardScheduleDay, pointsAwarded }`
- **Redemption Snapshot**:
  `metadata: { rewardId, title, durationMinutes, basePointsCost, finalPointsCost, discountAmount, discountType, discountValue, discountLabel }`
- Historical records are immutable and never recalculate when remote configuration changes.

---

## 6. Ad-Free Entitlement & Stacking Rules

- **State Field**: `adFreeUntil`
- **Active Evaluation**: `isAdFreeActive = adFreeUntil != null && new Date(adFreeUntil) > new Date()`
- **Entitlement Stacking**:
  $$\text{baseTime} = \max(\text{now}, \text{existing } \mathtt{adFreeUntil})$$
  $$\text{newExpiry} = \text{baseTime} + \text{durationMinutes}$$
- **Expired Entitlement**: If `adFreeUntil < now`, redemption starts from `now`.

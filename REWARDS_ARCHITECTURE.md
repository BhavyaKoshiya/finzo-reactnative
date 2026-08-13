# Finzo — Rewards Architecture & Engine Specification

This document defines the offline-first reward point engine, daily check-in streaks, daily rewarded ad milestones, store catalog, and ad-free entitlement lifecycle.

---

## 1. Core Architecture

```
User Action (Check-In / Rewarded Ad)
         ↓
  rewardService
         ↓
    Redux Store (rewardsSlice)
         ↓
AsyncStorage Persistence (redux-persist)
```

---

## 2. Daily Check-In Schedule

Points rewarded follow a 7-day schedule (`rewardSchedule: [5, 7, 9, 12, 15, 17, 20]`):
- **Day 1**: 5 points
- **Day 2**: 7 points
- **Day 3**: 9 points
- **Day 4**: 12 points
- **Day 5**: 15 points
- **Day 6**: 17 points
- **Day 7**: 20 points (Max Reward)

Missing a day resets the streak back to Day 1.

---

## 3. Daily Rewarded Ad Milestone & Ad-Free Entitlement

- **Points per Ad**: 10 points default
- **Daily Watch Limit**: 5 ads max per calendar day
- **Milestone Requirement**: Watching 5 ads in a single day unlocks 30 minutes of ad-free access.
- **Stacking Policy**: If an ad-free entitlement is already active (`adFreeUntil > now`), claiming another entitlement extends the duration from `adFreeUntil + durationMinutes`. If expired, it starts from `now + durationMinutes`.

---

## 4. Security & Replay Protection

1. **Session ID Requirement**: `rewardedAdSessionManager` issues a unique `sessionId` per attempt.
2. **Single Claim Lock**: A session ID can ONLY transition from `COMPLETED` to `REWARDED` once.
3. **Daily Cap Enforcement**: Attempt #6 in a calendar day is rejected by the reward engine with zero points.

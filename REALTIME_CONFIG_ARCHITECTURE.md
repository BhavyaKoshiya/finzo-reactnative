# FINZO REALTIME CONFIGURATION ARCHITECTURE

This document details the design, fallback hierarchy, versioning schema, security boundaries, and subscriber pattern for the **Finzo Realtime Configuration System** powered by Firebase Realtime Database (RTDB).

---

## 1. Overview & Fallback Hierarchy

The configuration system enforces a strict 3-tier fallback hierarchy to guarantee **offline-first reliability** and crash protection:

```
1. Active Valid Firebase RTDB (/config)
             ↓ (Validation Error / Offline)
2. Last Known Good Configuration (AsyncStorage: @finzo_last_known_config)
             ↓ (First Launch / Cleared Storage)
3. Local Fallback Defaults (src/config/realtimeConfigDefaults.js)
```

- **Single Active Source**: Finzo UI components and services access configuration exclusively via `realtimeConfigService` and pure selectors (`realtimeConfigSelectors.js`).
- **Zero Raw Firebase Leakage**: UI components never call Firebase SDK APIs directly.

---

## 2. RTDB Data Schema (`version: 1`)

Target path: `/config`

```json
{
  "version": 1,
  "rewards": {
    "dailyCheckIn": {
      "enabled": true,
      "rewardSchedule": {
        "1": 5,
        "2": 7,
        "3": 9,
        "4": 12,
        "5": 15,
        "6": 17,
        "7": 20
      },
      "maxReward": 20,
      "repeatLastReward": true,
      "cycleLength": 7,
      "ui": {
        "enabled": true,
        "title": "Daily Check-In",
        "subtitle": "Keep your streak going and earn more Finzo Points.",
        "newUserTitle": "Start Your Streak",
        "newUserSubtitle": "Check in every day to unlock bigger rewards.",
        "streakTitle": "{count} Day Streak",
        "todayRewardLabel": "Today's Reward",
        "nextRewardLabel": "Next Check-In",
        "progressTitle": "Weekly Progress",
        "claimButtonText": "Claim {points} Points",
        "claimedButtonText": "Claimed Today",
        "pointsSuffix": "Points",
        "missedStreakMessage": "Start a new streak today.",
        "maxRewardMessage": "You're earning the maximum daily reward!",
        "successMessage": "+{points} Points earned!",
        "dayLabel": "Day {day}",
        "showProgress": true,
        "showNextReward": true,
        "showStreak": true,
        "showRewardHistory": true
      }
    },
    "redeemable": {
      "ad_free_1h": {
        "enabled": true,
        "type": "ad_free",
        "title": "1 Hour Ad-Free",
        "description": "Enjoy Finzo completely ad-free for 1 hour.",
        "pointsCost": 100,
        "durationMinutes": 60,
        "order": 1,
        "discount": {
          "enabled": false,
          "type": "percentage",
          "value": 0,
          "label": "",
          "startsAt": null,
          "endsAt": null
        }
      }
    }
  },
  "ads": {
    "enabled": false,
    "rewardedEnabled": false,
    "rewardedPoints": 0,
    "dailyRewardedLimit": 0
  },
  "featureFlags": {
    "rewardsEnabled": true
  }
}
```

---

## 3. Schema Validation & Versioning (`realtimeConfigSchema.js`)

Before activating any payload received from RTDB, `validateRealtimeConfig(payload)` enforces strict integrity checks:
1. `payload.version === 1`: If an unsupported version is received, the remote payload is **rejected** and the app retains its last-known-good configuration.
2. **Numeric Bounds & Day 1 Guarantee**: Verifies `cycleLength` (1–365), positive schedule points, and presence of Day 1 in `rewardSchedule`.
3. **UI Copy Limits**: String values bounded (1–200 chars).
4. **Discount Validations**: Percentage discounts bounded ($0 < \text{value} \le 100\%$), fixed discounts bounded ($0 < \text{value} < \text{pointsCost}$).

---

## 4. Copy Interpolation (`realtimeConfigUtils.js`)

Dynamic strings support token interpolation via `interpolateRewardCopy(template, values)`:
- `{points}` $\rightarrow$ Calculated points to award/redeem
- `{count}` $\rightarrow$ Current active streak count
- `{day}` $\rightarrow$ Day number
- `{nextReward}` $\rightarrow$ Tomorrow's upcoming reward

---

## 5. Security & Privacy Boundary

- **RTDB Access Rules**:
  - `read: true` for `/config`
  - `write: false` (Deny all mobile writes)
- **Privacy Assurance**: Finzo **NEVER** uploads user points, streaks, financial inputs, saved calculations, or PDFs to Firebase. RTDB is purely read-only remote configuration.

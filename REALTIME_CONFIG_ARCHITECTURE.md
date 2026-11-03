# LOANPILOT REALTIME CONFIGURATION ARCHITECTURE

This document details the design, fallback hierarchy, versioning schema, security boundaries, discount engine, administrative provisioning process, and subscriber pattern for the **LoanPilot Realtime Configuration System** powered by Firebase Realtime Database (RTDB).

---

## 1. Overview & Fallback Hierarchy

The configuration system enforces a strict 3-tier fallback hierarchy to guarantee **offline-first reliability** and crash protection:

```
1. Active Valid Firebase RTDB (/config)
             ↓ (Validation Error / Empty / Outage)
2. Last-Known-Good Configuration (AsyncStorage: @loanpilot_last_known_config)
             ↓ (First Launch / Cleared Storage)
3. Local Fallback Defaults (src/config/realtimeConfigDefaults.js)
```

- **Single Active Source**: LoanPilot UI components and services access configuration exclusively via `realtimeConfigService` and pure selectors (`realtimeConfigSelectors.js`).
- **Zero User Data in RTDB**: RTDB `/config` contains public-read application configuration only (reward schedules, redemption package pricing, discount rules, feature flags). User points, check-in history, streak counters, loan profiles, payment history, and saved calculations remain strictly on local storage (`AsyncStorage`).

---

## 2. RTDB Data Schema (`version: 1`)

Target path: `/config`

```json
{
  "version": 1,
  "rewards": {
    "dailyCheckIn": {
      "enabled": true,
      "schedule": {
        "day1": 5,
        "day2": 7,
        "day3": 9,
        "day4": 12,
        "day5": 15,
        "day6": 17,
        "day7": 20,
        "day8Plus": 20
      },
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
      "missedDayResetsStreak": true,
      "ui": {
        "enabled": true,
        "title": "Daily Check-In",
        "subtitle": "Keep your streak going and earn more LoanPilot Points.",
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
        "description": "Enjoy LoanPilot completely ad-free for 1 hour.",
        "pointsCost": 50,
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
      },
      "ad_free_6h": {
        "enabled": true,
        "type": "ad_free",
        "title": "6 Hours Ad-Free",
        "description": "Enjoy LoanPilot completely ad-free for 6 hours.",
        "pointsCost": 150,
        "durationMinutes": 360,
        "order": 2,
        "discount": {
          "enabled": false,
          "type": "percentage",
          "value": 0,
          "label": "",
          "startsAt": null,
          "endsAt": null
        }
      },
      "ad_free_24h": {
        "enabled": true,
        "type": "ad_free",
        "title": "24 Hours Ad-Free",
        "description": "Enjoy LoanPilot completely ad-free for 24 hours.",
        "pointsCost": 400,
        "durationMinutes": 1440,
        "order": 3,
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
  "redemption": {
    "enabled": true,
    "packages": {
      "ad_free_1h": {
        "enabled": true,
        "durationMinutes": 60,
        "pointsCost": 50,
        "title": "1 Hour Ad-Free",
        "description": "Enjoy LoanPilot without ads for 1 hour."
      },
      "ad_free_6h": {
        "enabled": true,
        "durationMinutes": 360,
        "pointsCost": 150,
        "title": "6 Hours Ad-Free",
        "description": "Enjoy LoanPilot without ads for 6 hours."
      },
      "ad_free_24h": {
        "enabled": true,
        "durationMinutes": 1440,
        "pointsCost": 400,
        "title": "24 Hours Ad-Free",
        "description": "Enjoy LoanPilot without ads for 24 hours."
      }
    }
  },
  "discounts": {
    "enabled": true,
    "packages": {}
  },
  "ads": {
    "enabled": false,
    "rewardedAdsEnabled": false,
    "bannerAdsEnabled": false,
    "interstitialAdsEnabled": false,
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
2. **Reward Ladder Validation**: All daily check-in schedule points must be positive integers ($> 0$). Zero or negative points cause schema rejection.
3. **Package Pricing & Duration**: `durationMinutes >= 1` and `pointsCost >= 1`.
4. **UI Copy Limits**: String values bounded (title $\le 80$, description $\le 200$ chars).
5. **Discount Validation**: Percentage discounts bounded ($0 < \text{value} \le 100\%$), fixed discounts bounded ($0 < \text{value} < \text{pointsCost}$), and price floor enforced ($\text{finalPointsCost} \ge 1$).

---

## 4. Administrative Provisioning

Administrative payload file and script:
- Payload file: [rtdb_config_payload.json](file:///Users/bhavyakoshiya/Documents/ReactNative/LoanPilot/scripts/rtdb_config_payload.json)
- Validation script: [provision_rtdb_config.js](file:///Users/bhavyakoshiya/Documents/ReactNative/LoanPilot/scripts/provision_rtdb_config.js)
- Firebase CLI provisioning command:
  ```bash
  npx -y firebase-tools@latest database:set /config scripts/rtdb_config_payload.json --force
  ```

---

## 5. Security & Privacy Boundary

- **RTDB Access Rules**:
  - `.read`: `true` for `/config`
  - `.write`: `false` (Deny all client writes)
- **Privacy Guarantee**: LoanPilot **NEVER** uploads user points, streaks, loan profiles, payment history, saved calculations, or PDFs to Firebase. RTDB is purely read-only remote configuration.

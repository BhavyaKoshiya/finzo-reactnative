# Finzo — App Update Architecture & Version Governance

This document specifies the remote-configured application update system for the **Finzo** mobile application.

---

## 1. Overview & Core Philosophy

Finzo implements a remote-configured version governance system powered by Firebase Realtime Database (`/config/appUpdate`).

### Core Invariants
1. **Version Policy Only in Firebase**: Firebase RTDB controls version thresholds (`minimumVersion`, `latestVersion`, `enabled`, `updateTitle`, `updateMessage`).
2. **Store Destinations Belong to Application**: Store URLs and package intents (`com.finzo.financecalculator`) are strictly centralized in `appStoreService.js` and are NEVER stored in Firebase.
3. **Fail-Safe Operation**: Missing, null, malformed, or unreachable remote configurations default to `UPDATE_TYPES.NONE`, ensuring users are never accidentally locked out of their local financial records.
4. **Offline Precedence**: When offline (`isOnline === false`), `ConnectivityGate` displays `InternetRequiredScreen`. The update gate is only evaluated when online connectivity is confirmed.

---

## 2. Remote Configuration Structure

Path in Firebase Realtime Database: `/config/appUpdate`

```json
{
  "enabled": true,
  "minimumVersion": "1.0.0",
  "latestVersion": "1.0.0",
  "updateTitle": "Update Finzo",
  "updateMessage": "A newer version of Finzo is required to continue using the application."
}
```

### Field Definitions
- `enabled` (*boolean*): Master kill-switch. When `false`, suppresses all update prompts.
- `minimumVersion` (*string*): Minimum supported semver version. If `installedVersion < minimumVersion`, triggers a **Mandatory Update**.
- `latestVersion` (*string*): Latest available semver version. If `installedVersion < latestVersion` and `installedVersion >= minimumVersion`, triggers an **Optional Update**.
- `updateTitle` (*string*): Custom title for the update modal.
- `updateMessage` (*string*): Custom description explaining the update requirements.

---

## 3. Version Decision Matrix

| Condition | Update Type | UI Behavior | Dismissible |
|---|---|---|---|
| `installed >= latestVersion` | `NONE` | Normal application access | N/A |
| `installed >= minimum` AND `installed < latest` | `OPTIONAL` | "Update Available" modal with "Update Now" & "Not Now" | YES (session-scoped) |
| `installed < minimumVersion` | `MANDATORY` | "Update Finzo" locking modal with "Update Now" | NO (Back blocked) |
| `enabled === false` | `NONE` | Normal application access | N/A |
| Malformed / Unreachable Config | `NONE` | Safe fallback to normal app access | N/A |

---

## 4. Startup & Execution Sequence

```
Native BootSplash
        ↓
React Initialization
        ↓
Redux Rehydration (PersistGate)
        ↓
Connectivity Gate (InternetRequiredScreen if offline)
        ↓
AppUpdateGate (Subscribes to realtimeConfigService)
        ↓
appUpdateService.checkAppUpdate()
        ↓
Mandatory Update?
  ├── YES → AppUpdateModal (Non-dismissible, blocks BackHandler & navigation)
  └── NO  → Main AppNavigator + Optional Update Modal (if eligible & not dismissed)
```

---

## 5. Store Redirection

Store URLs are managed exclusively in `src/services/appStoreService.js`:

- **Android**:
  - Primary Intent: `market://details?id=com.finzo.financecalculator`
  - Fallback Web: `https://play.google.com/store/apps/details?id=com.finzo.financecalculator`
- **iOS**:
  - Primary Intent: `itms-apps://apps.apple.com/app/id[FINZO_IOS_APP_ID_PLACEHOLDER]`
  - Fallback Web: `https://apps.apple.com/app/id[FINZO_IOS_APP_ID_PLACEHOLDER]`

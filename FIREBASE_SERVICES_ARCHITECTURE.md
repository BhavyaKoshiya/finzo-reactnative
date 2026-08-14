# Finzo — Firebase Services Architecture & Data Firewall

This document outlines the architecture, data boundaries, and strict privacy firewalls governing all Firebase services integrated within **Finzo**.

---

## 1. Core Architecture & Responsibility Matrix

| Firebase Service | Scope / Role | Allowed Data | Strictly Forbidden Data |
|---|---|---|---|
| **Realtime Database (RTDB)** | Public app configuration (`/config`) | Remote version policies, feature flags, reward rules | **ALL user data**: Loan profiles, balances, EMIs, payments, notes, credentials |
| **Firebase Analytics** | Aggregated product telemetry | Non-sensitive product events (`screen_view`, `calculator_opened`, `update_clicked`) | **ALL financial data**: Amounts, balances, rates, tenures, lender names, account numbers, notes |
| **Firebase Crashlytics** | Technical crash & error diagnostics | JavaScript exception stacks, OS version, device model, build number | **ALL user state**: Redux snapshots, loan objects, payment details, private notes, passwords |
| **Firebase Cloud Messaging (FCM)** | System update & reminder notifications | Push tokens, non-financial routing keys (`screen_name`, `update_type`) | **ALL financial records**: EMI amounts, due figures, loan accounts, lender details |

---

## 2. Invariant Data Flow Diagram

```
+-------------------------------------------------------------------------+
|                              FINZO APPLICATION                          |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     LOCAL FINANCIAL STORAGE                       |  |
|  |  • Loan Profiles & Principal        • Payment Histories           |  |
|  |  • Interest Rates & EMIs            • Payoff Goals                |  |
|  |  • Private Notes                    • Keychain / Keystore Secrets |  |
|  |  • Saved Calculator Snapshots       • Local PDF Statements        |  |
|  +-------------------------------------------------------------------+  |
|                                  |                                      |
|                       STRICT PRIVACY FIREWALL                           |
|            (Parameter Sanitizer & Blocklist Validation)                 |
|                                  |                                      |
+----------------------------------+--------------------------------------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
              ▼                    ▼                    ▼
     [Firebase Analytics] [Firebase Crashlytics]  [Firebase Messaging]
     • app_open           • Error Stack Traces   • Notification Delivery
     • screen_view        • App Version (1.0.0)  • Generic Update Badges
     • calculator_opened  • OS Platform (iOS/And)• Routing Payloads
     (NO financial keys)  (NO user state)        (NO financial amounts)
```

---

## 3. Firebase Analytics Service (`firebaseAnalyticsService.js`)

### Event Whitelist
- `app_open`
- `screen_view`
- `calculator_opened`
- `calculator_completed`
- `loan_created`
- `loan_deleted`
- `payment_recorded`
- `goal_created`
- `pdf_exported`
- `rewarded_ad_started`
- `rewarded_ad_completed`
- `ad_free_activated`
- `update_prompt_shown`
- `update_clicked`

### Parameter Sanitization
`sanitizeAnalyticsParams` actively filters:
1. **Forbidden Key Blocklist**: Strips `amount`, `loanAmount`, `outstandingBalance`, `emi`, `interestRate`, `lenderName`, `accountNumber`, `notes`, `credentials`, `password`, `pin`, `rawLoan`, `reduxState`.
2. **Value Bounds**: Drops unverified large numbers (> 10,000) that could represent financial values.
3. **Primitive Clamping**: Only permits strings, booleans, and small integer counters.

---

## 4. Firebase Crashlytics Service (`firebaseCrashlyticsService.js`)

### Baseline Diagnostics
- `app_version`
- `build_number`
- `platform` (`android` / `ios`)
- `environment` (`development` / `production`)

### Protection Rules
- **No User Identification**: Finzo does NOT assign or invent user IDs for Crashlytics.
- **No Redux Snapshots**: Redux state is NEVER serialized or attached to crash reports.
- **Sanitized Context**: Error metadata passes through `sanitizeCrashlyticsAttributes`.

---

## 5. Firebase Cloud Messaging Service (`firebaseMessagingService.js`)

### FCM Token Governance
- FCM registration tokens are sensitive device identifiers.
- Tokens are **NEVER** stored in Redux financial state, loan objects, payment records, or RTDB.

### Notification Privacy
- Incoming messages are sanitized via `sanitizeNotificationData`.
- Notification text must never disclose loan balances or account numbers.

---

## 6. Startup Resilience
- Firebase service initializations are asynchronous and non-blocking.
- Failure of Analytics, Crashlytics, or Messaging will **never** impede BootSplash, Redux hydration, ConnectivityGate, or navigation.

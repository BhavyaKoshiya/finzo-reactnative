# Google Play Data Safety Console Guide — Finzo

This document contains the exact declarations and evidence required to manually complete the **Data Safety** questionnaire in Google Play Console for **Finzo** (`com.finzo.financecalculator`).

---

## 1. Executive Summary & Core Architectural Principle

Finzo is an **offline-first financial calculator and planning utility**.
* **Financial Data**: 100% stored locally on-device (`@react-native-async-storage/async-storage` and `react-native-keychain`). **Zero financial records, loan amounts, account numbers, or notes are transmitted to any backend, server, or third party.**
* **Remote Services**: Used strictly for configuration (`Firebase RTDB` - read-only), analytics (`Firebase Analytics`), crash reporting (`Firebase Crashlytics`), notifications (`Firebase Cloud Messaging`), and advertising (`Google Mobile Ads` / `react-native-marketing-plugin`).

---

## 2. High-Level Data Safety Overview Questions

| Question in Play Console | Answer | Code Verification / Rationale |
| :--- | :--- | :--- |
| **Does your app collect or share any of the required user data types?** | **Yes** | App collects technical diagnostics, device identifiers, and ad interaction data via Google/Firebase SDKs. |
| **Is all of the user data collected by your app encrypted in transit?** | **Yes** | All network communication uses HTTPS (TLS 1.2 / TLS 1.3). |
| **Do you provide a way for users to request that their data be deleted?** | **Yes** | Users can delete all local data directly in **Settings > Data & Privacy > Reset / Delete All Data**. Technical SDK data is subject to Google's automated retention policy. |

---

## 3. Detailed Data Types Declaration Table

### A. Financial Info
| Data Type | Collected? | Shared? | Processing | Purpose | Code Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User payment info (Credit/Debit Card)** | **NO** | **NO** | N/A | N/A | Finzo does not process payments or collect payment card info. |
| **Purchase history** | **NO** | **NO** | N/A | N/A | No in-app purchases. |
| **Credit score / Credit info** | **NO** | **NO** | N/A | N/A | Finzo is not a lender or credit bureau. |
| **Other financial info (Loans, Balances)** | **NO (Not collected off-device)** | **NO** | **On-device only** | App Functionality (Local Only) | Financial records are stored exclusively in SQLite / AsyncStorage on device. Actively filtered from telemetry. |

> **IMPORTANT**: Under Google Play policies, data that is stored and processed exclusively on the user's device and never transmitted off the device does **NOT** count as "Collected" for Data Safety disclosure.

---

### B. Location
| Data Type | Collected? | Shared? | Purpose | Code Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Approximate location (Coarse)** | **NO (App)** / **SDK Automatic (IP-based)** | **YES (Ad Networks)** | Advertising, Analytics | Derived from IP address by Google Mobile Ads SDK for ad serving. No GPS permission in manifest. |
| **Precise location (Fine)** | **NO** | **NO** | N/A | Manifest does NOT request `ACCESS_FINE_LOCATION`. |

---

### C. Personal Info
| Data Type | Collected? | Shared? | Purpose | Code Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Name, Email, Address, Phone Number** | **NO** | **NO** | N/A | Finzo has no user registration, login, or user profiles on a server. |
| **User IDs / Account Identifiers** | **NO** | **NO** | N/A | No user accounts. |

---

### D. App Activity
| Data Type | Collected? | Shared? | Purpose | Ephemeral? | Required / Optional | Code Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **App interactions** (Screen views, button taps, feature usage) | **YES** | **NO** | **Analytics** | No | Required | Collected by Firebase Analytics (`firebaseAnalyticsService.js`) with sanitized parameters. |
| **In-app search history** | **NO** | **NO** | N/A | N/A | N/A | No in-app search history sent to servers. |
| **Other user-generated content** | **NO** | **NO** | N/A | N/A | N/A | Notes and loan titles stay 100% on device. |

---

### E. App Info and Performance (Diagnostics)
| Data Type | Collected? | Shared? | Purpose | Ephemeral? | Required / Optional | Code Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Crash logs** | **YES** | **NO** | **Analytics, Crash Reporting** | No | Required | Collected by Firebase Crashlytics (`firebaseCrashlyticsService.js`) for app stability. |
| **Diagnostics** (App launch time, ANR, memory) | **YES** | **NO** | **Analytics** | No | Required | Standard Firebase Performance / Crashlytics collection. |
| **Other app performance data** | **YES** | **NO** | **Analytics** | No | Required | Automatic SDK performance diagnostics. |

---

### F. Device or Other Identifiers
| Data Type | Collected? | Shared? | Purpose | Ephemeral? | Required / Optional | Code Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Device or other IDs** (Advertising ID / GAID, FCM Token, App Instance ID) | **YES** | **YES (with Ad Networks)** | **Advertising, Analytics, Fraud Prevention, Cloud Messaging** | No | Required | Google Mobile Ads SDK uses Google Advertising ID (GAID) for ad serving. Firebase uses FCM Token for notifications. |

---

## 4. Summary of Data Usage & Sharing Declarations

| Data Category | Specific Data | Collected | Shared | Purpose | Security Practice |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **App Activity** | App Interactions | Yes | No | Analytics | Encrypted in transit (HTTPS) |
| **App Info & Performance** | Crash Logs, Diagnostics | Yes | No | Analytics, Developer Communications | Encrypted in transit (HTTPS) |
| **Device & Other IDs** | Advertising ID (GAID), Instance IDs | Yes | Yes (Google/AdMob) | Advertising, Analytics, Fraud Prevention | Encrypted in transit (HTTPS) |

---

## 5. Security & Privacy Guarantees

1. **Encryption in Transit**: All data transmitted to Google/Firebase endpoints uses TLS 1.2+ HTTPS.
2. **Zero Backend Financial Transmission**: Sanitizers in `firebaseAnalyticsService.js`, `firebaseCrashlyticsService.js`, and `firebaseMessagingService.js` block financial parameter names (`amount`, `balance`, `emi`, `interestRate`, `notes`, `lender`, `accountNumber`).
3. **Data Deletion Mechanism**: Users can wipe all application data locally on-device. Privacy policy provides developer contact email for privacy inquiries.

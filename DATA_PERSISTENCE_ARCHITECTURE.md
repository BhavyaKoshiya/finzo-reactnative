# Finzo — Data Persistence & Storage Architecture (Phase 19)

This document outlines the local-first storage boundaries, persistence policies, and source-of-truth invariants for the **Finzo** financial planning application.

---

## 1. Core Storage Philosophy

Finzo is an **offline-first, zero-cloud-sync financial tool**.
1. **Local-Only Financial Records**: Loans, payments, ledger snapshots, notes, payoff goals, and calculation histories live exclusively on the user's physical device.
2. **Zero Financial Data in Firebase**: Firebase Realtime Database is used strictly for public app configuration (`/config`). Zero loan or user data is ever written to or read from the cloud.
3. **Hardware-Backed Credential Security**: Sensitive credentials (PINs, portal passwords) are never stored in Redux or AsyncStorage; they reside exclusively in the platform Keystore (Android) / Keychain (iOS).

---

## 2. Redux Slice Persistence Inventory

All durable slices are managed centrally via `redux-persist` with `@react-native-async-storage/async-storage` as the storage engine under the root key `finzo_root`.

| Redux Slice | Whitelisted in Redux-Persist? | Storage Location | Sensitivity | Source of Truth |
|---|---|---|---|---|
| `loanProfilesSlice` | **Yes** | `AsyncStorage` | Moderate | Authoritative loan terms, status, balance anchor |
| `loanPaymentsSlice` | **Yes** | `AsyncStorage` | Moderate | Authoritative historical payment log & snapshots |
| `loanPrivateDetailsSlice` | **Yes** | `AsyncStorage` | Moderate | Authoritative metadata (lender, branch, masked account) |
| `loanNotesSlice` | **Yes** | `AsyncStorage` | Moderate | Authoritative user notes & categories |
| `loanGoalsSlice` | **Yes** | `AsyncStorage` | Low | Authoritative payoff goals & targets |
| `settingsSlice` | **Yes** | `AsyncStorage` | None | Authoritative user preferences (theme, currency, locale) |
| `rewardsSlice` | **Yes** | `AsyncStorage` | Low | Authoritative reward points, streak, absolute `adFreeUntil` timestamp |
| `savedCalculationsSlice` | **Yes** | `AsyncStorage` | None | Authoritative saved calculation snapshots (max 100) |
| `connectivitySlice` | **No** (Blacklisted) | In-Memory | None | Derived dynamically from `@react-native-community/netinfo` |

---

## 3. Authoritative vs Derived Values

| Financial Metric | Classification | Description & Rules |
|---|---|---|
| **Original Principal** | **Authoritative** | Stored in `loanProfiles.profiles[i].originalPrincipal`. Never mutated by payments. |
| **Current Outstanding Principal** | **Derived / Anchored** | Calculated chronologically from the latest `bank_confirmed` anchor plus subsequent recorded payments. |
| **Payment Snapshots** | **Authoritative (Immutable)** | Captured at the exact moment of payment (`principalPortion`, `interestPortion`, `remainingPrincipal`, `interestRate`). Never mutated if profile interest rate changes later. |
| **Ad-Free Entitlement** | **Authoritative** | Stored as an absolute ISO string (`rewards.adFreeUntil`). Remaining duration is calculated dynamically at runtime (`adFreeUntil > now`). |
| **Payment Reminders** | **Derived (OS-level)** | Calculated dynamically from loan due day and active status; scheduled as native trigger alarms via `@notifee/react-native`. |

---

## 4. Multi-Loan Isolation & Foreign Keys

To prevent cross-loan contamination:
1. **Explicit `loanId` Foreign Key**: Every payment, note, goal, and private details record carries an explicit `loanId` string.
2. **No Index-Based Relationships**: Collections are never queried or mutated by array index across screens.
3. **Cascading Deletion Protocol**: When a loan profile is deleted, actions are dispatched sequentially:
   ```js
   await loanReminderService.cancelLoanReminders(loanId);
   dispatch(deletePaymentsForLoan(loanId));
   dispatch(deleteNotesForLoan(loanId));
   dispatch(deleteGoalsForLoan(loanId));
   dispatch(deleteLoanPrivateDetails(loanId));
   await securePrivateStorageService.deleteSecureValue(`finzo.loan.${loanId}.sensitive.credential`);
   dispatch(deleteLoanProfile(loanId));
   ```

---

## 5. Storage Summary & File References

- **Redux Persist Root**: [`src/store/index.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/store/index.js)
- **Migrations & Normalization**: [`src/store/migrations/index.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/store/migrations/index.js)
- **Secure Storage Service**: [`src/services/securePrivateStorageService.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/services/securePrivateStorageService.js)
- **Reminder Service**: [`src/features/loans/services/loanReminderService.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/features/loans/services/loanReminderService.js)

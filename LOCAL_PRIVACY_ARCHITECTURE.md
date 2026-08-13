# LOCAL_PRIVACY_ARCHITECTURE.md — Finzo Local Privacy & Secure Data Architecture

## 1. Overview
Finzo Phase 16.13 introduces the **Private Loan Details, Notes & Secure Local Data Architecture** (`src/services/securePrivateStorageService.js`, `src/features/loans/types/loanPrivateDetailsTypes.js`, `src/features/loans/types/loanNoteTypes.js`, `src/store/slices/loanPrivateDetailsSlice.js`, `src/store/slices/loanNotesSlice.js`, and `src/features/privacy/screens/LocalDataPrivacyScreen.jsx`).

It establishes a local private metadata and notes layer for real-world loan tracking while enforcing strict data classification between normal private data and highly sensitive credentials.

---

## 2. Core Privacy Positioning & Boundaries

```text
  ┌───────────────────────────────────────────────────────────────┐
  │                    LOCAL USER DATA LAYER                      │
  │   Loan Profiles • Balances • Payment Ledgers • Notes • Goals  │
  │                     100% Stays on Device                      │
  └───────────────────────────────┬───────────────────────────────┘
                                  │ (No Cloud Uploads)
                                  ▼
  ┌───────────────────────────────────────────────────────────────┐
  │              NORMAL PRIVATE LOAN DATA & NOTES                 │
  │        Redux Toolkit + redux-persist + AsyncStorage           │
  └───────────────────────────────┬───────────────────────────────┘
                                  │
  ┌───────────────────────────────┴───────────────────────────────┐
  │                 HIGHLY SENSITIVE CREDENTIALS                  │
  │      react-native-keychain (Android Keystore / iOS Keychain)  │
  │      NEVER stored in Redux, AsyncStorage, or Firebase!        │
  └───────────────────────────────────────────────────────────────┘
```

### Laws of Local Privacy:
1. **"Your loan information stays on this device."**: All loan profiles, balances, payment records, notes, lender contacts, insurance, and personal payoff goals are stored locally.
2. **"Finzo does not upload your loan balances, payment history, notes or private loan details to Firebase."**: Zero user financial data is sent to cloud servers.
3. **Explicit Export Boundary**: Information leaves the device only when the user explicitly chooses to export or share a PDF report.
4. **Transparent Firebase Scope**: Firebase Realtime Database is used strictly for public application configuration (`/config`), remote pricing, store rules, and release flags.

---

## 3. Data Classification Matrix

| Category | Examples | Storage Driver | Persistent Layer |
| :--- | :--- | :--- | :--- |
| **Normal Private Data** | Lender name, branch address, contact phone, loan officer, insurance policy #, collateral, account ref # | Redux Toolkit + `redux-persist` | `@react-native-async-storage/async-storage` |
| **Loan Notes** | Category-tagged notes, sanction letter references, bank reminders | Redux Toolkit + `redux-persist` | `@react-native-async-storage/async-storage` |
| **Highly Sensitive Credentials** | Secret keys, passcode references, protected credentials | `securePrivateStorageService` | `react-native-keychain` (Keystore / Keychain) |

> [!CAUTION]
> **Strict Non-Storage Rule**: Highly sensitive credentials MUST **NEVER** enter Redux, AsyncStorage, `redux-persist`, Firebase, logs, PDFs, notifications, or share sheets!

---

## 4. Platform Secure Storage Service (`securePrivateStorageService.js`)

- Encapsulates `react-native-keychain` API.
- Deterministic, loan-scoped key format: `finzo.loan.{loanId}.sensitive.{fieldName}`.
- Failure Policy: If platform secure storage fails or is unavailable, throws an explicit error (`"Sensitive information couldn't be securely stored on this device."`) with a Retry option. **NEVER** falls back to plain AsyncStorage or Redux!

---

## 5. UI Presentation & Security Safeguards

- **Banking Security Notice**: Displays explicit warning banner: *"For your security, avoid storing banking passwords, PINs, OTPs or card security codes in Finzo."*
- **Account Reference Masking**: Loan account and reference numbers are masked by default (`XXXX1234`) on display views using `maskAccountReference()`. Full value revealed only after explicit tap.
- **PDF Export Restrictions**: Normal PDFs exclude private details by default. Optional export masks account numbers and requires user confirmation. Credentials are **NEVER** included in PDFs under any circumstances.
- **Notification Safeguards**: Local notifications MUST NEVER contain credentials, account numbers, private notes, or private contacts.

---

## 6. Cascade Data Deletion Behavior

- **Clear Private Details**: Removes private metadata, notes, and secure keychain values for a loan without deleting the financial loan balance or payment history.
- **Full Loan Delete**: Cascade deletes loan profile, payment history, goals, notes, private details, and secure keychain values for that specific loan. Other loans remain 100% untouched.
- **Archive & Paid-Off Loans**: Archiving or paying off a loan retains private details and notes intact for audit history.

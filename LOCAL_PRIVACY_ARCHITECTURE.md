# Finzo — Local Privacy & Data Firewall Architecture

This document documents Finzo's offline-first privacy model and financial data firewall boundaries.

---

## 1. Zero Backend / Offline-First Principles

Finzo operates entirely on the user's device.
- **No User Accounts**: No registration, login, or personal profile tracking.
- **No Remote Database**: User financial data (loan profiles, balances, EMIs, payments, notes, credentials) is saved strictly in local device storage via `@react-native-async-storage/async-storage` and Secure Store.

---

## 2. Financial Data Firewall Boundary

The advertising layer and external services are strictly isolated from application financial data:

```
[ Financial Core & Loan Ledger ]
  • Loan amounts, EMIs, rates
  • Recorded payments & notes
  • Confidential credentials
           │
           │  FIREWALL BOUNDARY (Zero Financial Data Crosses)
           ▼
[ Advertising Layer ]
  • placementId: string
  • adType: string
  • generic UI configuration
```

### Mandatory Rules
1. `AdProvider` inputs accept ONLY `placementId`, `adType`, and generic options.
2. Firebase Realtime Database is used strictly for public application configuration (`/config`). Zero user data is uploaded to Firebase.
3. Protected financial workflow screens (`AddPaymentScreen`, balance correction, notes, credentials, PDF export) are **100% ad-free**.

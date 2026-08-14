# Finzo — Secure Storage & Credential Architecture (Phase 19)

This document specifies the hardware-backed secure storage boundaries, Keychain/Keystore integration, and credential isolation policies for **Finzo**.

---

## 1. Security Invariant & Credential Boundary

> **STRICT SECURITY RULE**: Sensitive user credentials (loan portal passwords, netbanking access PINs, secret identifiers) **MUST NEVER** be stored in Redux, AsyncStorage, application logs, crash reports, notifications, PDF exports, or cloud databases.

```
┌────────────────────────────────────────────────────────┐
│ USER INTERFACE (LoanPrivateDetailsScreen)              │
└───────────┬────────────────────────────────┬───────────┘
            │ Metadata                       │ Sensitive Secret
            │ (Lender, Branch, Masked No)    │ (PIN, Password)
            ↓                                ↓
┌───────────────────────────┐    ┌───────────────────────────────────┐
│ Redux Store / AsyncStorage│    │ securePrivateStorageService       │
│ hasSecureCredential: true │    │ (Platform Keystore / iOS Keychain)│
└───────────────────────────┘    └───────────────────────────────────┘
```

---

## 2. Platform Storage Implementation

- **iOS**: Apple Keychain Services with `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- **Android**: Android Keystore Provider with hardware-backed RSA/AES encryption.
- **Library**: `react-native-keychain`.
- **Service**: [`src/services/securePrivateStorageService.js`](file:///Users/bhavyakoshiya/Documents/ReactNative/Finzo/src/services/securePrivateStorageService.js).

---

## 3. Storage Key Hierarchy

Each loan credential uses a deterministic, isolated key:
```
finzo.loan.${loanId}.sensitive.credential
```

---

## 4. Hardware Failure & Fallback Policy

If the device Keystore or Keychain throws an error (e.g. biometric lockout, hardware corruption, secure enclave error):
1. **Throw Typed Error**: The service throws an error to the calling UI.
2. **ZERO Plaintext Fallback**: The service will **NEVER** fall back to saving plaintext secrets in AsyncStorage or Redux.
3. **User Action**: The UI displays a security error dialog allowing the user to retry or cancel.

---

## 5. Deletion & Cleanup Protocol

When a loan is deleted by the user:
```js
await securePrivateStorageService.deleteSecureValue(`finzo.loan.${loanId}.sensitive.credential`);
```
This ensures no orphaned credentials remain in the device hardware enclave after loan deletion.

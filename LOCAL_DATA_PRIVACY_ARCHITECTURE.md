# Finzo — Local Data Privacy Architecture (Phase 21)

This document specifies Finzo's local-first privacy boundaries, credential isolation, and advertising infrastructure data policies.

---

## 1. Local-First Financial Record Model

- **100% Offline Financial Data**: All loans, payment histories, balance corrections, repayment goals, private notes, and calculation snapshots are stored exclusively in local device storage (`AsyncStorage` + platform Keystore/Keychain).
- **Zero Financial Cloud Uploads**: Finzo maintains no backend database for user financial information. Firebase Realtime Database is utilized strictly for public, read-only application configuration at `/config`.

---

## 2. Advertising Privacy Policy & Data Distinction

Finzo clearly distinguishes between **Financial User Records** and **Advertising Network Telemetry**:

| Data Domain | Storage / Processing Location | Cloud Transmission Policy |
|---|---|---|
| **Loan & Ledger Records** | Device Local Storage | **0% Transmission**. Never uploaded to Finzo or Firebase. |
| **Banking Credentials & PINs** | iOS Keychain / Android Keystore | **0% Transmission**. Never uploaded or shared. |
| **Ad Delivery Telemetry** | Google Mobile Ads SDK | Handled by Google Mobile Ads according to Google privacy policy. |

> **Privacy Transparency Note**: While Finzo never sends financial records to the ad layer, standard advertising network identifiers (device model, approximate IP, ad request signals) may be processed by Google Mobile Ads for ad serving and fraud detection in compliance with standard mobile platform privacy terms.

---

## 3. Financial Firewall Guarantees

- `MarketingAdProvider` receives strictly generic metadata (`placementId`, `adType`, `screen`).
- No financial variables (principal, EMI, balance, interest rate, notes, account numbers) are ever passed across the advertising interface.
- 15 core financial workflows remain completely ad-free and cannot be overridden by remote configuration.

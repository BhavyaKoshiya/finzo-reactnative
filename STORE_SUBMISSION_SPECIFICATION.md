# Finzo — Store Submission & Launch Readiness Specification (Phase 26)

This document provides the definitive, production-audited submission specifications, store listings, and Data Safety declarations for **Finzo** across Google Play Console and Apple App Store Connect.

---

## 1. Release Identity & Packaging

| Platform | Attribute | Production Value |
|---|---|---|
| **Android** | Package / Application ID | `com.finzo.financecalculator` |
| **Android** | Version Name | `1.0.0` |
| **Android** | Version Code | `1` |
| **Android** | Min SDK / Target SDK | `24` / `34` |
| **Android** | Build Artifact | Android App Bundle (`bundleRelease`) |
| **iOS** | Bundle Identifier | `com.finzo.financecalculator` |
| **iOS** | Marketing Version | `1.0.0` |
| **iOS** | Current Project Version (Build) | `1` |
| **iOS** | Deployment Target | iOS `15.1+` |
| **Shared** | Primary Market / Locale | India (`en-IN`) |
| **Shared** | Primary Currency | INR (`₹`) |

---

## 2. Google Play Store Listing Metadata

- **App Name**: Finzo — Loan EMI & Financial Calculator
- **Short Description** *(Max 80 chars)*: Track loans, plan prepayments, calculate EMIs & manage finances locally.
- **Full Description**:
```text
Finzo is an offline-first financial calculator and personal loan planning utility designed to give you clarity and control over your borrowings and investments.

KEY FEATURES:

📊 REAL LOAN TRACKING & BALANCE MANAGEMENT
• Track multiple loans (Home, Personal, Car, Education, Business) in one organized dashboard.
• Know your exact outstanding principal vs. total borrowed at a glance.
• Record regular EMI payments, part-prepayments, and full payoffs with automatic balance recalculation.
• Maintain a structured payment history ledger with date, principal, and interest breakdowns.

🎯 PAYOFF PLANNER & GOAL ACCELERATOR
• Set target payoff dates and simulate how prepayments save months of interest.
• Discover interest savings and calculate exact payoff acceleration timelines.

🔒 LOCAL PRIVACY & HARDWARE SECURITY
• 100% on-device financial storage. Your loan amounts, balances, EMIs, and notes are never sent to external servers or cloud accounts.
• Encrypt sensitive loan portal reference pins using hardware-backed device security.
• Generate clean PDF loan statements and calculation summaries directly on your device.

🧮 10+ POWERFUL FINANCIAL CALCULATORS
• Loan EMI: Home, Personal, Car, Education, Business
• Investment: SIP, FD, RD, CAGR, ROI
• Everyday & Business: GST, Simple Interest, Compound Interest, Percentage

AD-SUPPORTED WITH REWARDED AD-FREE MODE:
Finzo is supported by advertising to keep all tools free. Earn 30 minutes of ad-free application usage by completing rewarded ads. All core financial management workflows (recording payments, editing loans, viewing notes) remain strictly ad-free.

DISCLAIMER:
Finzo is a calculation and planning utility. Finzo does not offer loans, approve credit, process banking transactions, or provide financial advice.
```

- **Category**: Finance
- **Content Rating**: Everyone / PEGI 3 / 3+
- **Developer / Organization**: BinaryKode Technologies
- **Contact Email**: `bhavyakoshiya.work@gmail.com`
- **Privacy Policy URL**: `https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html`

---

## 3. Google Play Data Safety Declaration

Based on the actual audited codebase implementation:

| Category | Data Type | Collected? | Shared? | Purpose | Ephemeral? |
|---|---|---|---|---|---|
| **Financial Info** | User financial info, loan balances, bank details, credit numbers | **NO (0%)** | **NO (0%)** | Kept on device only | N/A |
| **Personal Info** | Name, email, address, phone | **NO** | **NO** | Not collected | N/A |
| **Identifiers** | Device or advertising IDs (GAID/IDFA) | **YES** | **YES** | Advertising & Analytics (Google Mobile Ads / Firebase Analytics) | No |
| **App Activity** | App interactions, screen views | **YES** | **NO** | Analytics (Firebase Analytics) | No |
| **App Info & Performance** | Crash logs, diagnostics | **YES** | **NO** | App functionality & diagnostics (Firebase Crashlytics) | No |

---

## 4. Apple App Store Connect App Privacy Nutrition Label

| Data Category | Data Type | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| **Financial Info** | Payment/credit/loan data | **NOT COLLECTED** | No | 100% on-device local storage |
| **Identifiers** | Device ID / Advertising Identifier | No (Not linked) | Yes (Third-party advertising) | Third-Party Advertising (Google Mobile Ads) |
| **Usage Data** | Product Interaction | No (Not linked) | No | Analytics (Firebase Analytics) |
| **Diagnostics** | Crash Data, Performance Data | No (Not linked) | No | App Functionality (Firebase Crashlytics) |

---

## 5. Store Screenshots & Copy Flow (7 Core Assets)

| # | Screen Subject | Headline Text | Sub-Text |
|---|---|---|---|
| **1** | Loan Dashboard | **Track All Your Loans in One Place** | Monitor balances, interest rates, and next EMI dates at a glance. |
| **2** | Loan Details | **See Exactly What You Still Owe** | Clear visual separation between borrowed amount and outstanding principal. |
| **3** | Payment Ledger | **Record Payments & Prepayments** | Automatic balance adjustment and payment history ledger. |
| **4** | Payoff Planner | **Save Interest & Finish Loans Faster** | Simulate extra payments and calculate exact months saved. |
| **5** | Calculators | **10+ Financial & EMI Calculators** | Home Loan, SIP, FD, RD, GST, and Compound Interest calculations. |
| **6** | Local Privacy | **Private by Design — 100% Local Storage** | Your financial records stay on your device. Zero cloud synchronization. |
| **7** | Rewards / Ad-Free | **Earn Ad-Free Time with Rewards** | Enjoy uninterrupted calculations with optional rewarded sessions. |

---

## 6. External Actions Required Prior to Store Release

The application binary and source code are feature-complete and release-hardened. The following administrative actions must be completed by the publisher:

1. **Organization Details & Privacy Policy**: **COMPLETED** (Configured as `BinaryKode Technologies`, `bhavyakoshiya.work@gmail.com`, and hosted at `https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html`).
2. **Apple App Store ID**: Once the App Store Connect record is created, obtain the numeric Apple App ID (e.g. `6740000000`) and replace `FINZO_IOS_APP_ID_PLACEHOLDER` in `src/services/appStoreService.js`.
3. **Google Play Release Signing**: Sign the generated Android App Bundle (`bundleRelease`) using the organization's production upload keystore.
4. **Apple Distribution Certificate & Provisioning Profile**: Archive and sign the iOS application in Xcode using the organization's Apple Developer Team.

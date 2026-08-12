# LOAN REMINDER & DUE TRACKING ARCHITECTURE (PHASE 16.6 & 16.6.1)

This document specifies the architectural model, rules, and privacy boundaries for Finzo's **Loan Payment Reminders & Payment Due Tracking** system using `@notifee/react-native`.

---

## 1. CORE PRINCIPLE: REMINDERS ARE NOT PAYMENTS

- **Strict Non-Mutation Rule**: A reminder or notification is strictly an informational alert. Triggering or viewing a reminder does **NEVER** record a payment, reduce outstanding principal, increment `paymentCount`, or modify `ledgerVersion`.
- **Explicit Recording Transition**: To satisfy a due EMI, the user must explicitly record the transaction through the existing Phase 16.4 payment recording flow (`AddPaymentScreen`).

---

## 2. DUE DATES & SAFE MONTH-LENGTH CALCULATIONS

- **`dueDay` (1..31)**: Per-loan configured day of month. Defaults to `5`.
- **Safe Due-Day Calculation (`calculateNextDueDate`)**:
  - Handles shorter calendar months (e.g., due day 31 in February maps safely to Feb 28 in standard years or Feb 29 in leap years; April 31 maps to April 30) without throwing exceptions or crashing.
- **`nextPaymentDate`**: Authoritative next payment due date (`YYYY-MM-DD`).

---

## 3. DETERMINISTIC PAYMENT-PERIOD MATCHING

- **Period Identifier (`getPaymentPeriodKey`)**: Uses deterministic format `${loanId}_${YYYY-MM}` (e.g. `loan123_2026-09`).
- **Satisfaction Criteria (`isPaymentPeriodSatisfied`)**:
  - Evaluates matching payment records for `${YYYY-MM}` period.
  - Requires `paymentType === 'regular_emi'` (or `'full_payment'` settlement).
  - Standalone prepayments (`paymentType === 'prepayment'`) and unassigned custom payments **do NOT** satisfy the scheduled monthly EMI unless recorded as regular EMI for that period.

---

## 4. REAL DEVICE LOCAL NOTIFICATIONS (@NOTIFEE/REACT-NATIVE)

- **Adapter Abstraction (`notifeeNotificationAdapter.js`)**: Encapsulates `@notifee/react-native` APIs. React components never call Notifee directly.
- **Android Notification Channel**:
  - `ID`: `loan-payment-reminders`
  - `Name`: `Loan Payment Reminders`
  - `Importance`: `Importance.DEFAULT`
- **User-Initiated Permission Flow**: OS notification permissions are requested **ONLY** when the user turns Loan Payment Reminders `ON`. Permissions are never prompted on app launch or onboarding.
- **Permission Failure UI**: If permission is denied, the toggle stays `OFF` and presents an explicit "Notifications are Disabled" banner with an "Open Device Settings" button.

---

## 5. LOCAL REMINDER SERVICE & DETERMINISTIC IDEMPOTENCY

- **Service (`loanReminderService.js`)**:
  - Manages local scheduling, cancellation, and reconciliation.
- **Deterministic Notification IDs (`getNotificationId`)**:
  - `${loanId}_${periodKey}_${reminderType}` (e.g. `loan123_2026-09_3d`).
  - Idempotent: Attempting to schedule an already registered notification ID skips duplicate creation.
- **Past Date Guard**: If `reminderDate <= Date.now()`, the service skips scheduling for past dates without throwing or firing instant alarms.

---

## 6. RECONCILIATION & APP LIFECYCLE (STARTUP & RESUME)

- **Startup & Foreground Reconciliation**:
  - Runs asynchronously on app launch and `AppState` foreground resume (`active`).
  - Reads active OS trigger IDs from Notifee via `getTriggerNotificationIds()`.
  - Cancels obsolete triggers for deleted, archived, or paid-off loans, or periods satisfied by recorded regular EMIs.
  - Schedules trigger notifications for upcoming unpaid due dates.

---

## 7. NOTIFICATION TAP & DEEP LINKING

- **Payload Structure**: `{ type: 'loan_payment_reminder', loanId, periodKey }`. Excludes sensitive financial figures or lender credentials.
- **Navigation Action**: Tapping a notification invokes `navigate(ROUTES.LOAN_DETAILS, { loanId })` using `navigationRef`.
- **Deep-Link Fallback**: If the loan profile was deleted before the tap, falls back safely to `ROUTES.MY_LOANS` without crashing.

---

## 8. LOCAL PRIVACY & ZERO CLOUD PERSISTENCE

- **100% Offline**: All due dates, reminder preferences, notification schedules, and payment histories reside strictly in local device storage.
- **Zero Firebase Exposure**: No loan reminder preferences or financial payloads are written to Cloud messaging or Firebase RTDB. RTDB remains strictly read-only for public application config.

# LOAN_PROFILE_EDITING_ARCHITECTURE.md — Finzo Loan Profile Editing & Data Integrity Architecture

## 1. Overview
Finzo Phase 16.10 provides a secure, predictable, and audit-safe loan profile editing system (`src/features/loans/services/loanProfileUpdateService.js` & `src/features/loans/utils/loanProfileChangeUtils.js`).

It separates **Profile Metadata** from **Ledger Replay Data** and **Historical Snapshots**, ensuring that updating a loan's name, interest rate, EMI, tenure, due day, or reminder preferences updates future projections without silently rewriting past payment records.

---

## 2. Field Classification Matrix

| Field | Category | Direct Edit Allowed | Ledger Impact | Confirmation Required |
| :--- | :--- | :--- | :--- | :--- |
| `name` | Cosmetic | Yes | None (preserves `ledgerVersion`) | No |
| `lenderName` | Cosmetic | Yes | None (preserves `ledgerVersion`) | No |
| `notes` | Cosmetic | Yes | None (preserves `ledgerVersion`) | No |
| `processingFee` | Cosmetic | Yes | None (preserves `ledgerVersion`) | No |
| `isPrimary` | Cosmetic | Yes | None (preserves `ledgerVersion`) | No |
| `annualInterestRate` | Material | Yes | Increments `ledgerVersion` by +1 | Yes (if payments exist) |
| `emiAmount` | Material | Yes | Increments `ledgerVersion` by +1 | Yes (if payments exist) |
| `originalTenure` | Material | Yes | Increments `ledgerVersion` by +1 | Yes (if payments exist) |
| `loanStartDate` | Material | Yes | Increments `ledgerVersion` by +1 | Yes (if payments exist) |
| `dueDay` | Reminder | Yes | Reconciles Notifee reminders | No |
| `remindersEnabled` | Reminder | Yes | Reconciles Notifee reminders | No |
| `reminderDaysBefore` | Reminder | Yes | Reconciles Notifee reminders | No |
| `reminderTime` | Reminder | Yes | Reconciles Notifee reminders | No |
| `originalPrincipal` | Material / Protected | Warning shown if payments exist | Increments `ledgerVersion` by +1 | Yes |
| `currentOutstandingPrincipal` | **Ledger Protected** | **NO** (Read-Only in Form) | Must use **Balance Correction** | N/A |

---

## 3. Data Integrity & Historical Immutability Laws

1. **Historical Snapshot Preservation**: Editing `annualInterestRate` or `emiAmount` on a loan profile **NEVER** mutates `payment.calculationSnapshot` objects stored on historical payment records.
2. **Current Balance Protection**: `currentOutstandingPrincipal` and `userConfirmedBalance` are strictly read-only in `LoanProfileForm`. Current balance adjustments MUST be made via `ManualBalanceUpdateModal` ("Correct Current Balance").
3. **Ledger Versioning (`ledgerVersion`)**:
   - Incremented by `+1` ONLY when material financial terms (`annualInterestRate`, `emiAmount`, `originalTenure`, `loanStartDate`, `originalPrincipal`) change.
   - Preserved unchanged for cosmetic edits (name, lender, notes) and reminder preference updates.
4. **Multiple Loan Isolation**: Editing Loan A leaves Loan B 100% byte-for-byte unchanged.

---

## 4. Change Classification & Service Architecture

```text
Form Submission (LoanProfileForm)
        ↓
loanProfileChangeUtils.getLoanProfileChanges()
        ↓
loanProfileChangeUtils.classifyLoanProfileChanges()
        ↓
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ Material Changes & Payments Exist     │ Cosmetic / Reminder Edits Only        │
│        ↓                              │        ↓                              │
│ ReviewChangesModal.jsx                │ updateLoanProfileService()            │
│ (User Confirms Diffs)                 │ (Atomic Redux Dispatch & Notifee)     │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 5. Reminder Reconciliation & Notification Safety
- Editing `dueDay`, `remindersEnabled`, `reminderDaysBefore`, `reminderTime`, `loanStartDate`, or loan status automatically triggers `loanReminderService.reconcileLoanReminders()`.
- Deleting a loan calls `loanReminderService.cancelLoanReminders(loanId)` to clean up all scheduled Notifee notifications.
- Archiving a loan pauses its reminders; restoring an archived loan reschedules notifications.

---

## 6. Privacy & Offline Guarantees
- **100% Local & Offline**: All profile edits, change analysis, and reminder reconciliations run locally on device.
- **Zero Firebase Sync**: No loan profile fields, interest rates, or balances are uploaded to Firebase or third-party servers.

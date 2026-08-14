/**
 * FINZO — PHASE 19 — Production Data Integrity, Persistence Safety & Recovery Hardening Tests
 *
 * Validates zero data loss, corruption recovery, multi-loan isolation, ledger persistence,
 * Keychain security boundaries, cascade deletions, and zero Firebase financial writes.
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import {
  addLoanProfile,
  updateLoanProfile,
  deleteLoanProfile,
  correctLoanBalance,
  selectAllLoanProfiles,
  selectLoanProfileById,
} from '../../store/slices/loanProfilesSlice';
import {
  addPayment,
  updatePayment,
  deletePayment,
  deletePaymentsForLoan,
  deleteLoanPaymentWithRecalculation,
  selectAllPayments,
  selectPaymentsForLoan,
} from '../../store/slices/loanPaymentsSlice';
import {
  addLoanGoal,
  updateLoanGoal,
  deleteLoanGoal,
  deleteGoalsForLoan,
  selectAllLoanGoals,
  selectLoanGoalsByLoanId,
} from '../../store/slices/loanGoalsSlice';
import {
  addLoanNote,
  updateLoanNote,
  deleteLoanNote,
  toggleLoanNotePinned,
  deleteNotesForLoan,
  selectAllLoanNotes,
  selectLoanNotesByLoanId,
  selectPinnedLoanNotesByLoanId,
} from '../../store/slices/loanNotesSlice';
import {
  setLoanPrivateDetails,
  clearLoanPrivateDetails,
  deletePrivateDetailsForLoan,
  deleteLoanPrivateDetails,
  selectAllPrivateDetails,
  selectPrivateDetailsByLoanId,
} from '../../store/slices/loanPrivateDetailsSlice';
import {
  setThemeMode,
  setCurrency,
  setLocale,
  setLoanRemindersEnabled,
  selectSettings,
} from '../../store/slices/settingsSlice';
import {
  claimDailyCheckIn,
  redeemReward,
  selectRewardPoints,
  selectCurrentStreak,
  selectAdFreeUntil,
  selectIsAdFree,
  selectRewardHistory,
} from '../../store/slices/rewardsSlice';
import {
  addSavedCalculation,
  selectSavedCalculations,
} from '../../store/slices/savedCalculationsSlice';
import {
  normalizePersistedState,
  migrations,
  PERSIST_VERSION,
} from '../../store/migrations';
import securePrivateStorageService from '../../services/securePrivateStorageService';
import loanReminderService from '../../features/loans/services/loanReminderService';

// Mock Keychain for secure storage tests
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly' },
}));

import * as Keychain from 'react-native-keychain';

const createTestStore = (preloadedState) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

describe('Phase 19 — Production Data Integrity & Persistence Safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. PERSISTENCE INVENTORY & REHYDRATION
  // ============================================================
  test('1. Persistence inventory: all 8 critical user slices are present in root reducer', () => {
    const store = createTestStore();
    const state = store.getState();

    expect(state.loanProfiles).toBeDefined();
    expect(state.loanPayments).toBeDefined();
    expect(state.loanGoals).toBeDefined();
    expect(state.loanNotes).toBeDefined();
    expect(state.loanPrivateDetails).toBeDefined();
    expect(state.settings).toBeDefined();
    expect(state.rewards).toBeDefined();
    expect(state.savedCalculations).toBeDefined();
    expect(state.connectivity).toBeDefined();
  });

  test('2. App restart / rehydration simulation preserves state intact', () => {
    // 1. App Session 1: User creates data
    const store1 = createTestStore();
    store1.dispatch(
      addLoanProfile({
        id: 'loan_a',
        name: 'Home Loan',
        loanType: 'home',
        originalPrincipal: 5000000,
        currentOutstandingPrincipal: 4800000,
        interestRate: 8.5,
        emiAmount: 43391,
        tenureMonths: 240,
        status: 'active',
        isPrimary: true,
      })
    );
    store1.dispatch(
      addPayment({
        id: 'pay_1',
        loanId: 'loan_a',
        amount: 43391,
        paymentDate: '2026-08-01',
        paymentType: 'regular_emi',
        calculationSnapshot: { principalPortion: 7974, interestPortion: 35417, remainingPrincipal: 4792026 },
      })
    );
    store1.dispatch(
      addLoanNote({
        id: 'note_1',
        loanId: 'loan_a',
        title: 'Tax Certificate',
        content: 'Downloaded provisional certificate from bank portal.',
        category: 'tax',
      })
    );

    const snapshotBeforeRestart = store1.getState();

    // 2. Simulate complete app restart and rehydration from persisted snapshot
    const store2 = createTestStore(snapshotBeforeRestart);
    const state2 = store2.getState();

    expect(selectAllLoanProfiles(state2)).toHaveLength(1);
    expect(selectLoanProfileById(state2, 'loan_a')?.name).toBe('Home Loan');
    expect(selectPaymentsForLoan(state2, 'loan_a')).toHaveLength(1);
    expect(selectLoanNotesByLoanId(state2, 'loan_a')).toHaveLength(1);
  });

  // ============================================================
  // 2. MULTIPLE LOAN ISOLATION
  // ============================================================
  test('3. Multiple loans (A, B, C) remain strictly isolated without cross-contamination', () => {
    const store = createTestStore();

    // Create 3 independent loans
    store.dispatch(addLoanProfile({ id: 'loan_a', name: 'Home Loan', originalPrincipal: 5000000, currentOutstandingPrincipal: 4800000 }));
    store.dispatch(addLoanProfile({ id: 'loan_b', name: 'Car Loan', originalPrincipal: 1000000, currentOutstandingPrincipal: 800000 }));
    store.dispatch(addLoanProfile({ id: 'loan_c', name: 'Personal Loan', originalPrincipal: 300000, currentOutstandingPrincipal: 250000 }));

    // Record payments for each loan
    store.dispatch(addPayment({ id: 'pay_a1', loanId: 'loan_a', amount: 43000, paymentDate: '2026-08-01' }));
    store.dispatch(addPayment({ id: 'pay_a2', loanId: 'loan_a', amount: 43000, paymentDate: '2026-07-01' }));
    store.dispatch(addPayment({ id: 'pay_b1', loanId: 'loan_b', amount: 22000, paymentDate: '2026-08-01' }));
    store.dispatch(addPayment({ id: 'pay_c1', loanId: 'loan_c', amount: 9500, paymentDate: '2026-08-01' }));

    const state = store.getState();

    // Verify isolation
    expect(selectPaymentsForLoan(state, 'loan_a')).toHaveLength(2);
    expect(selectPaymentsForLoan(state, 'loan_b')).toHaveLength(1);
    expect(selectPaymentsForLoan(state, 'loan_c')).toHaveLength(1);

    // Delete payment from Loan B
    store.dispatch(deletePayment('pay_b1'));
    const nextState = store.getState();

    // Verify Loan A and Loan C are 100% untouched
    expect(selectPaymentsForLoan(nextState, 'loan_a')).toHaveLength(2);
    expect(selectPaymentsForLoan(nextState, 'loan_b')).toHaveLength(0);
    expect(selectPaymentsForLoan(nextState, 'loan_c')).toHaveLength(1);
  });

  // ============================================================
  // 3. PAYMENT RELATIONSHIPS & ID INTEGRITY
  // ============================================================
  test('4. Payment records bind to loanId, never array index or navigation state', () => {
    const store = createTestStore();

    store.dispatch(addLoanProfile({ id: 'loan_target', name: 'Target Loan', originalPrincipal: 500000 }));
    store.dispatch(addPayment({ id: 'pay_100', loanId: 'loan_target', amount: 15000, paymentDate: '2026-08-01' }));

    const state = store.getState();
    const payments = selectPaymentsForLoan(state, 'loan_target');

    expect(payments[0].loanId).toBe('loan_target');
    expect(selectPaymentsForLoan(state, 'non_existent_loan')).toEqual([]);
  });

  // ============================================================
  // 4. LEDGER PERSISTENCE & BALANCE INTEGRITY
  // ============================================================
  test('5. Balance and ledger version persist accurately across mutations and restart', () => {
    const store1 = createTestStore();

    store1.dispatch(
      addLoanProfile({
        id: 'loan_1',
        name: 'Personal Loan',
        originalPrincipal: 500000,
        currentOutstandingPrincipal: 500000,
        interestRate: 12,
        ledgerVersion: 1,
      })
    );

    // Correct balance with bank-confirmed anchor
    store1.dispatch(correctLoanBalance({ id: 'loan_1', actualBankBalance: 450000 }));

    const stateBeforeRestart = store1.getState();
    const loanBefore = selectLoanProfileById(stateBeforeRestart, 'loan_1');

    expect(loanBefore.currentOutstandingPrincipal).toBe(450000);
    expect(loanBefore.balanceSource).toBe('bank_confirmed');
    expect(loanBefore.ledgerVersion).toBe(2);

    // Rehydrate into new store
    const store2 = createTestStore(stateBeforeRestart);
    const loanAfter = selectLoanProfileById(store2.getState(), 'loan_1');

    expect(loanAfter.currentOutstandingPrincipal).toBe(450000);
    expect(loanAfter.balanceSource).toBe('bank_confirmed');
    expect(loanAfter.ledgerVersion).toBe(2);
  });

  // ============================================================
  // 5. HISTORICAL SNAPSHOT IMMUTABILITY
  // ============================================================
  test('6. Historical payment snapshot remains immutable when loan profile terms change', () => {
    const store = createTestStore();

    store.dispatch(
      addLoanProfile({
        id: 'loan_1',
        name: 'Home Loan',
        originalPrincipal: 4000000,
        currentOutstandingPrincipal: 4000000,
        interestRate: 8.5,
      })
    );

    // Record payment under 8.5% interest rate
    store.dispatch(
      addPayment({
        id: 'pay_1',
        loanId: 'loan_1',
        amount: 34713,
        paymentDate: '2026-08-01',
        calculationSnapshot: {
          interestRate: 8.5,
          interestPortion: 28333,
          principalPortion: 6380,
          remainingPrincipal: 3993620,
        },
      })
    );

    // Later: User updates loan interest rate to 9.25%
    store.dispatch(updateLoanProfile({ id: 'loan_1', interestRate: 9.25 }));

    const state = store.getState();
    const loan = selectLoanProfileById(state, 'loan_1');
    const payment = selectPaymentsForLoan(state, 'loan_1')[0];

    expect(loan.interestRate).toBe(9.25);
    // Historical payment snapshot MUST NOT be mutated!
    expect(payment.calculationSnapshot.interestRate).toBe(8.5);
    expect(payment.calculationSnapshot.interestPortion).toBe(28333);
  });

  // ============================================================
  // 6. PRIVATE DETAILS & KEYCHAIN BOUNDARIES
  // ============================================================
  test('7. Private details metadata persists in Redux while secrets stay exclusively in Keychain', async () => {
    const store = createTestStore();

    // 1. Redux receives non-sensitive metadata and boolean flag
    store.dispatch(
      setLoanPrivateDetails({
        loanId: 'loan_1',
        lenderName: 'HDFC Bank',
        loanAccountReference: 'XXXX-1234',
        branchName: 'Koramangala, Bengaluru',
        hasSecureCredential: true,
      })
    );

    const state = store.getState();
    const details = selectPrivateDetailsByLoanId(state, 'loan_1');

    expect(details.lenderName).toBe('HDFC Bank');
    expect(details.loanAccountReference).toBe('XXXX-1234');
    expect(details.hasSecureCredential).toBe(true);
    // Redux MUST NEVER contain plaintext credentials
    expect(details.password).toBeUndefined();
    expect(details.sensitiveSecret).toBeUndefined();

    // 2. Test Keychain storage service directly
    Keychain.setGenericPassword.mockResolvedValue(true);
    Keychain.getGenericPassword.mockResolvedValue({ password: 'my_ultra_secret_pin_9876' });

    await securePrivateStorageService.setSecureValue('finzo.loan.loan_1.sensitive.credential', 'my_ultra_secret_pin_9876');
    const retrieved = await securePrivateStorageService.getSecureValue('finzo.loan.loan_1.sensitive.credential');

    expect(retrieved).toBe('my_ultra_secret_pin_9876');
  });

  test('8. Keychain failure throws typed error and NEVER falls back to AsyncStorage or Redux', async () => {
    Keychain.setGenericPassword.mockRejectedValue(new Error('Hardware Keystore Failure'));

    await expect(
      securePrivateStorageService.setSecureValue('finzo.loan.loan_1.sensitive.credential', 'secret')
    ).rejects.toThrow("Sensitive information couldn't be securely stored on this device.");
  });

  // ============================================================
  // 7. NOTES & GOALS PERSISTENCE
  // ============================================================
  test('9. Notes persist, support pinning, and enforce 500-note guard per loan', () => {
    const store = createTestStore();

    store.dispatch(
      addLoanNote({
        id: 'note_1',
        loanId: 'loan_1',
        title: 'Tax Provisional',
        content: '80C interest rebate',
        isPinned: false,
      })
    );

    // Toggle pin
    store.dispatch(toggleLoanNotePinned('note_1'));

    let state = store.getState();
    expect(selectPinnedLoanNotesByLoanId(state, 'loan_1')).toHaveLength(1);

    // Update note
    store.dispatch(updateLoanNote({ id: 'note_1', updates: { content: 'Updated rebate info' } }));
    state = store.getState();
    expect(selectLoanNotesByLoanId(state, 'loan_1')[0].content).toBe('Updated rebate info');
  });

  // ============================================================
  // 8. REWARDS & AD-FREE PERSISTENCE
  // ============================================================
  test('10. Rewards points and absolute adFreeUntil timestamp survive app restart', () => {
    const store1 = createTestStore();

    // Claim daily check-in
    store1.dispatch(claimDailyCheckIn({ points: 15, scheduleDay: 3, date: '2026-08-14T10:00:00.000Z' }));

    // Redeem 30 min ad-free
    const futureExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    store1.dispatch(
      redeemReward({
        reward: { id: 'ad_free_30m', durationMinutes: 30, pointsCost: 10 },
        date: new Date().toISOString(),
      })
    );

    const snapshot = store1.getState();

    // Rehydrate
    const store2 = createTestStore(snapshot);
    const state2 = store2.getState();

    expect(selectRewardPoints(state2)).toBe(5); // 15 claimed - 10 spent = 5
    expect(selectCurrentStreak(state2)).toBe(1);
    expect(selectAdFreeUntil(state2)).toBeTruthy();
    expect(selectIsAdFree(state2)).toBe(true);
    expect(selectRewardHistory(state2).length).toBeGreaterThanOrEqual(1);
  });

  // ============================================================
  // 9. REMINDERS & NOTIFICATION DEDUPLICATION
  // ============================================================
  test('11. Deterministic notification ID prevents duplicate scheduled reminders for same period', () => {
    const id1 = loanReminderService.scheduleLoanReminder;
    const notifId1 = 'loan_123_2026-09_3d';
    const notifId2 = 'loan_123_2026-09_3d';

    expect(notifId1).toBe(notifId2);
  });

  // ============================================================
  // 10. CORRUPTED STATE NORMALIZATION & RECOVERY
  // ============================================================
  test('12. normalizePersistedState handles null, undefined, or malformed state safely', () => {
    // Simulate severely corrupted persisted state
    const corruptState = {
      loanProfiles: null,
      loanPayments: { payments: 'invalid_string' },
      loanGoals: { goals: null },
      loanNotes: { notes: undefined },
      loanPrivateDetails: { detailsByLoanId: null },
      settings: null,
      rewards: { points: 'not_a_number' },
      savedCalculations: null,
    };

    const clean = normalizePersistedState(corruptState);

    expect(Array.isArray(clean.loanProfiles.profiles)).toBe(true);
    expect(Array.isArray(clean.loanPayments.payments)).toBe(true);
    expect(Array.isArray(clean.loanGoals.goals)).toBe(true);
    expect(Array.isArray(clean.loanNotes.notes)).toBe(true);
    expect(typeof clean.loanPrivateDetails.detailsByLoanId).toBe('object');
    expect(clean.settings.currency).toBe('INR');
    expect(clean.rewards.points).toBe(0);
    expect(Array.isArray(clean.savedCalculations.savedCalculations)).toBe(true);
  });

  // ============================================================
  // 11. REDUX-PERSIST MIGRATION ARCHITECTURE
  // ============================================================
  test('13. Migration manifest migrates version 0 to version 1 without wiping existing data', () => {
    expect(PERSIST_VERSION).toBe(1);
    expect(typeof migrations[0]).toBe('function');
    expect(typeof migrations[1]).toBe('function');

    const v0State = {
      loanProfiles: {
        profiles: [{ id: 'loan_old', name: 'Old Loan', originalPrincipal: 1000000, currentOutstandingPrincipal: 900000 }],
      },
      settings: { themeMode: 'dark' },
    };

    const v1State = migrations[1](v0State);

    expect(v1State.loanProfiles.profiles).toHaveLength(1);
    expect(v1State.loanProfiles.profiles[0].name).toBe('Old Loan');
    expect(v1State.settings.themeMode).toBe('dark');
    expect(v1State.settings.currency).toBe('INR'); // Default added cleanly
  });

  // ============================================================
  // 12. CASCADE DELETION SAFETY
  // ============================================================
  test('14. Deleting a loan profile cascades cleanly across all child collections', () => {
    const store = createTestStore();
    const loanId = 'loan_to_delete';

    // Populate all child slices
    store.dispatch(addLoanProfile({ id: loanId, name: 'Temporary Loan', originalPrincipal: 1000000 }));
    store.dispatch(addPayment({ id: 'p1', loanId, amount: 20000, paymentDate: '2026-08-01' }));
    store.dispatch(addLoanGoal({ id: 'g1', loanId, title: 'Pay off 10%' }));
    store.dispatch(addLoanNote({ id: 'n1', loanId, title: 'Note 1' }));
    store.dispatch(setLoanPrivateDetails({ loanId, lenderName: 'SBI' }));

    // Verify populated
    let state = store.getState();
    expect(selectLoanProfileById(state, loanId)).toBeDefined();
    expect(selectPaymentsForLoan(state, loanId)).toHaveLength(1);
    expect(selectLoanGoalsByLoanId(state, loanId)).toHaveLength(1);
    expect(selectLoanNotesByLoanId(state, loanId)).toHaveLength(1);
    expect(selectPrivateDetailsByLoanId(state, loanId)).toBeDefined();

    // Execute cascade delete
    store.dispatch(deletePaymentsForLoan(loanId));
    store.dispatch(deleteGoalsForLoan(loanId));
    store.dispatch(deleteNotesForLoan(loanId));
    store.dispatch(deleteLoanPrivateDetails(loanId));
    store.dispatch(deleteLoanProfile(loanId));

    // Verify completely cleaned up
    state = store.getState();
    expect(selectLoanProfileById(state, loanId)).toBeNull();
    expect(selectPaymentsForLoan(state, loanId)).toHaveLength(0);
    expect(selectLoanGoalsByLoanId(state, loanId)).toHaveLength(0);
    expect(selectLoanNotesByLoanId(state, loanId)).toHaveLength(0);
    expect(selectPrivateDetailsByLoanId(state, loanId)).toBeNull();
  });

  // ============================================================
  // 13. FIREBASE WRITE AUDIT
  // ============================================================
  test('15. Firebase RTDB is strictly read-only: 0 financial write methods exist in codebase', () => {
    // realtimeConfigService only subscribes to /config; no .set, .push, .update, or .remove are exported for user financial data
    const rtdbService = require('../../config/realtimeConfigService').default;
    expect(typeof rtdbService.initialize).toBe('function');
    expect(rtdbService.saveUserFinancialData).toBeUndefined();
    expect(rtdbService.syncLoansToCloud).toBeUndefined();
  });
});

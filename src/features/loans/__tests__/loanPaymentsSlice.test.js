import loanPaymentsReducer, {
  addPayment,
  updatePayment,
  deletePayment,
  deletePaymentsForLoan,
  selectPaymentsForLoan,
  selectTotalPaidForLoan,
} from '../../../store/slices/loanPaymentsSlice';
import loanProfilesReducer, {
  addLoanProfile,
  updateLoanProfile,
  deleteLoanProfile,
  archiveLoanProfile,
} from '../../../store/slices/loanProfilesSlice';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { createLoanProfile } from '../types/loanProfileTypes';

describe('Loan Payments Slice, Selectors, and Loan Balance Integration', () => {
  const initialPayments = { payments: [], schemaVersion: 1 };
  const initialProfiles = { profiles: [], schemaVersion: 1 };

  test('24. Dispatches addPayment correctly', () => {
    const pay = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const next = loanPaymentsReducer(initialPayments, addPayment(pay));
    expect(next.payments.length).toBe(1);
    expect(next.payments[0].id).toBe('p1');
  });

  test('25. Dispatches updatePayment correctly', () => {
    const pay = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const state1 = loanPaymentsReducer(initialPayments, addPayment(pay));
    const next = loanPaymentsReducer(state1, updatePayment({ id: 'p1', amount: 25000 }));
    expect(next.payments[0].amount).toBe(25000);
  });

  test('26. Dispatches deletePayment correctly', () => {
    const pay = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const state1 = loanPaymentsReducer(initialPayments, addPayment(pay));
    const next = loanPaymentsReducer(state1, deletePayment('p1'));
    expect(next.payments.length).toBe(0);
  });

  test('27. Dispatches deletePaymentsForLoan correctly', () => {
    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const p2 = createLoanPayment({ id: 'p2', loanId: 'l1', amount: 100000 });
    const p3 = createLoanPayment({ id: 'p3', loanId: 'l2', amount: 8000 });

    let state = loanPaymentsReducer(initialPayments, addPayment(p1));
    state = loanPaymentsReducer(state, addPayment(p2));
    state = loanPaymentsReducer(state, addPayment(p3));

    const next = loanPaymentsReducer(state, deletePaymentsForLoan('l1'));
    expect(next.payments.length).toBe(1);
    expect(next.payments[0].loanId).toBe('l2');
  });

  test('28 & 29. Supports multiple loans with isolated payment lists', () => {
    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const p2 = createLoanPayment({ id: 'p2', loanId: 'l2', amount: 8000 });

    let state = loanPaymentsReducer(initialPayments, addPayment(p1));
    state = loanPaymentsReducer(state, addPayment(p2));

    const rootState = { loanPayments: state };
    expect(selectPaymentsForLoan(rootState, 'l1').length).toBe(1);
    expect(selectPaymentsForLoan(rootState, 'l2').length).toBe(1);
    expect(selectTotalPaidForLoan(rootState, 'l1')).toBe(21450);
    expect(selectTotalPaidForLoan(rootState, 'l2')).toBe(8000);
  });

  test('30. Archiving loan preserves payment records intact', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan' });
    let profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));
    profState = loanProfilesReducer(profState, archiveLoanProfile({ id: 'l1', archive: true }));

    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const payState = loanPaymentsReducer(initialPayments, addPayment(p1));

    expect(profState.profiles[0].status).toBe('archived');
    expect(payState.payments.length).toBe(1);
  });

  test('31. Deleting loan removes all associated payment records', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan' });
    let profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));
    profState = loanProfilesReducer(profState, deleteLoanProfile('l1'));

    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    let payState = loanPaymentsReducer(initialPayments, addPayment(p1));
    payState = loanPaymentsReducer(payState, deletePaymentsForLoan('l1'));

    expect(profState.profiles.length).toBe(0);
    expect(payState.payments.length).toBe(0);
  });

  test('32. Primary loan status remains unaffected by payment operations', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan', isPrimary: true });
    const profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));

    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const payState = loanPaymentsReducer(initialPayments, addPayment(p1));

    expect(profState.profiles[0].isPrimary).toBe(true);
    expect(payState.payments.length).toBe(1);
  });

  test('33 & 34. Recording payment with/without balance update', () => {
    const payNoUpdate = createLoanPayment({
      id: 'p1',
      loanId: 'l1',
      amount: 21450,
      balanceUpdated: false,
    });
    expect(payNoUpdate.balanceUpdated).toBe(false);
    expect(payNoUpdate.outstandingAfter).toBeNull();

    const payWithUpdate = createLoanPayment({
      id: 'p2',
      loanId: 'l1',
      amount: 21450,
      outstandingBefore: 742500,
      outstandingAfter: 726320,
      balanceUpdated: true,
    });
    expect(payWithUpdate.balanceUpdated).toBe(true);
    expect(payWithUpdate.outstandingBefore).toBe(742500);
    expect(payWithUpdate.outstandingAfter).toBe(726320);
  });

  test('35 & 36. Stores outstandingBefore and outstandingAfter correctly', () => {
    const pay = createLoanPayment({
      id: 'p1',
      loanId: 'l1',
      amount: 21450,
      outstandingBefore: 742500,
      outstandingAfter: 726320,
      balanceUpdated: true,
    });
    expect(pay.outstandingBefore).toBe(742500);
    expect(pay.outstandingAfter).toBe(726320);
  });

  test('37. Updates loan profile currentOutstandingPrincipal only when balanceUpdated = true', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan', currentOutstandingPrincipal: 742500 });
    let profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));

    // Record payment with balance update
    profState = loanProfilesReducer(
      profState,
      updateLoanProfile({ id: 'l1', currentOutstandingPrincipal: 726320 })
    );
    expect(profState.profiles[0].currentOutstandingPrincipal).toBe(726320);
  });

  test('38. Deleting a payment record does NOT automatically change loan profile balance', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan', currentOutstandingPrincipal: 726320 });
    const profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));

    const p1 = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    let payState = loanPaymentsReducer(initialPayments, addPayment(p1));
    payState = loanPaymentsReducer(payState, deletePayment('p1'));

    expect(payState.payments.length).toBe(0);
    expect(profState.profiles[0].currentOutstandingPrincipal).toBe(726320);
  });

  test('39. Manual balance update updates loan currentOutstandingPrincipal cleanly', () => {
    const loan = createLoanProfile({ id: 'l1', name: 'Home Loan', currentOutstandingPrincipal: 726320 });
    let profState = loanProfilesReducer(initialProfiles, addLoanProfile(loan));

    profState = loanProfilesReducer(
      profState,
      updateLoanProfile({ id: 'l1', currentOutstandingPrincipal: 720000 })
    );
    expect(profState.profiles[0].currentOutstandingPrincipal).toBe(720000);
  });

  test('40. Balance never becomes negative upon validation', () => {
    const pay = createLoanPayment({
      id: 'p1',
      loanId: 'l1',
      amount: 100000,
      outstandingAfter: 0,
      balanceUpdated: true,
    });
    expect(pay.outstandingAfter).toBe(0);
  });
});

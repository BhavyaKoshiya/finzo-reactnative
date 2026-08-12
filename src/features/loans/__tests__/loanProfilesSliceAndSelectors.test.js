import loanProfilesReducer, {
  addLoanProfile,
  updateLoanProfile,
  deleteLoanProfile,
  archiveLoanProfile,
  setPrimaryLoan,
  selectActiveLoanProfiles,
  selectPrimaryLoan,
  selectTotalOutstanding,
} from '../../../store/slices/loanProfilesSlice';
import { createLoanProfile } from '../types/loanProfileTypes';

describe('Loan Profiles Slice and Selectors', () => {
  const initial = { profiles: [], schemaVersion: 1 };

  test('25. Dispatches addLoanProfile correctly', () => {
    const loan = createLoanProfile({ id: 'loan_1', name: 'Home Loan', isPrimary: true });
    const next = loanProfilesReducer(initial, addLoanProfile(loan));
    expect(next.profiles.length).toBe(1);
    expect(next.profiles[0].id).toBe('loan_1');
  });

  test('26. Dispatches updateLoanProfile correctly', () => {
    const loan = createLoanProfile({ id: 'loan_1', name: 'Home Loan', currentOutstandingPrincipal: 500000 });
    const state1 = loanProfilesReducer(initial, addLoanProfile(loan));
    const next = loanProfilesReducer(state1, updateLoanProfile({ id: 'loan_1', currentOutstandingPrincipal: 450000 }));
    expect(next.profiles[0].currentOutstandingPrincipal).toBe(450000);
  });

  test('27. Dispatches deleteLoanProfile correctly', () => {
    const loan = createLoanProfile({ id: 'loan_1', name: 'Home Loan' });
    const state1 = loanProfilesReducer(initial, addLoanProfile(loan));
    const next = loanProfilesReducer(state1, deleteLoanProfile('loan_1'));
    expect(next.profiles.length).toBe(0);
  });

  test('28. Dispatches archiveLoanProfile correctly', () => {
    const loan = createLoanProfile({ id: 'loan_1', name: 'Home Loan', status: 'active' });
    const state1 = loanProfilesReducer(initial, addLoanProfile(loan));
    const next = loanProfilesReducer(state1, archiveLoanProfile({ id: 'loan_1', archive: true }));
    expect(next.profiles[0].status).toBe('archived');
  });

  test('29. Sets primary loan', () => {
    const loan1 = createLoanProfile({ id: 'loan_1', name: 'Home Loan', isPrimary: true });
    const loan2 = createLoanProfile({ id: 'loan_2', name: 'Car Loan', isPrimary: false });
    let state = loanProfilesReducer(initial, addLoanProfile(loan1));
    state = loanProfilesReducer(state, addLoanProfile(loan2));

    state = loanProfilesReducer(state, setPrimaryLoan('loan_2'));
    expect(state.profiles.find((p) => p.id === 'loan_2').isPrimary).toBe(true);
    expect(state.profiles.find((p) => p.id === 'loan_1').isPrimary).toBe(false);
  });

  test('30. Switching primary automatically removes primary status from previous primary loan', () => {
    const loan1 = createLoanProfile({ id: 'loan_1', name: 'Home Loan', isPrimary: true });
    let state = loanProfilesReducer(initial, addLoanProfile(loan1));

    const loan2 = createLoanProfile({ id: 'loan_2', name: 'Car Loan', isPrimary: true });
    state = loanProfilesReducer(state, addLoanProfile(loan2));

    const primaries = state.profiles.filter((p) => p.isPrimary);
    expect(primaries.length).toBe(1);
    expect(primaries[0].id).toBe('loan_2');
  });

  test('31. Guarantees only one primary loan exists', () => {
    const loan1 = createLoanProfile({ id: 'loan_1', isPrimary: true });
    const loan2 = createLoanProfile({ id: 'loan_2', isPrimary: true });
    const loan3 = createLoanProfile({ id: 'loan_3', isPrimary: true });

    let state = loanProfilesReducer(initial, addLoanProfile(loan1));
    state = loanProfilesReducer(state, addLoanProfile(loan2));
    state = loanProfilesReducer(state, addLoanProfile(loan3));

    const primaries = state.profiles.filter((p) => p.isPrimary);
    expect(primaries.length).toBe(1);
    expect(primaries[0].id).toBe('loan_3');
  });

  test('32. Handles multiple active loans with correct selectors', () => {
    const loan1 = createLoanProfile({ id: 'loan_1', currentOutstandingPrincipal: 500000, status: 'active' });
    const loan2 = createLoanProfile({ id: 'loan_2', currentOutstandingPrincipal: 300000, status: 'active' });
    const loan3 = createLoanProfile({ id: 'loan_3', currentOutstandingPrincipal: 100000, status: 'archived' });

    let state = loanProfilesReducer(initial, addLoanProfile(loan1));
    state = loanProfilesReducer(state, addLoanProfile(loan2));
    state = loanProfilesReducer(state, addLoanProfile(loan3));

    const rootState = { loanProfiles: state };
    expect(selectActiveLoanProfiles(rootState).length).toBe(2);
    expect(selectTotalOutstanding(rootState)).toBe(800000);
  });
});

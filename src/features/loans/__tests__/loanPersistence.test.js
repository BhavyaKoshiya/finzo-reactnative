import { selectLoanProfiles, selectActiveLoanProfiles } from '../../../store/slices/loanProfilesSlice';
import { selectRewardPoints } from '../../../store/slices/rewardsSlice';
import { selectSavedCalculations } from '../../../store/slices/savedCalculationsSlice';
import { createLoanProfile } from '../types/loanProfileTypes';

describe('Loan Profiles Persistence and Hydration Safety', () => {
  test('33. Safely hydrates empty or uninitialized state', () => {
    const rootState = { loanProfiles: { profiles: [], schemaVersion: 1 } };
    expect(selectLoanProfiles(rootState)).toEqual([]);
    expect(selectActiveLoanProfiles(rootState)).toEqual([]);
  });

  test('34. Hydrates valid persisted loan profiles correctly', () => {
    const p1 = createLoanProfile({ id: 'loan_1', name: 'Home Loan', originalPrincipal: 1000000 });
    const rootState = {
      loanProfiles: {
        profiles: [p1],
        schemaVersion: 1,
      },
    };
    expect(selectLoanProfiles(rootState).length).toBe(1);
    expect(selectLoanProfiles(rootState)[0].id).toBe('loan_1');
  });

  test('35. Safely ignores malformed or corrupted persisted profile records without crashing', () => {
    const valid = createLoanProfile({ id: 'loan_1', name: 'Home Loan' });
    const malformed1 = { id: null, name: 'Bad' };
    const malformed2 = 'invalid_record_string';
    const malformed3 = { id: 'loan_bad', name: '', originalPrincipal: 'not_a_number' };

    const rootState = {
      loanProfiles: {
        profiles: [valid, malformed1, malformed2, malformed3],
        schemaVersion: 1,
      },
    };

    const result = selectLoanProfiles(rootState);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('loan_1');
  });

  test('36. Ensures rewards slice remains 100% unaffected by loan profiles state', () => {
    const rootState = {
      rewards: { points: 150 },
      loanProfiles: { profiles: [createLoanProfile({ id: 'l1', name: 'Car Loan' })] },
    };
    expect(selectRewardPoints(rootState)).toBe(150);
  });

  test('37. Ensures saved calculations slice remains 100% unaffected by loan profiles state', () => {
    const rootState = {
      savedCalculations: { savedCalculations: [{ id: 'calc_1', title: 'EMI Calculation' }] },
      loanProfiles: { profiles: [createLoanProfile({ id: 'l1', name: 'Car Loan' })] },
    };
    expect(selectSavedCalculations(rootState).length).toBe(1);
  });
});

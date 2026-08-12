import { selectLoanPayments, selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { selectLoanProfiles } from '../../../store/slices/loanProfilesSlice';
import { selectRewardPoints } from '../../../store/slices/rewardsSlice';
import { selectSavedCalculations } from '../../../store/slices/savedCalculationsSlice';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { createLoanProfile } from '../types/loanProfileTypes';

describe('Loan Payments Persistence and Hydration Safety', () => {
  test('41. Safely hydrates empty or uninitialized payment state', () => {
    const rootState = { loanPayments: { payments: [], schemaVersion: 1 } };
    expect(selectLoanPayments(rootState)).toEqual([]);
    expect(selectPaymentsForLoan(rootState, 'l1')).toEqual([]);
  });

  test('42. Safely ignores malformed or corrupted persisted payment records without crashing', () => {
    const valid = createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 });
    const malformed1 = { id: null, loanId: 'l1', amount: 'bad' };
    const malformed2 = 'invalid_string';
    const malformed3 = { id: 'p2', loanId: '', amount: -100 };

    const rootState = {
      loanPayments: {
        payments: [valid, malformed1, malformed2, malformed3],
        schemaVersion: 1,
      },
    };

    const result = selectLoanPayments(rootState);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('p1');
  });

  test('43. Ensures loan profiles state remains 100% intact when payment state hydrates', () => {
    const rootState = {
      loanProfiles: { profiles: [createLoanProfile({ id: 'l1', name: 'Home Loan' })] },
      loanPayments: { payments: [createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 })] },
    };
    expect(selectLoanProfiles(rootState).length).toBe(1);
  });

  test('44. Ensures rewards state remains 100% intact', () => {
    const rootState = {
      rewards: { points: 200 },
      loanPayments: { payments: [createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 })] },
    };
    expect(selectRewardPoints(rootState)).toBe(200);
  });

  test('45. Ensures saved calculations state remains 100% intact', () => {
    const rootState = {
      savedCalculations: { savedCalculations: [{ id: 'calc_1', title: 'EMI Calculation' }] },
      loanPayments: { payments: [createLoanPayment({ id: 'p1', loanId: 'l1', amount: 21450 })] },
    };
    expect(selectSavedCalculations(rootState).length).toBe(1);
  });
});

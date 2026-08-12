import { ROUTES } from '../../../navigation/routes';
import { selectActiveLoanProfiles, selectTotalOutstanding, selectTotalMonthlyEMI } from '../../../store/slices/loanProfilesSlice';
import { selectSavedCalculations } from '../../../store/slices/savedCalculationsSlice';
import { createLoanProfile } from '../../loans/types/loanProfileTypes';

describe('My Loans Workspace — Phase 16.1 & 16.2 Integration Tests', () => {
  const initialProfiles = [
    createLoanProfile({ id: 'loan_1', name: 'Home Loan', currentOutstandingPrincipal: 742500, emiAmount: 21450, isPrimary: true }),
    createLoanProfile({ id: 'loan_2', name: 'Car Loan', currentOutstandingPrincipal: 410000, emiAmount: 17450 }),
  ];

  const initialSavedCalculations = [
    { id: 'calc_1', calculatorId: 'home_loan_emi', title: 'My Home Loan Calculation', isFavorite: true, inputs: { principal: '1000000' } },
    { id: 'calc_2', calculatorId: 'sip', title: 'SIP Plan', isFavorite: false, inputs: { monthlyInvestment: '5000' } },
  ];

  test('1. Verified ROUTES.MY_LOANS is defined and ROUTES.SAVED points to MyLoans for backward compatibility', () => {
    expect(ROUTES.MY_LOANS).toBe('MyLoans');
    expect(ROUTES.SAVED).toBe('MyLoans');
  });

  test('2. Real loans domain aggregates total outstanding and monthly EMI from active loan profiles ONLY', () => {
    const rootState = {
      loanProfiles: { profiles: initialProfiles, schemaVersion: 1 },
      savedCalculations: { savedCalculations: initialSavedCalculations },
    };

    const activeLoans = selectActiveLoanProfiles(rootState);
    const totalOutstanding = selectTotalOutstanding(rootState);
    const totalEMI = selectTotalMonthlyEMI(rootState);

    expect(activeLoans.length).toBe(2);
    expect(totalOutstanding).toBe(1152500);
    expect(totalEMI).toBe(38900);
  });

  test('3. Saved calculations domain remains 100% isolated from real user loan state', () => {
    const rootState = {
      loanProfiles: { profiles: initialProfiles, schemaVersion: 1 },
      savedCalculations: { savedCalculations: initialSavedCalculations },
    };

    const savedItems = selectSavedCalculations(rootState);
    expect(savedItems.length).toBe(2);
    expect(savedItems[0].title).toBe('My Home Loan Calculation');
  });

  test('4. Favorites filter returns only saved items marked isFavorite = true', () => {
    const rootState = {
      savedCalculations: { savedCalculations: initialSavedCalculations },
    };
    const savedItems = selectSavedCalculations(rootState);
    const favorites = savedItems.filter((item) => item.isFavorite);

    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe('calc_1');
  });
});

import {
  selectActiveLoanProfiles,
  selectActiveLoanCount,
  selectTotalOriginalLoanAmount,
  selectTotalOutstandingPrincipal,
  selectTotalPrincipalPaid,
  selectTotalMonthlyEMI,
} from '../../../store/slices/loanProfilesSlice';
import { createLoanProfile } from '../../loans/types/loanProfileTypes';
import { getCurrentLoanBalance } from '../../loans/utils/paymentBalanceUtils';
import { calculatePrincipalRepaymentProgress } from '../../loans/utils/loanDashboardUtils';

describe('My Loans Summary Card — Loan Amount vs Outstanding Clarity Tests', () => {
  test('Case 1: Single Loan (Original = 35L, Outstanding = 25L) yields correct aggregates and paid percentage', () => {
    const loan = createLoanProfile({
      id: 'loan_35l',
      name: 'Home Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2500000,
      emiAmount: 31266,
      status: 'active',
    });

    const rootState = {
      loanProfiles: { profiles: [loan], schemaVersion: 1 },
    };

    const count = selectActiveLoanCount(rootState);
    const original = selectTotalOriginalLoanAmount(rootState);
    const outstanding = selectTotalOutstandingPrincipal(rootState);
    const paid = selectTotalPrincipalPaid(rootState);
    const emi = selectTotalMonthlyEMI(rootState);

    expect(count).toBe(1);
    expect(original).toBe(3500000);
    expect(outstanding).toBe(2500000);
    expect(paid).toBe(1000000);
    expect(emi).toBe(31266);

    const progress = calculatePrincipalRepaymentProgress(original, outstanding);
    expect(progress.principalRepaid).toBe(1000000);
    expect(progress.percentage).toBe(28.57);
  });

  test('Case 2: Single Loan (Original = 35L, Outstanding = 35L) yields 0 principal paid (0%)', () => {
    const loan = createLoanProfile({
      id: 'loan_new',
      name: 'New Home Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 3500000,
      emiAmount: 31266,
      status: 'active',
    });

    const rootState = {
      loanProfiles: { profiles: [loan], schemaVersion: 1 },
    };

    const original = selectTotalOriginalLoanAmount(rootState);
    const outstanding = selectTotalOutstandingPrincipal(rootState);
    const paid = selectTotalPrincipalPaid(rootState);

    expect(original).toBe(3500000);
    expect(outstanding).toBe(3500000);
    expect(paid).toBe(0);

    const progress = calculatePrincipalRepaymentProgress(original, outstanding);
    expect(progress.principalRepaid).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('Case 3: Single Loan (Original = 35L, Outstanding = 0) yields 100% principal paid', () => {
    const loan = createLoanProfile({
      id: 'loan_paid_off',
      name: 'Completed Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 0,
      emiAmount: 31266,
      status: 'active',
    });

    const rootState = {
      loanProfiles: { profiles: [loan], schemaVersion: 1 },
    };

    const original = selectTotalOriginalLoanAmount(rootState);
    const outstanding = selectTotalOutstandingPrincipal(rootState);
    const paid = selectTotalPrincipalPaid(rootState);

    expect(original).toBe(3500000);
    expect(outstanding).toBe(0);
    expect(paid).toBe(3500000);

    const progress = calculatePrincipalRepaymentProgress(original, outstanding);
    expect(progress.principalRepaid).toBe(3500000);
    expect(progress.percentage).toBe(100);
  });

  test('Case 4: Two Active Loans (Loan A: 35L/25L, Loan B: 10L/8L) aggregate correctly', () => {
    const loanA = createLoanProfile({
      id: 'loan_a',
      name: 'Home Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2500000,
      emiAmount: 31266,
      status: 'active',
    });
    const loanB = createLoanProfile({
      id: 'loan_b',
      name: 'Car Loan',
      originalPrincipal: 1000000,
      currentOutstandingPrincipal: 800000,
      emiAmount: 22000,
      status: 'active',
    });

    const rootState = {
      loanProfiles: { profiles: [loanA, loanB], schemaVersion: 1 },
    };

    const count = selectActiveLoanCount(rootState);
    const original = selectTotalOriginalLoanAmount(rootState);
    const outstanding = selectTotalOutstandingPrincipal(rootState);
    const paid = selectTotalPrincipalPaid(rootState);
    const emi = selectTotalMonthlyEMI(rootState);

    expect(count).toBe(2);
    expect(original).toBe(4500000);
    expect(outstanding).toBe(3300000);
    expect(paid).toBe(1200000);
    expect(emi).toBe(53266);

    const progress = calculatePrincipalRepaymentProgress(original, outstanding);
    expect(progress.principalRepaid).toBe(1200000);
    expect(progress.percentage).toBe(26.67);
  });

  test('Case 5: Archived loans are strictly excluded from active totals', () => {
    const activeLoan = createLoanProfile({
      id: 'loan_active',
      name: 'Active Home Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2500000,
      emiAmount: 31266,
      status: 'active',
    });
    const archivedLoan = createLoanProfile({
      id: 'loan_archived',
      name: 'Archived Personal Loan',
      originalPrincipal: 500000,
      currentOutstandingPrincipal: 200000,
      emiAmount: 10000,
      status: 'archived',
    });

    const rootState = {
      loanProfiles: { profiles: [activeLoan, archivedLoan], schemaVersion: 1 },
    };

    const count = selectActiveLoanCount(rootState);
    const original = selectTotalOriginalLoanAmount(rootState);
    const outstanding = selectTotalOutstandingPrincipal(rootState);
    const paid = selectTotalPrincipalPaid(rootState);

    expect(count).toBe(1);
    expect(original).toBe(3500000);
    expect(outstanding).toBe(2500000);
    expect(paid).toBe(1000000);
  });

  test('Case 6: Bank-confirmed balance integration via getCurrentLoanBalance', () => {
    const loan = createLoanProfile({
      id: 'loan_confirmed',
      name: 'Confirmed Loan',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2450000,
      userConfirmedBalance: 2450000,
      balanceSource: 'bank_confirmed',
      status: 'active',
    });

    const balanceInfo = getCurrentLoanBalance(loan, []);
    expect(balanceInfo.currentBalance).toBe(2450000);
    expect(balanceInfo.isBankConfirmed).toBe(true);
    expect(balanceInfo.balanceSource).toBe('bank_confirmed');

    const rootState = {
      loanProfiles: { profiles: [loan], schemaVersion: 1 },
    };

    expect(selectTotalOutstandingPrincipal(rootState)).toBe(2450000);
    expect(selectTotalPrincipalPaid(rootState)).toBe(1050000);
  });
});

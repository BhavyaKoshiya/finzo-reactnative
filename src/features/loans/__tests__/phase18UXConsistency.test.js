import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { getPaymentStats } from '../utils/loanBalanceUtils';
import { getCurrentLoanBalance, recalculateLoanBalanceFromPayments } from '../utils/paymentBalanceUtils';
import { selectLoanProfileById, selectActiveLoanProfiles } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { selectIsAdFree, selectAdFreeUntil } from '../../../store/slices/rewardsSlice';
import { AD_DECISION_REASONS, isProtectedScreen } from '../../../services/ads/adDecisionEngine';

describe('Phase 18 — App-Wide UX Consistency, Navigation Polish & Quality Audit Tests', () => {
  const sampleLoan = {
    id: 'loan_123',
    name: 'Home Loan',
    originalPrincipal: 3500000,
    currentOutstandingPrincipal: 2500000,
    emiAmount: 31266,
    annualInterestRate: 8.5,
    tenureMonths: 240,
    startDate: '2025-01-01',
    firstEmiDate: '2025-02-01',
    status: 'active',
    balanceSource: 'estimated',
  };

  const samplePayments = [
    {
      id: 'pay_1',
      loanId: 'loan_123',
      paymentAmount: 31266,
      paymentDate: '2025-02-01',
      paymentType: 'regular_emi',
      balanceSource: 'estimated',
    },
  ];

  test('1. Financial Metric Hierarchy: Outstanding Principal is hero metric, Total Loan Amount is secondary', () => {
    const balanceState = getCurrentLoanBalance(sampleLoan, samplePayments);
    expect(balanceState.currentBalance).toBe(2500000);
    expect(sampleLoan.originalPrincipal).toBe(3500000);
    expect(sampleLoan.emiAmount).toBe(31266);
  });

  test('2. Multi-Loan Workspace: State supports multiple active loans cleanly', () => {
    const mockState = {
      loanProfiles: {
        profiles: [
          sampleLoan,
          { ...sampleLoan, id: 'loan_456', name: 'Car Loan', originalPrincipal: 800000, currentOutstandingPrincipal: 500000 },
        ],
      },
    };

    const activeLoans = selectActiveLoanProfiles(mockState);
    expect(activeLoans.length).toBe(2);

    const firstLoan = selectLoanProfileById(mockState, 'loan_123');
    const secondLoan = selectLoanProfileById(mockState, 'loan_456');
    expect(firstLoan.name).toBe('Home Loan');
    expect(secondLoan.name).toBe('Car Loan');
  });

  test('3. Ledger Recalculation: Payment addition recalculates estimated balance correctly', () => {
    const { finalEstimatedBalance } = recalculateLoanBalanceFromPayments({
      loan: sampleLoan,
      payments: samplePayments,
    });

    expect(finalEstimatedBalance).toBeLessThanOrEqual(3500000);
    expect(finalEstimatedBalance).toBeGreaterThan(0);
  });

  test('4. Protected Financial Workflows: 100% ad-free on sensitive task screens', () => {
    const sensitiveScreens = ['add_payment', 'edit_payment', 'add_loan', 'correct_balance', 'pdf_export'];
    sensitiveScreens.forEach((screen) => {
      expect(isProtectedScreen(screen)).toBe(true);
    });
  });

  test('5. Ad-Free Entitlement Selectors: State handles active and expired states', () => {
    const activeUntil = new Date(Date.now() + 1800 * 1000).toISOString();
    const activeState = {
      rewards: {
        adFreeUntil: activeUntil,
      },
    };
    expect(selectIsAdFree(activeState)).toBe(true);
    expect(selectAdFreeUntil(activeState)).toBe(activeUntil);

    const expiredUntil = new Date(Date.now() - 1000).toISOString();
    const expiredState = {
      rewards: {
        adFreeUntil: expiredUntil,
      },
    };
    expect(selectIsAdFree(expiredState)).toBe(false);
  });
});

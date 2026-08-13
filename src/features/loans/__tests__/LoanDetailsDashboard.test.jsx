import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { getPaymentStatus } from '../utils/loanReminderUtils';
import { createLoanProfile } from '../types/loanProfileTypes';
import LoanDetailsScreen from '../screens/LoanDetailsScreen';
import QuickActionsGrid from '../components/QuickActionsGrid';
import LoanGoalPreviewCard from '../components/LoanGoalPreviewCard';
import LoanNotesPreviewCard from '../components/LoanNotesPreviewCard';
import LoanPrivateDetailsPreviewCard from '../components/LoanPrivateDetailsPreviewCard';
import ManageLoanCard from '../components/ManageLoanCard';

describe('LoanDetailsDashboard & Presentation Adapters', () => {
  it('adaptLoanProfileForDisplay dynamically calculates remaining tenure when value is 0', () => {
    const rawProfile = createLoanProfile({
      id: 'loan_1',
      name: 'Home Loan',
      lenderName: 'HDFC Bank',
      originalPrincipal: 3500000,
      currentOutstandingPrincipal: 2500000,
      annualInterestRate: 7.4,
      emiAmount: 31266,
      originalTenure: { value: 20, unit: 'years' },
      remainingTenure: { value: 0, unit: 'months' },
      loanStartDate: '2026-08-13',
      nextEmiDate: '2026-09-05',
    });

    const adapted = adaptLoanProfileForDisplay(rawProfile, []);
    expect(adapted).toBeDefined();
    expect(adapted.name).toBe('Home Loan');
    expect(adapted.remainingTenureText).not.toBe('0 months');
    expect(adapted.remainingTenureText).toMatch(/\d+ (months|years)/);
  });

  it('synchronizes nextEmiInfo with payment status next due date', () => {
    const rawProfile = createLoanProfile({
      id: 'loan_1',
      dueDay: 5,
      nextEmiDate: '2026-09-05',
      currentOutstandingPrincipal: 2000000,
    });

    const adapted = adaptLoanProfileForDisplay(rawProfile, []);
    const paymentStatus = getPaymentStatus(rawProfile, []);

    expect(adapted.nextEmiInfo.formattedDate).toBeDefined();
    expect(paymentStatus.nextDueDate).toBeDefined();
  });

  it('exports LoanDetailsScreen and dashboard subcomponents cleanly', () => {
    expect(LoanDetailsScreen).toBeDefined();
    expect(QuickActionsGrid).toBeDefined();
    expect(LoanGoalPreviewCard).toBeDefined();
    expect(LoanNotesPreviewCard).toBeDefined();
    expect(LoanPrivateDetailsPreviewCard).toBeDefined();
    expect(ManageLoanCard).toBeDefined();
  });
});

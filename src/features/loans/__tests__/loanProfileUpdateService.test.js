import { updateLoanProfileService } from '../services/loanProfileUpdateService';
import loanReminderService from '../services/loanReminderService';

jest.mock('../services/loanReminderService', () => ({
  reconcileLoanReminders: jest.fn(),
  cancelLoanReminders: jest.fn().mockResolvedValue(true),
}));

describe('Loan Profile Update Service & Data Integrity', () => {
  const loanA = {
    id: 'loan_a',
    name: 'Home Loan A',
    loanType: 'home_loan',
    lenderName: 'HDFC Bank',
    originalPrincipal: 1000000,
    currentOutstandingPrincipal: 900000,
    userConfirmedBalance: 900000,
    balanceSource: 'bank_confirmed',
    lastBalanceConfirmationDate: '2026-06-01',
    annualInterestRate: 8.5,
    emiAmount: 12000,
    originalTenure: { value: 120, unit: 'months' },
    remainingTenure: { value: 100, unit: 'months' },
    loanStartDate: '2026-01-01',
    nextEmiDate: '2026-09-05',
    dueDay: 5,
    remindersEnabled: true,
    reminderDaysBefore: 3,
    reminderTime: '09:00',
    ledgerVersion: 3,
    status: 'active',
  };

  const loanB = {
    id: 'loan_b',
    name: 'Car Loan B',
    loanType: 'car_loan',
    lenderName: 'SBI',
    originalPrincipal: 500000,
    currentOutstandingPrincipal: 450000,
    annualInterestRate: 10.0,
    emiAmount: 10000,
    originalTenure: { value: 60, unit: 'months' },
    ledgerVersion: 1,
    status: 'active',
  };

  const samplePaymentsA = [
    {
      id: 'pay_1',
      loanId: 'loan_a',
      paymentAmount: 12000,
      actualPrincipal: 4917,
      actualInterest: 7083,
      calculationSnapshot: {
        annualRate: 8.5,
        estimatedInterest: 7083,
        estimatedPrincipal: 4917,
      },
    },
  ];

  let dispatchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn();
  });

  describe('Ledger Versioning & Data Protection', () => {
    it('does NOT increment ledgerVersion for cosmetic profile edits (name, lender)', () => {
      const formPayload = {
        ...loanA,
        name: 'Renamed Home Loan',
        lenderName: 'HDFC Ltd',
      };

      const result = updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: samplePaymentsA,
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      expect(result.success).toBe(true);
      expect(result.updatedRecord.ledgerVersion).toBe(3); // Unchanged ledgerVersion
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it('increments ledgerVersion by 1 for material financial edits (interest rate, EMI)', () => {
      const formPayload = {
        ...loanA,
        annualInterestRate: 9.5,
      };

      const result = updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: samplePaymentsA,
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      expect(result.success).toBe(true);
      expect(result.updatedRecord.ledgerVersion).toBe(4); // Incremented from 3 to 4
    });

    it('protects current outstanding balance from direct form overwrite', () => {
      const formPayload = {
        ...loanA,
        currentOutstandingPrincipal: 1000, // Malicious / direct edit attempt
      };

      const result = updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: samplePaymentsA,
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      expect(result.success).toBe(true);
      expect(result.updatedRecord.currentOutstandingPrincipal).toBe(900000); // Preserved anchor!
    });

    it('preserves historical payment calculationSnapshots intact after profile rate edit', () => {
      const formPayload = {
        ...loanA,
        annualInterestRate: 18.0,
      };

      updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: samplePaymentsA,
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      // Past payment calculationSnapshot must remain 8.5%
      expect(samplePaymentsA[0].calculationSnapshot.annualRate).toBe(8.5);
      expect(samplePaymentsA[0].calculationSnapshot.estimatedInterest).toBe(7083);
    });
  });

  describe('Multiple Loan Isolation', () => {
    it('editing Loan A leaves Loan B 100% byte-for-byte unchanged', () => {
      const initialLoanBJson = JSON.stringify(loanB);

      updateLoanProfileService({
        existingProfile: loanA,
        formPayload: { ...loanA, name: 'Modified Loan A', annualInterestRate: 12.0 },
        payments: samplePaymentsA,
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      expect(JSON.stringify(loanB)).toBe(initialLoanBJson);
    });
  });

  describe('Zero Interest & Validation', () => {
    it('supports 0% interest rate as a valid loan edit', () => {
      const formPayload = {
        ...loanA,
        annualInterestRate: 0,
      };

      const result = updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: [],
        allLoans: [loanA],
        dispatch: dispatchMock,
      });

      expect(result.success).toBe(true);
      expect(result.updatedRecord.annualInterestRate).toBe(0);
    });
  });

  describe('Reminder Reconciliation Trigger', () => {
    it('triggers reconcileLoanReminders when dueDay or reminder preferences change', () => {
      const formPayload = {
        ...loanA,
        dueDay: 15,
      };

      updateLoanProfileService({
        existingProfile: loanA,
        formPayload,
        payments: [],
        allLoans: [loanA, loanB],
        dispatch: dispatchMock,
      });

      expect(loanReminderService.reconcileLoanReminders).toHaveBeenCalledTimes(1);
    });
  });
});

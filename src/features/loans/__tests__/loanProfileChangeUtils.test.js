import {
  getLoanProfileChanges,
  classifyLoanProfileChanges,
  requiresMaterialChangeConfirmation,
  buildLoanChangeSummary,
  CHANGE_CATEGORIES,
} from '../utils/loanProfileChangeUtils';

describe('Loan Profile Change Utilities', () => {
  const baseProfile = {
    id: 'loan_1',
    name: 'Home Loan',
    loanType: 'home_loan',
    lenderName: 'HDFC Bank',
    originalPrincipal: 1000000,
    annualInterestRate: 8.5,
    emiAmount: 12000,
    originalTenure: { value: 120, unit: 'months' },
    loanStartDate: '2026-01-01',
    dueDay: 5,
    remindersEnabled: true,
    reminderDaysBefore: 3,
    reminderTime: '09:00',
    notes: 'Sample note',
  };

  describe('getLoanProfileChanges & classifyLoanProfileChanges', () => {
    it('detects cosmetic changes only (name, lender, notes)', () => {
      const updatedValues = {
        ...baseProfile,
        name: 'My Custom Home Loan',
        lenderName: 'HDFC Bank Ltd',
        notes: 'Updated note',
      };

      const changes = getLoanProfileChanges(baseProfile, updatedValues);
      const classified = classifyLoanProfileChanges(changes);

      expect(classified.hasChanges).toBe(true);
      expect(classified.hasCosmeticChanges).toBe(true);
      expect(classified.hasMaterialChanges).toBe(false);
      expect(classified.hasReminderChanges).toBe(false);
      expect(classified.cosmetic.map((c) => c.fieldKey)).toEqual(['name', 'lenderName', 'notes']);
    });

    it('detects material financial & tenure edits', () => {
      const updatedValues = {
        ...baseProfile,
        annualInterestRate: 9.0,
        emiAmount: 12500,
      };

      const changes = getLoanProfileChanges(baseProfile, updatedValues);
      const classified = classifyLoanProfileChanges(changes);

      expect(classified.hasMaterialChanges).toBe(true);
      expect(classified.material.map((c) => c.fieldKey)).toEqual(['annualInterestRate', 'emiAmount']);
    });

    it('detects reminder preferences edits', () => {
      const updatedValues = {
        ...baseProfile,
        dueDay: 10,
        reminderDaysBefore: 5,
      };

      const changes = getLoanProfileChanges(baseProfile, updatedValues);
      const classified = classifyLoanProfileChanges(changes);

      expect(classified.hasReminderChanges).toBe(true);
      expect(classified.reminder.map((c) => c.fieldKey)).toEqual(['dueDay', 'reminderDaysBefore']);
    });
  });

  describe('requiresMaterialChangeConfirmation', () => {
    it('returns false if only cosmetic edits exist, even with payments', () => {
      const changes = getLoanProfileChanges(baseProfile, { ...baseProfile, name: 'Renamed Loan' });
      const requiresConfirm = requiresMaterialChangeConfirmation(changes, [{ id: 'p1' }]);

      expect(requiresConfirm).toBe(false);
    });

    it('returns false if material edits exist but zero payments recorded', () => {
      const changes = getLoanProfileChanges(baseProfile, { ...baseProfile, annualInterestRate: 9.5 });
      const requiresConfirm = requiresMaterialChangeConfirmation(changes, []);

      expect(requiresConfirm).toBe(false);
    });

    it('returns true if material edits exist AND payment history exists', () => {
      const changes = getLoanProfileChanges(baseProfile, { ...baseProfile, annualInterestRate: 9.5 });
      const requiresConfirm = requiresMaterialChangeConfirmation(changes, [{ id: 'p1' }]);

      expect(requiresConfirm).toBe(true);
    });
  });

  describe('buildLoanChangeSummary', () => {
    it('builds structured diff list for modal UI', () => {
      const changes = getLoanProfileChanges(baseProfile, {
        ...baseProfile,
        annualInterestRate: 9.25,
        dueDay: 7,
      });

      const summary = buildLoanChangeSummary(changes);

      expect(summary.length).toBe(2);
      const rateDiff = summary.find((s) => s.key === 'annualInterestRate');
      expect(rateDiff.from).toBe('8.50%');
      expect(rateDiff.to).toBe('9.25%');
      expect(rateDiff.isMaterial).toBe(true);
    });
  });
});

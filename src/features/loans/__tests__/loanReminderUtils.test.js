import {
  normalizeDueDay,
  getLastDayOfMonth,
  calculateNextDueDate,
  getNextLoanPaymentDate,
  getPaymentPeriodKey,
  isPaymentPeriodSatisfied,
  getPaymentStatus,
  getReminderDate,
} from '../utils/loanReminderUtils';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

describe('loanReminderUtils — Pure Date & Reminder Calculations', () => {
  describe('normalizeDueDay', () => {
    it('returns valid day numbers between 1 and 31', () => {
      expect(normalizeDueDay(1)).toBe(1);
      expect(normalizeDueDay(15)).toBe(15);
      expect(normalizeDueDay(31)).toBe(31);
    });

    it('clamps values below 1 or invalid inputs to 5 default', () => {
      expect(normalizeDueDay(0)).toBe(5);
      expect(normalizeDueDay(-10)).toBe(5);
      expect(normalizeDueDay('abc')).toBe(5);
    });

    it('clamps values above 31 to 31', () => {
      expect(normalizeDueDay(35)).toBe(31);
    });
  });

  describe('getLastDayOfMonth', () => {
    it('returns 28 for February in non-leap year (e.g. 2026)', () => {
      expect(getLastDayOfMonth(2026, 1)).toBe(28);
    });

    it('returns 29 for February in leap year (e.g. 2028)', () => {
      expect(getLastDayOfMonth(2028, 1)).toBe(29);
    });

    it('returns 31 for January and 30 for April', () => {
      expect(getLastDayOfMonth(2026, 0)).toBe(31); // Jan
      expect(getLastDayOfMonth(2026, 3)).toBe(30); // Apr
    });
  });

  describe('calculateNextDueDate', () => {
    it('calculates due date in current month if current day is before due day', () => {
      const ref = new Date(2026, 7, 10); // Aug 10, 2026
      const result = calculateNextDueDate(15, ref);
      expect(result).toBe('2026-08-15');
    });

    it('calculates due date in next month if current day is past due day', () => {
      const ref = new Date(2026, 7, 20); // Aug 20, 2026
      const result = calculateNextDueDate(15, ref);
      expect(result).toBe('2026-09-15');
    });

    it('handles February day 31 safely by capping to Feb 28 in non-leap year', () => {
      const ref = new Date(2026, 1, 1); // Feb 1, 2026
      const result = calculateNextDueDate(31, ref);
      expect(result).toBe('2026-02-28');
    });

    it('handles February day 31 safely by capping to Feb 29 in leap year', () => {
      const ref = new Date(2028, 1, 1); // Feb 1, 2028
      const result = calculateNextDueDate(31, ref);
      expect(result).toBe('2028-02-29');
    });

    it('handles year rollover (Dec 25 -> due day 10 is Jan 10 next year)', () => {
      const ref = new Date(2026, 11, 25); // Dec 25, 2026
      const result = calculateNextDueDate(10, ref);
      expect(result).toBe('2027-01-10');
    });
  });

  describe('getNextLoanPaymentDate', () => {
    it('uses loan.nextPaymentDate if explicitly provided and valid', () => {
      const loan = { id: 'l1', dueDay: 5, nextPaymentDate: '2026-09-10' };
      expect(getNextLoanPaymentDate(loan)).toBe('2026-09-10');
    });

    it('falls back to calculateNextDueDate if nextPaymentDate is missing', () => {
      const loan = { id: 'l1', dueDay: 5 };
      const ref = new Date(2026, 7, 1); // Aug 1, 2026
      expect(getNextLoanPaymentDate(loan, ref)).toBe('2026-08-05');
    });
  });

  describe('getPaymentPeriodKey', () => {
    it('generates deterministic period key e.g. loan123_2026-09', () => {
      expect(getPaymentPeriodKey('loan123', '2026-09-05')).toBe('loan123_2026-09');
    });
  });

  describe('isPaymentPeriodSatisfied', () => {
    const loan = { id: 'loan1' };

    it('returns true when regular EMI payment exists for the period', () => {
      const payments = [
        {
          id: 'p1',
          loanId: 'loan1',
          paymentType: PAYMENT_TYPES.REGULAR_EMI,
          paymentDate: '2026-09-05',
        },
      ];
      expect(isPaymentPeriodSatisfied(loan, payments, 'loan1_2026-09')).toBe(true);
    });

    it('returns false when only a prepayment exists for the period', () => {
      const payments = [
        {
          id: 'p1',
          loanId: 'loan1',
          paymentType: PAYMENT_TYPES.PREPAYMENT,
          paymentDate: '2026-09-05',
        },
      ];
      expect(isPaymentPeriodSatisfied(loan, payments, 'loan1_2026-09')).toBe(false);
    });

    it('returns false when no payments exist for the period', () => {
      expect(isPaymentPeriodSatisfied(loan, [], 'loan1_2026-09')).toBe(false);
    });
  });

  describe('getPaymentStatus', () => {
    const loan = {
      id: 'loan1',
      dueDay: 15,
      currentOutstandingPrincipal: 500000,
      status: 'active',
    };

    it('returns paid_off for archived or zero-balance loan', () => {
      const paidLoan = { ...loan, currentOutstandingPrincipal: 0 };
      expect(getPaymentStatus(paidLoan, [], '2026-08-10').status).toBe('paid_off');
    });

    it('returns isCurrentPeriodPaid = true when current period is satisfied', () => {
      const payments = [
        { loanId: 'loan1', paymentType: PAYMENT_TYPES.REGULAR_EMI, paymentDate: '2026-08-15' },
      ];
      const statusObj = getPaymentStatus(loan, payments, new Date(2026, 7, 10));
      expect(statusObj.isCurrentPeriodPaid).toBe(true);
      expect(statusObj.nextDueDate).toBe('2026-09-15');
    });

    it('returns upcoming when due date is in future', () => {
      const ref = new Date(2026, 7, 10); // Aug 10, 2026 (due Aug 15)
      const statusObj = getPaymentStatus(loan, [], ref);
      expect(statusObj.status).toBe('upcoming');
      expect(statusObj.daysRemaining).toBe(5);
    });

    it('returns due_today when current date matches due date', () => {
      const ref = new Date(2026, 7, 15); // Aug 15, 2026
      const statusObj = getPaymentStatus(loan, [], ref);
      expect(statusObj.status).toBe('due_today');
    });

    it('returns overdue when current date is past due date and unpaid', () => {
      const ref = new Date(2026, 7, 18); // Aug 18, 2026 (due Aug 15)
      const statusObj = getPaymentStatus(loan, [], ref);
      expect(statusObj.status).toBe('overdue');
      expect(statusObj.daysOverdue).toBe(3);
    });
  });

  describe('getReminderDate', () => {
    it('calculates reminder date N days before at specified time', () => {
      const remDate = getReminderDate('2026-09-05', 3, '09:00');
      expect(remDate.getFullYear()).toBe(2026);
      expect(remDate.getMonth()).toBe(8); // Sept is 8
      expect(remDate.getDate()).toBe(2);
      expect(remDate.getHours()).toBe(9);
    });
  });
});

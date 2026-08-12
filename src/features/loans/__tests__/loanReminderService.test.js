import notifee from '@notifee/react-native';
import { loanReminderService, getNotificationId } from '../services/loanReminderService';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

describe('loanReminderService — Local Notifee Reminder Manager', () => {
  beforeEach(async () => {
    loanReminderService.clearRegistry();
    jest.clearAllMocks();
  });

  const sampleLoan = {
    id: 'loan_101',
    name: 'Home Loan',
    dueDay: 25,
    emiAmount: 25000,
    currentOutstandingPrincipal: 1000000,
    remindersEnabled: true,
    reminderDaysBefore: 3,
    reminderTime: '09:00',
    status: 'active',
  };

  describe('getNotificationId', () => {
    it('generates deterministic notification key loanId_period_reminderType', () => {
      const id = getNotificationId('loan_101', 'loan_101_2026-09', '3d');
      expect(id).toBe('loan_101_2026-09_3d');
    });
  });

  describe('Permissions', () => {
    it('queries and requests permissions via Notifee adapter', async () => {
      const checkRes = await loanReminderService.checkPermissions();
      expect(checkRes.authorized).toBe(true);
      expect(notifee.getNotificationSettings).toHaveBeenCalled();

      const reqRes = await loanReminderService.requestPermissions();
      expect(reqRes.authorized).toBe(true);
      expect(notifee.requestPermission).toHaveBeenCalled();
    });
  });

  describe('scheduleLoanReminder', () => {
    it('schedules a Notifee trigger notification when loan is active and unpaid', async () => {
      const notif = await loanReminderService.scheduleLoanReminder({
        loan: sampleLoan,
        payments: [],
        globalEnabled: true,
      });

      expect(notif).not.toBeNull();
      expect(notif.id).toContain('loan_101');
      expect(notif.loanId).toBe('loan_101');
      expect(notifee.createTriggerNotification).toHaveBeenCalled();

      // Verify privacy-focused notification payload
      expect(notif.data).toEqual({
        type: 'loan_payment_reminder',
        loanId: 'loan_101',
        periodKey: expect.any(String),
      });
      expect(notif.body).not.toContain('outstanding');
      expect(notif.body).not.toContain('lender');
    });

    it('enforces idempotency and does not duplicate scheduled notifications', async () => {
      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments: [] });
      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments: [] });
      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments: [] });

      expect(loanReminderService.getScheduledNotifications()).toHaveLength(1);
    });

    it('returns null and cancels notification when globalEnabled is false', async () => {
      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments: [] });
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(1);

      const notif = await loanReminderService.scheduleLoanReminder({
        loan: sampleLoan,
        payments: [],
        globalEnabled: false,
      });

      expect(notif).toBeNull();
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(0);
    });

    it('returns null and cancels notification when loan.remindersEnabled is false', async () => {
      const disabledLoan = { ...sampleLoan, remindersEnabled: false };
      const notif = await loanReminderService.scheduleLoanReminder({ loan: disabledLoan, payments: [] });
      expect(notif).toBeNull();
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(0);
    });

    it('returns null and cancels notification when loan is archived or paid off', async () => {
      const archivedLoan = { ...sampleLoan, status: 'archived' };
      expect(await loanReminderService.scheduleLoanReminder({ loan: archivedLoan, payments: [] })).toBeNull();

      const paidOffLoan = { ...sampleLoan, currentOutstandingPrincipal: 0 };
      expect(await loanReminderService.scheduleLoanReminder({ loan: paidOffLoan, payments: [] })).toBeNull();
    });

    it('cancels notification for period when EMI payment is recorded for that period', async () => {
      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments: [] });
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(1);

      const paidPeriod = loanReminderService.getScheduledNotifications()[0].periodKey;
      const periodParts = String(paidPeriod || '').split('_');
      const periodDate = periodParts[periodParts.length - 1];
      const paymentDate = `${periodDate}-05`;

      const payments = [
        {
          id: 'pay_1',
          loanId: sampleLoan.id,
          paymentType: PAYMENT_TYPES.REGULAR_EMI,
          paymentDate,
        },
      ];

      await loanReminderService.scheduleLoanReminder({ loan: sampleLoan, payments });
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe('reconcileLoanReminders', () => {
    it('reconciles multiple loans and removes stale notifications for deleted loans', async () => {
      const loanA = { ...sampleLoan, id: 'loan_A' };
      const loanB = { ...sampleLoan, id: 'loan_B' };

      await loanReminderService.reconcileLoanReminders({ loans: [loanA, loanB], payments: [] });
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(2);

      // Now loanB is deleted
      await loanReminderService.reconcileLoanReminders({ loans: [loanA], payments: [] });
      expect(loanReminderService.getScheduledNotifications()).toHaveLength(1);
      expect(loanReminderService.getScheduledNotifications()[0].loanId).toBe('loan_A');
    });
  });
});

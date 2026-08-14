import {
  getPaymentStatus,
  getReminderDate,
} from '../utils/loanReminderUtils';
import {
  scheduleTriggerNotification,
  cancelTriggerNotification,
  cancelAllTriggerNotifications,
  getScheduledTriggerNotificationIds,
  checkNotificationPermissions,
  requestNotificationPermissions,
  sendTestNotification,
} from './notifeeNotificationAdapter';

/**
 * In-memory local notification schedule registry (used as a fast lookup / testing cache).
 * Source of truth for OS-level triggers is managed via notifeeNotificationAdapter.
 */
const scheduledRegistry = new Map();

/**
 * Generates a deterministic notification ID.
 * @param {string} loanId
 * @param {string} periodKey
 * @param {string} reminderType
 * @returns {string} e.g. 'loan123_2026-09_3d'
 */
export const getNotificationId = (loanId, periodKey, reminderType = '3d') => {
  const safeId = String(loanId || 'loan');
  const periodParts = String(periodKey || '').split('_');
  const safePeriod = periodParts[periodParts.length - 1] || periodKey;
  return `${safeId}_${safePeriod}_${reminderType}`;
};

/**
 * Pure local loan reminder service abstractions backed by Notifee.
 * React components interact exclusively with this service without directly calling Notifee APIs.
 */
export const loanReminderService = {
  /**
   * Checks current OS notification authorization status.
   */
  async checkPermissions() {
    return await checkNotificationPermissions();
  },

  /**
   * Requests OS notification authorization from user when explicitly requested.
   */
  async requestPermissions() {
    return await requestNotificationPermissions();
  },

  /**
   * Schedules a local device notification for a specific loan if enabled and unpaid.
   * @param {Object} params
   * @param {Object} params.loan Loan profile object
   * @param {Array} [params.payments=[]] List of payment records
   * @param {boolean} [params.globalEnabled=true] Global setting preference
   * @returns {Promise<Object|null>} Scheduled notification metadata object, or null
   */
  async scheduleLoanReminder({ loan, payments = [], globalEnabled = true }) {
    if (!loan || !loan.id) return null;

    // 1. Global / Per-loan disable check
    if (globalEnabled === false || loan.remindersEnabled === false) {
      await this.cancelLoanReminder(loan.id);
      return null;
    }

    // 2. Archived or Paid-off check
    if (loan.status === 'archived' || Number(loan.currentOutstandingPrincipal) <= 0) {
      await this.cancelLoanReminder(loan.id);
      return null;
    }

    // 3. Payment Status & Period Check
    const statusObj = getPaymentStatus(loan, payments);
    const { status, nextDueDate, periodKey, isCurrentPeriodPaid } = statusObj;

    if (status === 'paid' || status === 'paid_off' || isCurrentPeriodPaid) {
      await this.cancelLoanReminder(loan.id);
      return null;
    }

    const reminderDaysBefore = Number(loan.reminderDaysBefore) || 3;
    const notifId = getNotificationId(loan.id, periodKey, `${reminderDaysBefore}d`);

    // 4. Calculate Scheduled Reminder Date
    const reminderDate = getReminderDate(
      nextDueDate,
      reminderDaysBefore,
      loan.reminderTime || '09:00'
    );

    // 5. Past Date Check: Never schedule for a time that has already passed
    if (reminderDate.getTime() <= Date.now()) {
      return null;
    }

    const emiFormatted = Number(loan.emiAmount || 0).toLocaleString('en-IN');
    const loanName = loan.name || 'Loan';

    const title = reminderDaysBefore === 1
      ? `${loanName} EMI due tomorrow`
      : `${loanName} EMI due in ${reminderDaysBefore} days`;
    const body = `₹${emiFormatted} is scheduled for ${nextDueDate}.`;

    const payloadData = {
      type: 'loan_payment_reminder',
      loanId: loan.id,
      periodKey,
    };

    const scheduledId = await scheduleTriggerNotification({
      id: notifId,
      title,
      body,
      date: reminderDate,
      data: payloadData,
    });

    const notificationRecord = {
      id: notifId,
      loanId: loan.id,
      periodKey,
      dueDate: nextDueDate,
      scheduledDate: reminderDate.toISOString(),
      title,
      body,
      data: payloadData,
    };

    if (scheduledId) {
      scheduledRegistry.set(notifId, notificationRecord);
      return notificationRecord;
    }

    return null;
  },

  /**
   * Cancels scheduled reminders for a specific loan or specific payment period.
   * @param {string} loanId
   * @param {string} [periodKey]
   * @param {string} [reminderType]
   */
  async cancelLoanReminder(loanId, periodKey, reminderType) {
    if (!loanId) return;

    if (periodKey && reminderType) {
      const notifId = getNotificationId(loanId, periodKey, reminderType);
      await cancelTriggerNotification(notifId);
      scheduledRegistry.delete(notifId);
      return;
    }

    // Cancel all matching in-memory and OS triggers for loan
    const targetPrefix = periodKey ? `${loanId}_${periodKey}` : `${loanId}_`;
    for (const key of scheduledRegistry.keys()) {
      if (key.startsWith(targetPrefix)) {
        await cancelTriggerNotification(key);
        scheduledRegistry.delete(key);
      }
    }

    // Check OS triggers directly
    const activeOsIds = await getScheduledTriggerNotificationIds();
    for (const osId of activeOsIds) {
      if (osId.startsWith(targetPrefix)) {
        await cancelTriggerNotification(osId);
      }
    }
  },

  /**
   * Alias for cancelLoanReminder for plural/singular call compatibility.
   */
  async cancelLoanReminders(loanId, periodKey, reminderType) {
    return await this.cancelLoanReminder(loanId, periodKey, reminderType);
  },

  /**
   * Cancels all scheduled loan reminders globally.
   */
  async cancelAllLoanReminders() {
    await cancelAllTriggerNotifications();
    scheduledRegistry.clear();
  },

  /**
   * Reconciles all active loans against OS trigger notifications.
   * @param {Object} params
   * @param {Array} params.loans
   * @param {Array} params.payments
   * @param {boolean} params.globalEnabled
   */
  async reconcileLoanReminders({ loans = [], payments = [], globalEnabled = true }) {
    if (!Array.isArray(loans)) return [];

    if (!globalEnabled) {
      await this.cancelAllLoanReminders();
      return [];
    }

    const activeLoanMap = new Map(loans.map((l) => [l.id, l]));

    // Clean up OS triggers for deleted, archived, or paid-off loans
    const osTriggerIds = await getScheduledTriggerNotificationIds();
    for (const osId of osTriggerIds) {
      const parts = osId.split('_');
      const loanId = parts[0] === 'loan' && parts.length >= 3 ? `${parts[0]}_${parts[1]}` : parts[0];
      const loan = activeLoanMap.get(loanId);

      if (!loan || loan.status === 'archived' || Number(loan.currentOutstandingPrincipal) <= 0 || !loan.remindersEnabled) {
        await cancelTriggerNotification(osId);
        scheduledRegistry.delete(osId);
      }
    }

    const results = [];
    for (const loan of loans) {
      const res = await this.scheduleLoanReminder({ loan, payments, globalEnabled });
      if (res) results.push(res);
    }

    return results;
  },

  /**
   * Returns current active scheduled notification registry entries.
   * @returns {Array} List of scheduled notification objects
   */
  getScheduledNotifications() {
    return Array.from(scheduledRegistry.values());
  },

  /**
   * Triggers a test local notification after specified delay (default 5 seconds).
   * @param {number} [delaySeconds=5]
   */
  async sendTestNotification(delaySeconds = 5) {
    return await sendTestNotification(delaySeconds);
  },

  /**
   * Clears all in-memory scheduled notifications (for testing/reset).
   */
  clearRegistry() {
    scheduledRegistry.clear();
  },
};

export default loanReminderService;

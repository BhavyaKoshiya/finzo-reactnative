import notifee, { AndroidImportance, TriggerType, AuthorizationStatus } from '@notifee/react-native';

export const NOTIFICATION_CHANNEL_ID = 'loan-payment-reminders';
export const NOTIFICATION_CHANNEL_NAME = 'Loan Payment Reminders';

/**
 * Ensures the Android Notification Channel is registered safely & idempotently.
 */
export const ensureNotificationChannel = async () => {
  try {
    if (typeof notifee?.createChannel === 'function') {
      await notifee.createChannel({
        id: NOTIFICATION_CHANNEL_ID,
        name: NOTIFICATION_CHANNEL_NAME,
        importance: AndroidImportance.DEFAULT,
      });
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to create notification channel:', error);
  }
};

/**
 * Checks current OS notification authorization status.
 */
export const checkNotificationPermissions = async () => {
  try {
    if (typeof notifee?.getNotificationSettings === 'function') {
      const settings = await notifee.getNotificationSettings();
      const authorized =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
      const isDenied = settings.authorizationStatus === AuthorizationStatus.DENIED;
      return { authorized, isDenied, status: settings.authorizationStatus };
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to check permissions:', error);
  }
  return { authorized: false, isDenied: false, status: AuthorizationStatus.NOT_DETERMINED };
};

/**
 * Requests user permission for OS local notifications.
 */
export const requestNotificationPermissions = async () => {
  try {
    if (typeof notifee?.requestPermission === 'function') {
      const settings = await notifee.requestPermission();
      const authorized =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
      const isDenied = settings.authorizationStatus === AuthorizationStatus.DENIED;
      return { authorized, isDenied, status: settings.authorizationStatus };
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to request permissions:', error);
  }
  return { authorized: false, isDenied: true, status: AuthorizationStatus.DENIED };
};

/**
 * Schedules a timestamp-based trigger notification via Notifee.
 *
 * @param {Object} params
 * @param {string} params.id Deterministic notification ID (e.g. loan123_2026-09_3d)
 * @param {string} params.title Title string
 * @param {string} params.body Body string
 * @param {Date|number} params.date Date object or timestamp for when notification should fire
 * @param {Object} params.data Data payload ({ type: 'loan_payment_reminder', loanId, periodKey })
 */
export const scheduleTriggerNotification = async ({ id, title, body, date, data = {} }) => {
  try {
    const targetTime = date instanceof Date ? date.getTime() : Number(date);

    // Never schedule a notification in the past
    if (!targetTime || isNaN(targetTime) || targetTime <= Date.now()) {
      return null;
    }

    await ensureNotificationChannel();

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: targetTime,
    };

    const notificationPayload = {
      id,
      title,
      body,
      android: {
        channelId: NOTIFICATION_CHANNEL_ID,
        pressAction: {
          id: 'default',
        },
      },
      data,
    };

    if (typeof notifee?.createTriggerNotification === 'function') {
      await notifee.createTriggerNotification(notificationPayload, trigger);
      return id;
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to schedule trigger notification:', error);
  }
  return null;
};

/**
 * Cancels a specific scheduled trigger notification by ID.
 *
 * @param {string} id Deterministic notification ID
 */
export const cancelTriggerNotification = async (id) => {
  try {
    if (id && typeof notifee?.cancelNotification === 'function') {
      await notifee.cancelNotification(id);
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to cancel notification:', error);
  }
};

/**
 * Cancels all scheduled trigger notifications for Finzo.
 */
export const cancelAllTriggerNotifications = async () => {
  try {
    if (typeof notifee?.cancelAllNotifications === 'function') {
      await notifee.cancelAllNotifications();
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to cancel all notifications:', error);
  }
};

/**
 * Returns list of currently scheduled trigger notification IDs from Notifee.
 */
export const getScheduledTriggerNotificationIds = async () => {
  try {
    if (typeof notifee?.getTriggerNotificationIds === 'function') {
      return await notifee.getTriggerNotificationIds();
    }
  } catch (error) {
    console.warn('[notifeeAdapter] Failed to fetch trigger IDs:', error);
  }
  return [];
};

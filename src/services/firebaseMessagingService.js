import {
  getMessaging,
  requestPermission as fcmRequestPermission,
  getToken as fcmGetToken,
  onTokenRefresh as fcmOnTokenRefresh,
  onMessage as fcmOnMessage,
  onNotificationOpenedApp as fcmOnNotificationOpenedApp,
  getInitialNotification as fcmGetInitialNotification,
} from '@react-native-firebase/messaging';
import { FORBIDDEN_FINANCIAL_KEYS } from './firebaseAnalyticsService';
import logger from './logger';

/**
 * Sanitizes FCM notification data to ensure no financial parameters or credentials
 * are processed through push payloads.
 *
 * @param {Object} rawData
 * @returns {Object} sanitizedData
 */
export const sanitizeNotificationData = (rawData = {}) => {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return {};
  }

  const sanitized = {};

  Object.entries(rawData).forEach(([key, value]) => {
    if (!key || typeof key !== 'string') return;

    const normalizedKey = key.trim().toLowerCase();

    // Block any forbidden financial keys
    if (FORBIDDEN_FINANCIAL_KEYS.has(normalizedKey)) {
      if (__DEV__) {
        logger.warn(`FirebaseMessagingService: Blocked financial key '${key}' in notification payload`);
      }
      return;
    }

    if (typeof value === 'string') {
      sanitized[key] = value.substring(0, 150);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

class FirebaseMessagingService {
  constructor() {
    this.messagingInstance = null;
    this.cachedToken = null;
  }

  /**
   * Resolves the Firebase Messaging instance using the modular v26 API.
   */
  _getMessaging() {
    if (!this.messagingInstance) {
      try {
        this.messagingInstance = getMessaging();
      } catch (err) {
        if (__DEV__) {
          logger.warn('FirebaseMessagingService: Failed to resolve instance', { error: err?.message });
        }
      }
    }
    return this.messagingInstance;
  }

  /**
   * Requests user authorization for push notifications.
   * On iOS / Android 13+ (API 33+), presents the system permission dialog.
   *
   * @returns {Promise<{ authorized: boolean, status: number }>}
   */
  async requestPermission() {
    try {
      const instance = this._getMessaging();
      if (!instance) {
        return { authorized: false, status: -1 };
      }

      const authStatus = await fcmRequestPermission(instance);
      const authorized =
        authStatus === 1 || // AUTHORIZED
        authStatus === 2;   // PROVISIONAL

      return { authorized, status: authStatus };
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.requestPermission failed', { error: err?.message });
      }
      return { authorized: false, status: -1, error: err?.message };
    }
  }

  /**
   * Retrieves the FCM registration token for this device.
   * STRICT PRIVACY INVARIANT: Token is NEVER saved in Redux financial state or loan objects.
   *
   * @returns {Promise<string|null>}
   */
  async getToken() {
    if (this.cachedToken) return this.cachedToken;

    try {
      const instance = this._getMessaging();
      if (instance) {
        const token = await fcmGetToken(instance);
        this.cachedToken = token;
        return token;
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.getToken failed', { error: err?.message });
      }
    }

    return null;
  }

  /**
   * Registers a listener for FCM token refresh events.
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  onTokenRefresh(callback) {
    try {
      const instance = this._getMessaging();
      if (instance) {
        return fcmOnTokenRefresh(instance, (token) => {
          this.cachedToken = token;
          if (typeof callback === 'function') {
            callback(token);
          }
        });
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.onTokenRefresh registration failed', { error: err?.message });
      }
    }
    return () => {};
  }

  /**
   * Subscribes to foreground push notifications.
   * Automatically sanitizes incoming payload data.
   *
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  onMessage(callback) {
    try {
      const instance = this._getMessaging();
      if (instance) {
        return fcmOnMessage(instance, (remoteMessage) => {
          if (!remoteMessage) return;

          const sanitizedMessage = {
            ...remoteMessage,
            data: sanitizeNotificationData(remoteMessage.data),
          };

          if (typeof callback === 'function') {
            callback(sanitizedMessage);
          }
        });
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.onMessage listener failed', { error: err?.message });
      }
    }
    return () => {};
  }

  /**
   * Sets the background message handler for headless tasks.
   * Note: In modular v26, setBackgroundMessageHandler is a top-level function, not instance-based.
   * It's handled via the compat layer or directly by the native module.
   * @param {Function} handler
   */
  setBackgroundMessageHandler(handler) {
    try {
      // setBackgroundMessageHandler is a top-level registration in v26
      const messagingModule = require('@react-native-firebase/messaging');
      if (typeof messagingModule.setBackgroundMessageHandler === 'function') {
        messagingModule.setBackgroundMessageHandler(async (remoteMessage) => {
          const sanitizedMessage = {
            ...remoteMessage,
            data: sanitizeNotificationData(remoteMessage.data),
          };
          if (typeof handler === 'function') {
            await handler(sanitizedMessage);
          }
        });
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.setBackgroundMessageHandler failed', { error: err?.message });
      }
    }
  }

  /**
   * Registers a listener for notification tap while app is in background.
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  onNotificationOpenedApp(callback) {
    try {
      const instance = this._getMessaging();
      if (instance) {
        return fcmOnNotificationOpenedApp(instance, (remoteMessage) => {
          const sanitizedMessage = {
            ...remoteMessage,
            data: sanitizeNotificationData(remoteMessage?.data),
          };
          if (typeof callback === 'function') {
            callback(sanitizedMessage);
          }
        });
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.onNotificationOpenedApp failed', { error: err?.message });
      }
    }
    return () => {};
  }

  /**
   * Checks if application was opened from a quit state via a notification tap.
   * @returns {Promise<Object|null>}
   */
  async getInitialNotification() {
    try {
      const instance = this._getMessaging();
      if (instance) {
        const remoteMessage = await fcmGetInitialNotification(instance);
        if (remoteMessage) {
          return {
            ...remoteMessage,
            data: sanitizeNotificationData(remoteMessage.data),
          };
        }
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseMessagingService.getInitialNotification failed', { error: err?.message });
      }
    }
    return null;
  }
}

export const firebaseMessagingService = new FirebaseMessagingService();
export default firebaseMessagingService;

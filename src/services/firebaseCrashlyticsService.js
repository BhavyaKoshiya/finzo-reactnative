import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError as crashlyticsRecordError,
  setAttribute as crashlyticsSetAttribute,
  setAttributes as crashlyticsSetAttributes,
} from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { FORBIDDEN_FINANCIAL_KEYS } from './firebaseAnalyticsService';
import logger from './logger';

/**
 * Whitelist of allowed non-sensitive attribute keys for Crashlytics.
 */
export const ALLOWED_CRASHLYTICS_ATTRIBUTES = new Set([
  'app_version',
  'platform',
  'build_number',
  'environment',
  'feature_area',
  'screen_name',
  'error_code',
  'provider_type',
]);

/**
 * Sanitizes attributes to prevent financial details, credentials, or deep state objects
 * from reaching Crashlytics reports.
 *
 * @param {Object} rawAttributes
 * @returns {Object} sanitizedAttributes
 */
export const sanitizeCrashlyticsAttributes = (rawAttributes = {}) => {
  if (!rawAttributes || typeof rawAttributes !== 'object' || Array.isArray(rawAttributes)) {
    return {};
  }

  const sanitized = {};

  Object.entries(rawAttributes).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();

    if (FORBIDDEN_FINANCIAL_KEYS.has(lowerKey)) {
      return;
    }

    if (typeof value === 'string') {
      sanitized[key] = value.substring(0, 100);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      sanitized[key] = String(value);
    }
  });

  return sanitized;
};

class FirebaseCrashlyticsService {
  constructor() {
    this.crashlyticsInstance = null;
    this.isInitialized = false;
  }

  /**
   * Resolves the Firebase Crashlytics instance using the modular v26 API.
   */
  _getCrashlytics() {
    if (!this.crashlyticsInstance) {
      try {
        this.crashlyticsInstance = getCrashlytics();
      } catch (err) {
        if (__DEV__) {
          logger.warn('FirebaseCrashlyticsService: Failed to resolve instance', { error: err?.message });
        }
      }
    }
    return this.crashlyticsInstance;
  }

  /**
   * Initializes safe non-sensitive baseline attributes.
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      const instance = this._getCrashlytics();
      if (instance) {
        const appVersion = DeviceInfo?.getVersion?.() || '1.0.0';
        const buildNumber = DeviceInfo?.getBuildNumber?.() || '1';

        await crashlyticsSetAttributes(instance, {
          app_version: appVersion,
          build_number: buildNumber,
          platform: Platform.OS,
          environment: __DEV__ ? 'development' : 'production',
        });
      }
      this.isInitialized = true;
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseCrashlyticsService: Initialization failed', { error: err?.message });
      }
    }
  }

  /**
   * Records a non-fatal JavaScript error with safe, sanitized context.
   *
   * @param {Error|string} error
   * @param {Object} [context={}]
   * @returns {Promise<boolean>}
   */
  async recordError(error, context = {}) {
    const errorObj = error instanceof Error ? error : new Error(String(error || 'Unknown Error'));
    const sanitizedCtx = sanitizeCrashlyticsAttributes(context);

    if (__DEV__) {
      logger.error(`[Crashlytics Non-Fatal] ${errorObj.message}`, {
        stack: errorObj.stack,
        context: sanitizedCtx,
      });
      return true;
    }

    try {
      const instance = this._getCrashlytics();
      if (instance) {
        if (Object.keys(sanitizedCtx).length > 0) {
          await crashlyticsSetAttributes(instance, sanitizedCtx);
        }
        await crashlyticsRecordError(instance, errorObj);
        return true;
      }
    } catch (err) {
      logger.warn('FirebaseCrashlyticsService.recordError failed', { error: err?.message });
    }

    return false;
  }

  /**
   * Logs a diagnostic breadcrumb message (safe string only).
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  async log(message) {
    if (!message || typeof message !== 'string') return false;

    const safeMessage = message.substring(0, 200);

    try {
      const instance = this._getCrashlytics();
      if (instance) {
        await crashlyticsLog(instance, safeMessage);
        return true;
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseCrashlyticsService.log failed', { error: err?.message });
      }
    }

    return false;
  }

  /**
   * Sets a single safe attribute.
   * @param {string} key
   * @param {string} value
   */
  async setAttribute(key, value) {
    if (!key || typeof key !== 'string') return false;

    const sanitized = sanitizeCrashlyticsAttributes({ [key]: value });
    const sanitizedVal = sanitized[key];

    if (sanitizedVal === undefined) return false;

    try {
      const instance = this._getCrashlytics();
      if (instance) {
        await crashlyticsSetAttribute(instance, key, sanitizedVal);
        return true;
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn(`FirebaseCrashlyticsService.setAttribute failed for '${key}'`, { error: err?.message });
      }
    }

    return false;
  }
}

export const firebaseCrashlyticsService = new FirebaseCrashlyticsService();
export default firebaseCrashlyticsService;

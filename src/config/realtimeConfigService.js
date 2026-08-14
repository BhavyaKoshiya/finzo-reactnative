import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_REALTIME_CONFIG } from './realtimeConfigDefaults';
import { validateRealtimeConfig } from './realtimeConfigSchema';
import logger from '../services/logger';

const LAST_KNOWN_CONFIG_KEY = '@finzo_last_known_config';

class RealtimeConfigService {
  constructor() {
    this.activeConfig = DEFAULT_REALTIME_CONFIG;
    this.listeners = new Set();
    this.rtdbUnsubscribe = null;
    this.isInitialized = false;
  }

  /**
   * Initializes the configuration service:
   * 1. Loads persisted Last-Known-Good configuration from AsyncStorage.
   * 2. Attaches single RTDB listener at root '/'.
   */
  async initialize() {
    if (this.isInitialized) return this.activeConfig;

    // 1. Load Last Known Good config
    const lastKnown = await this.getLastKnownGoodConfig();
    if (lastKnown) {
      this.activeConfig = lastKnown;
      this.notifyListeners();
    }

    // 2. Attach RTDB Listener if available
    await this._attachRtdbListener();

    return this.activeConfig;
  }

  /**
   * Attempts to attach the RTDB listener with one retry.
   * Firebase auto-initializes natively via google-services.json, but there can be
   * a brief race condition on cold start where the native app isn't registered yet.
   */
  async _attachRtdbListener(retryCount = 0) {
    try {
      const { getDatabase, ref } = require('@react-native-firebase/database');
      const db = getDatabase(undefined, 'https://finzo-app-calc-default-rtdb.firebaseio.com');
      const rootRef = ref(db, '/');

      const onValueChange = rootRef.on('value', (snapshot) => {
        const val = snapshot.val();
        logger.info('RTDB snapshot received from Firebase', { hasData: Boolean(val) });
        if (val) {
          this.processRemotePayload(val);
        } else {
          logger.info('RTDB returned empty payload. Retaining active config.');
        }
      }, (error) => {
        logger.warn('RTDB subscription error from Firebase:', { message: error.message });
      });

      this.rtdbUnsubscribe = () => rootRef.off('value', onValueChange);
      this.isInitialized = true;
      logger.info('RealtimeConfigService initialized successfully');
    } catch (err) {
      if (retryCount < 2) {
        // Wait briefly for native Firebase to finish auto-initialization
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this._attachRtdbListener(retryCount + 1);
      }
      logger.warn('RTDB module not available or failed to initialize:', { error: err.message });
      this.isInitialized = true;
    }

    return this.activeConfig;
  }

  /**
   * Processes, validates, and activates a remote configuration payload.
   * Tolerates both root-level payloads and nested '/config' payloads,
   * automatically merging partial trees with defaults.
   */
  processRemotePayload(rawPayload) {
    if (!rawPayload || typeof rawPayload !== 'object') return false;

    // Support both root payload with .config and direct payload
    const payload = (rawPayload.config && typeof rawPayload.config === 'object')
      ? rawPayload.config
      : rawPayload;

    // Merge with defaults to gracefully support partial configurations (e.g. only appUpdate)
    const merged = {
      ...DEFAULT_REALTIME_CONFIG,
      ...payload,
      version: payload.version || DEFAULT_REALTIME_CONFIG.version,
      appUpdate: payload.appUpdate
        ? { ...DEFAULT_REALTIME_CONFIG.appUpdate, ...payload.appUpdate }
        : DEFAULT_REALTIME_CONFIG.appUpdate,
      ads: payload.ads
        ? { ...DEFAULT_REALTIME_CONFIG.ads, ...payload.ads }
        : DEFAULT_REALTIME_CONFIG.ads,
      rewards: payload.rewards
        ? { ...DEFAULT_REALTIME_CONFIG.rewards, ...payload.rewards }
        : DEFAULT_REALTIME_CONFIG.rewards,
    };

    const { valid, errors } = validateRealtimeConfig(merged);
    if (!valid) {
      logger.warn('Remote RTDB config validation failed. Retaining active config.', { errors });
      return false;
    }

    this.activeConfig = merged;
    this.saveLastKnownGoodConfig(merged);
    this.notifyListeners();
    logger.info('Remote RTDB configuration activated successfully', { version: merged.version });
    return true;
  }

  /**
   * Returns current active configuration object.
   */
  getConfig() {
    return this.activeConfig || DEFAULT_REALTIME_CONFIG;
  }

  /**
   * Loads persisted last-known-good configuration from AsyncStorage.
   */
  async getLastKnownGoodConfig() {
    try {
      const raw = await AsyncStorage.getItem(LAST_KNOWN_CONFIG_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const { valid } = validateRealtimeConfig(parsed);
      return valid ? parsed : null;
    } catch (err) {
      logger.warn('Failed to load last known config:', { error: err.message });
      return null;
    }
  }

  /**
   * Persists validated configuration as last-known-good.
   */
  async saveLastKnownGoodConfig(config) {
    try {
      await AsyncStorage.setItem(LAST_KNOWN_CONFIG_KEY, JSON.stringify(config));
    } catch (err) {
      logger.warn('Failed to save last known config:', { error: err.message });
    }
  }

  /**
   * Subscribe listener callback to configuration updates.
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      // Immediately notify listener of current active state
      listener(this.activeConfig);
    }
    return () => this.unsubscribe(listener);
  }

  /**
   * Unsubscribe listener callback.
   */
  unsubscribe(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.activeConfig);
      } catch (err) {
        logger.warn('Listener notification error:', { error: err.message });
      }
    });
  }

  /**
   * Clean up active listeners.
   */
  destroy() {
    if (this.rtdbUnsubscribe) {
      this.rtdbUnsubscribe();
      this.rtdbUnsubscribe = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export const realtimeConfigService = new RealtimeConfigService();
export default realtimeConfigService;

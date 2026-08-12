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
   * 2. Attaches single RTDB listener at '/config'.
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
    try {
      // Dynamic import to allow test mocks / graceful fallback when offline
      const databaseModule = require('@react-native-firebase/database');
      const database = databaseModule.default || databaseModule;

      const ref = database().ref('/config');
      const onValueChange = ref.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          this.processRemotePayload(val);
        } else {
          logger.info('RTDB /config returned empty payload. Retaining active config.');
        }
      }, (error) => {
        logger.warn('RTDB subscription error:', { message: error.message });
      });

      this.rtdbUnsubscribe = () => ref.off('value', onValueChange);
      this.isInitialized = true;
      logger.info('RealtimeConfigService initialized successfully');
    } catch (err) {
      logger.info('RTDB module not available or initialized. Using active fallback config.', { error: err.message });
      this.isInitialized = true;
    }

    return this.activeConfig;
  }

  /**
   * Processes, validates, and activates a remote configuration payload.
   */
  processRemotePayload(payload) {
    const { valid, errors } = validateRealtimeConfig(payload);
    if (!valid) {
      logger.warn('Remote RTDB config validation failed. Retaining active config.', { errors });
      return false;
    }

    this.activeConfig = payload;
    this.saveLastKnownGoodConfig(payload);
    this.notifyListeners();
    logger.info('Remote RTDB configuration activated successfully', { version: payload.version });
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

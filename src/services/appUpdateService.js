import DeviceInfo from 'react-native-device-info';
import { realtimeConfigService } from '../config/realtimeConfigService';
import logger from './logger';
import log from './logger';

/**
 * App Update Types
 */
export const UPDATE_TYPES = {
  NONE: 'NONE',
  OPTIONAL: 'OPTIONAL',
  MANDATORY: 'MANDATORY',
};

/**
 * Default fallback installed version (matches package.json).
 */
export const DEFAULT_APP_VERSION = '1.0.0';

/**
 * Parses a version string into [major, minor, patch] integers.
 * Tolerates standard 3-digit semver ("1.0.2"), 2-digit versions ("1.0"), numbers, and pre-release tags.
 *
 * @param {string|number} versionStr
 * @returns {[number, number, number]|null}
 */
export const parseSemver = versionStr => {
  if (versionStr === null || versionStr === undefined) return null;
  const cleanStr = String(versionStr).trim();
  if (!cleanStr) return null;

  // Strip pre-release suffixes (e.g., "1.0.0-beta.1" -> "1.0.0")
  const baseVersion = cleanStr.split('-')[0].split('+')[0];
  const parts = baseVersion.split('.');

  if (parts.length === 0) return null;

  const major = parseInt(parts[0], 10);
  const minor = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  const patch = parts.length > 2 ? parseInt(parts[2], 10) : 0;

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    return null;
  }

  if (major < 0 || minor < 0 || patch < 0) {
    return null;
  }

  return [major, minor, patch];
};

/**
 * Semantic version comparator.
 * @param {string|number} v1
 * @param {string|number} v2
 * @returns {number} -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2. Defaults to 0 if either is invalid.
 */
export const compareSemver = (v1, v2) => {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  // Fail-safe: invalid versions evaluate as equal to prevent lockout
  if (!p1 || !p2) {
    return 0;
  }

  for (let i = 0; i < 3; i++) {
    if (p1[i] < p2[i]) return -1;
    if (p1[i] > p2[i]) return 1;
  }

  return 0;
};

class AppUpdateService {
  constructor() {
    this.optionalDismissedInSession = false;
  }

  /**
   * Retrieves the installed application version from native device info, falling back safely.
   * @returns {string}
   */
  getInstalledVersion() {
    try {
      if (DeviceInfo && typeof DeviceInfo.getVersion === 'function') {
        const v = DeviceInfo.getVersion();
        if (v && typeof v === 'string' && v.trim()) {
          return v.trim();
        }
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('AppUpdateService.getInstalledVersion fallback used', {
          error: err?.message,
        });
      }
    }
    return DEFAULT_APP_VERSION;
  }

  /**
   * Evaluates the update state given an optional config override and current version override.
   *
   * @param {Object} [options]
   * @param {Object} [options.config] Remote configuration object (defaults to realtimeConfigService.getConfig()?.appUpdate)
   * @param {string} [options.installedVersion] Current app version override (defaults to getInstalledVersion())
   * @returns {{
   *   updateType: string,
   *   isMandatory: boolean,
   *   isOptional: boolean,
   *   installedVersion: string,
   *   minimumVersion: string,
   *   latestVersion: string,
   *   title: string,
   *   message: string,
   * }}
   */
  checkAppUpdate(options = {}) {
    const rawConfig =
      options.config !== undefined && options.config !== null
        ? options.config
        : (realtimeConfigService.getConfig()?.appUpdate || null);
    const installedVersion =
      options.installedVersion || this.getInstalledVersion();

    const defaultResult = {
      updateType: UPDATE_TYPES.NONE,
      isMandatory: false,
      isOptional: false,
      installedVersion,
      minimumVersion: installedVersion,
      latestVersion: installedVersion,
      title: 'Update Finzo',
      message: 'A newer version of Finzo is available.',
    };

    if (!rawConfig || typeof rawConfig !== 'object') {
      return defaultResult;
    }

    // If remotely disabled, do not prompt for update
    if (rawConfig.enabled === false) {
      return defaultResult;
    }

    const minVersionStr = rawConfig.minimumVersion
      ? String(rawConfig.minimumVersion).trim()
      : '';
    const latestVersionStr = rawConfig.latestVersion
      ? String(rawConfig.latestVersion).trim()
      : '';

    const parsedInstalled = parseSemver(installedVersion);
    const parsedMin = parseSemver(minVersionStr);
    const parsedLatest = parseSemver(latestVersionStr);

    // Fail-safe: if installed version or remote versions are invalid, default to NONE
    if (!parsedInstalled) {
      return defaultResult;
    }

    const title =
      typeof rawConfig.updateTitle === 'string' && rawConfig.updateTitle.trim()
        ? rawConfig.updateTitle.trim()
        : 'Update Finzo';

    const defaultMandatoryMessage =
      'A newer version of Finzo is required to continue using the app.';
    const defaultOptionalMessage =
      'A newer version of Finzo is available with improvements.';

    const customMessage =
      typeof rawConfig.updateMessage === 'string' &&
      rawConfig.updateMessage.trim()
        ? rawConfig.updateMessage.trim()
        : '';

    // 1. MANDATORY UPDATE CHECK (installed < minimumVersion)
    if (parsedMin && compareSemver(installedVersion, minVersionStr) < 0) {
      return {
        updateType: UPDATE_TYPES.MANDATORY,
        isMandatory: true,
        isOptional: false,
        installedVersion,
        minimumVersion: minVersionStr,
        latestVersion: latestVersionStr || minVersionStr,
        title,
        message: customMessage || defaultMandatoryMessage,
      };
    }

    // 2. OPTIONAL UPDATE CHECK (installed < latestVersion and installed >= minimumVersion)
    if (parsedLatest && compareSemver(installedVersion, latestVersionStr) < 0) {
      return {
        updateType: UPDATE_TYPES.OPTIONAL,
        isMandatory: false,
        isOptional: true,
        installedVersion,
        minimumVersion: minVersionStr || installedVersion,
        latestVersion: latestVersionStr,
        title,
        message: customMessage || defaultOptionalMessage,
      };
    }

    return defaultResult;
  }

  /**
   * Dismisses the optional update dialog for the current app session.
   */
  dismissOptionalUpdate() {
    this.optionalDismissedInSession = true;
  }

  /**
   * Checks whether the optional update was already dismissed in this session.
   * @returns {boolean}
   */
  isOptionalUpdateDismissed() {
    return this.optionalDismissedInSession;
  }

  /**
   * Resets session state (primarily for tests/QA).
   */
  resetSession() {
    this.optionalDismissedInSession = false;
  }
}

export const appUpdateService = new AppUpdateService();
export default appUpdateService;

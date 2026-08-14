import { Platform, Linking } from 'react-native';
import logger from './logger';

/**
 * Finzo Store Redirection Service.
 * Centralizes platform store destinations for the application.
 *
 * PRIVACY & SECURITY GUARANTEE:
 * Store URLs belong to the application and are NEVER fetched from or stored in Firebase.
 */

// Android Package Name (Frozen in AGENTS.md)
export const ANDROID_PACKAGE_NAME = 'com.finzo.financecalculator';

// Android Store URIs
export const ANDROID_PLAY_STORE_INTENT = `market://details?id=${ANDROID_PACKAGE_NAME}`;
export const ANDROID_PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

/**
 * iOS App Store ID Placeholder:
 * IMPORTANT: The official iOS Apple App ID will be assigned upon creating the App Store listing in App Store Connect.
 * Replace 'FINZO_IOS_APP_ID_PLACEHOLDER' with the real numeric ID (e.g., '6740000000') prior to iOS release.
 */
export const IOS_APP_STORE_ID = 'FINZO_IOS_APP_ID_PLACEHOLDER';
export const IOS_APP_STORE_INTENT = `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}`;
export const IOS_APP_STORE_WEB_URL = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;

class AppStoreService {
  /**
   * Returns the platform-appropriate primary store URL or deep link.
   * @returns {string}
   */
  getStoreUrl() {
    if (Platform.OS === 'android') {
      return ANDROID_PLAY_STORE_WEB_URL;
    }
    return IOS_APP_STORE_WEB_URL;
  }

  /**
   * Attempts to open the official store page.
   * Tries native market/itms-apps intent first, falling back to HTTPS web URL if native store app fails.
   * @returns {Promise<{ success: boolean, url?: string, error?: string }>}
   */
  async openStore() {
    if (Platform.OS === 'android') {
      try {
        const canOpenMarket = await Linking.canOpenURL(ANDROID_PLAY_STORE_INTENT);
        if (canOpenMarket) {
          await Linking.openURL(ANDROID_PLAY_STORE_INTENT);
          return { success: true, url: ANDROID_PLAY_STORE_INTENT };
        }
      } catch (intentErr) {
        logger.warn('AppStoreService: Play Store intent failed, falling back to HTTPS web URL', {
          error: intentErr?.message,
        });
      }

      try {
        await Linking.openURL(ANDROID_PLAY_STORE_WEB_URL);
        return { success: true, url: ANDROID_PLAY_STORE_WEB_URL };
      } catch (webErr) {
        logger.error('AppStoreService: Failed to open Play Store HTTPS URL', { error: webErr?.message });
        return { success: false, error: webErr?.message || 'Could not open Play Store' };
      }
    }

    if (Platform.OS === 'ios') {
      try {
        const canOpenAppStore = await Linking.canOpenURL(IOS_APP_STORE_INTENT);
        if (canOpenAppStore) {
          await Linking.openURL(IOS_APP_STORE_INTENT);
          return { success: true, url: IOS_APP_STORE_INTENT };
        }
      } catch (intentErr) {
        logger.warn('AppStoreService: App Store intent failed, falling back to HTTPS web URL', {
          error: intentErr?.message,
        });
      }

      try {
        await Linking.openURL(IOS_APP_STORE_WEB_URL);
        return { success: true, url: IOS_APP_STORE_WEB_URL };
      } catch (webErr) {
        logger.error('AppStoreService: Failed to open App Store HTTPS URL', { error: webErr?.message });
        return { success: false, error: webErr?.message || 'Could not open App Store' };
      }
    }

    return { success: false, error: `Unsupported platform: ${Platform.OS}` };
  }
}

export const appStoreService = new AppStoreService();
export default appStoreService;

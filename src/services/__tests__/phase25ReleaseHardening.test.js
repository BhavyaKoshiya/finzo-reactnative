/* eslint-env jest */
import appUpdateService, {
  parseSemver,
  compareSemver,
  UPDATE_TYPES,
} from '../appUpdateService';
import appStoreService, {
  ANDROID_PACKAGE_NAME,
  ANDROID_PLAY_STORE_INTENT,
  ANDROID_PLAY_STORE_WEB_URL,
  IOS_APP_STORE_ID,
  IOS_APP_STORE_INTENT,
  IOS_APP_STORE_WEB_URL,
} from '../appStoreService';
import { ROUTES } from '../../navigation/routes';
import { Linking, Platform } from 'react-native';

describe('Phase 25 — Release Hardening, Force Update & Privacy Policy QA', () => {
  beforeEach(() => {
    appUpdateService.resetSession();
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. SEMANTIC VERSION COMPARISON & PARSING
  // ============================================================
  describe('1. Semantic Version Parser & Comparator', () => {
    test('parseSemver parses 3-digit, 2-digit, 1-digit, and pre-release versions', () => {
      expect(parseSemver('1.0.0')).toEqual([1, 0, 0]);
      expect(parseSemver('1.2.3')).toEqual([1, 2, 3]);
      expect(parseSemver('1.2')).toEqual([1, 2, 0]);
      expect(parseSemver('2')).toEqual([2, 0, 0]);
      expect(parseSemver('1.0.0-beta.1')).toEqual([1, 0, 0]);
      expect(parseSemver('1.0.0+build.42')).toEqual([1, 0, 0]);
    });

    test('parseSemver returns null on null, undefined, empty, or malformed strings', () => {
      expect(parseSemver(null)).toBeNull();
      expect(parseSemver(undefined)).toBeNull();
      expect(parseSemver('')).toBeNull();
      expect(parseSemver('   ')).toBeNull();
      expect(parseSemver('invalid-version')).toBeNull();
      expect(parseSemver('-1.0.0')).toBeNull();
    });

    test('compareSemver accurately evaluates greater, lesser, and equal versions', () => {
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
      expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
      expect(compareSemver('1.1.0', '1.0.9')).toBe(1);
      expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
      expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
    });

    test('compareSemver fails safe (returns 0) when either version string is invalid', () => {
      expect(compareSemver('1.0.0', null)).toBe(0);
      expect(compareSemver(null, '1.0.0')).toBe(0);
      expect(compareSemver('invalid', '1.0.0')).toBe(0);
      expect(compareSemver('1.0.0', 'broken')).toBe(0);
    });
  });

  // ============================================================
  // 2. REMOTE CONFIG FORCE & OPTIONAL UPDATE EVALUATION
  // ============================================================
  describe('2. Remote Config Update Evaluation Logic', () => {
    test('Returns NONE when installed version is equal to or greater than latestVersion', () => {
      const config = {
        enabled: true,
        minimumVersion: '1.0.0',
        latestVersion: '1.0.0',
      };

      const result = appUpdateService.checkAppUpdate({
        config,
        installedVersion: '1.0.0',
      });

      expect(result.updateType).toBe(UPDATE_TYPES.NONE);
      expect(result.isMandatory).toBe(false);
      expect(result.isOptional).toBe(false);
    });

    test('Returns MANDATORY when installed version is strictly less than minimumVersion', () => {
      const config = {
        enabled: true,
        minimumVersion: '1.1.0',
        latestVersion: '1.2.0',
        updateTitle: 'Critical Update Required',
        updateMessage: 'Security and financial calculation patch required.',
      };

      const result = appUpdateService.checkAppUpdate({
        config,
        installedVersion: '1.0.0',
      });

      expect(result.updateType).toBe(UPDATE_TYPES.MANDATORY);
      expect(result.isMandatory).toBe(true);
      expect(result.isOptional).toBe(false);
      expect(result.minimumVersion).toBe('1.1.0');
      expect(result.title).toBe('Critical Update Required');
      expect(result.message).toBe('Security and financial calculation patch required.');
    });

    test('Returns OPTIONAL when installed version is >= minimumVersion but < latestVersion', () => {
      const config = {
        enabled: true,
        minimumVersion: '1.0.0',
        latestVersion: '1.1.0',
      };

      const result = appUpdateService.checkAppUpdate({
        config,
        installedVersion: '1.0.0',
      });

      expect(result.updateType).toBe(UPDATE_TYPES.OPTIONAL);
      expect(result.isMandatory).toBe(false);
      expect(result.isOptional).toBe(true);
      expect(result.latestVersion).toBe('1.1.0');
    });

    test('Returns NONE when remote update feature is disabled (enabled: false)', () => {
      const config = {
        enabled: false,
        minimumVersion: '2.0.0',
        latestVersion: '2.0.0',
      };

      const result = appUpdateService.checkAppUpdate({
        config,
        installedVersion: '1.0.0',
      });

      expect(result.updateType).toBe(UPDATE_TYPES.NONE);
      expect(result.isMandatory).toBe(false);
    });

    test('Fails safe on null, undefined, or malformed remote configuration', () => {
      expect(appUpdateService.checkAppUpdate({ config: null, installedVersion: '1.0.0' }).updateType).toBe(
        UPDATE_TYPES.NONE
      );
      expect(
        appUpdateService.checkAppUpdate({
          config: { enabled: true, minimumVersion: 'malformed' },
          installedVersion: '1.0.0',
        }).updateType
      ).toBe(UPDATE_TYPES.NONE);
    });

    test('Session dismissal flag is tracked for optional updates', () => {
      expect(appUpdateService.isOptionalUpdateDismissed()).toBe(false);
      appUpdateService.dismissOptionalUpdate();
      expect(appUpdateService.isOptionalUpdateDismissed()).toBe(true);
      appUpdateService.resetSession();
      expect(appUpdateService.isOptionalUpdateDismissed()).toBe(false);
    });
  });

  // ============================================================
  // 3. STORE REDIRECTION & URL SAFETY
  // ============================================================
  describe('3. Centralized Store Redirection', () => {
    test('Android package and store intents match official configuration', () => {
      expect(ANDROID_PACKAGE_NAME).toBe('com.finzo.financecalculator');
      expect(ANDROID_PLAY_STORE_INTENT).toBe('market://details?id=com.finzo.financecalculator');
      expect(ANDROID_PLAY_STORE_WEB_URL).toBe(
        'https://play.google.com/store/apps/details?id=com.finzo.financecalculator'
      );
    });

    test('iOS store constants include documented release placeholder', () => {
      expect(IOS_APP_STORE_ID).toBe('FINZO_IOS_APP_ID_PLACEHOLDER');
      expect(IOS_APP_STORE_INTENT).toContain('FINZO_IOS_APP_ID_PLACEHOLDER');
      expect(IOS_APP_STORE_WEB_URL).toContain('FINZO_IOS_APP_ID_PLACEHOLDER');
    });

    test('appStoreService.openStore uses native intent when supported', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue(undefined);

      const result = await appStoreService.openStore();
      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalled();
    });

    test('appStoreService.openStore falls back to HTTPS web URL when native intent fails', async () => {
      Linking.canOpenURL.mockRejectedValue(new Error('Intent unsupported'));
      Linking.openURL.mockResolvedValue(undefined);

      const result = await appStoreService.openStore();
      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalled();
    });
  });

  // ============================================================
  // 4. PRIVACY POLICY ROUTE & ARCHITECTURE
  // ============================================================
  describe('4. Privacy Policy Route & Disclosures', () => {
    test('ROUTES.PRIVACY_POLICY is properly defined', () => {
      expect(ROUTES.PRIVACY_POLICY).toBe('PrivacyPolicy');
    });

    test('PUBLIC_PRIVACY_POLICY_URL matches authoritative hosted public policy', () => {
      const { PUBLIC_PRIVACY_POLICY_URL } = require('../../features/privacy/screens/PrivacyPolicyScreen');
      expect(PUBLIC_PRIVACY_POLICY_URL).toBe(
        'https://binarykode-technologies.web.app/pages/finzo-privacy-policy.html'
      );
    });
  });
});

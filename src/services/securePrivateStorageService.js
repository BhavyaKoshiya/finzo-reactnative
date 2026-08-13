import * as Keychain from 'react-native-keychain';

/**
 * Service encapsulating platform secure credential storage (Keystore on Android, Keychain on iOS).
 * Highly sensitive credentials MUST NEVER be stored in Redux, AsyncStorage, or plain files.
 */
class SecurePrivateStorageService {
  /**
   * Stores a sensitive secret value in platform secure storage.
   * @param {string} key Loan-scoped key e.g. "finzo.loan.loan123.sensitive.password"
   * @param {string} value Sensitive secret string
   * @returns {Promise<boolean>}
   */
  async setSecureValue(key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid key is required for secure storage.');
    }
    if (!value || typeof value !== 'string') {
      throw new Error('Valid string value is required for secure storage.');
    }

    try {
      const result = await Keychain.setGenericPassword('finzo_secure_user', value, {
        service: key,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      if (!result) {
        throw new Error('Keychain setGenericPassword returned false.');
      }
      return true;
    } catch (error) {
      // NEVER fall back to AsyncStorage or Redux!
      throw new Error("Sensitive information couldn't be securely stored on this device.");
    }
  }

  /**
   * Retrieves a sensitive secret value from platform secure storage.
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async getSecureValue(key) {
    if (!key || typeof key !== 'string') return null;

    try {
      const credentials = await Keychain.getGenericPassword({ service: key });
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      throw new Error("Sensitive information couldn't be securely retrieved from this device.");
    }
  }

  /**
   * Deletes a sensitive secret value from platform secure storage.
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async deleteSecureValue(key) {
    if (!key || typeof key !== 'string') return false;

    try {
      await Keychain.resetGenericPassword({ service: key });
      return true;
    } catch (error) {
      throw new Error("Sensitive information couldn't be deleted from secure storage.");
    }
  }

  /**
   * Checks if a sensitive secret value exists in secure storage.
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async hasSecureValue(key) {
    if (!key || typeof key !== 'string') return false;

    try {
      const credentials = await Keychain.getGenericPassword({ service: key });
      return Boolean(credentials && credentials.password);
    } catch (error) {
      return false;
    }
  }
}

export const securePrivateStorageService = new SecurePrivateStorageService();
export default securePrivateStorageService;

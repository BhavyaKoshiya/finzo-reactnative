import securePrivateStorageService from '../securePrivateStorageService';
import * as Keychain from 'react-native-keychain';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' },
}));

describe('securePrivateStorageService Platform Secure Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores a sensitive secret using Keychain.setGenericPassword', async () => {
    Keychain.setGenericPassword.mockResolvedValue(true);

    const res = await securePrivateStorageService.setSecureValue(
      'finzo.loan.loan1.sensitive.pwd',
      'my_secret_pass'
    );
    expect(res).toBe(true);
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'finzo_secure_user',
      'my_secret_pass',
      expect.objectContaining({ service: 'finzo.loan.loan1.sensitive.pwd' })
    );
  });

  it('retrieves a sensitive secret using Keychain.getGenericPassword', async () => {
    Keychain.getGenericPassword.mockResolvedValue({ password: 'my_secret_pass' });

    const val = await securePrivateStorageService.getSecureValue(
      'finzo.loan.loan1.sensitive.pwd'
    );
    expect(val).toBe('my_secret_pass');
  });

  it('deletes a sensitive secret using Keychain.resetGenericPassword', async () => {
    Keychain.resetGenericPassword.mockResolvedValue(true);

    const res = await securePrivateStorageService.deleteSecureValue(
      'finzo.loan.loan1.sensitive.pwd'
    );
    expect(res).toBe(true);
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'finzo.loan.loan1.sensitive.pwd',
    });
  });

  it('throws an error and NEVER falls back when Keychain fails', async () => {
    Keychain.setGenericPassword.mockRejectedValue(new Error('Keychain Error'));

    await expect(
      securePrivateStorageService.setSecureValue('key1', 'val1')
    ).rejects.toThrow("Sensitive information couldn't be securely stored on this device.");
  });
});

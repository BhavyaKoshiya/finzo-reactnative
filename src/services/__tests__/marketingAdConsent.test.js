/**
 * MarketingAdProvider must not request ads until Google's consent check allows it,
 * and must expose the "Privacy choices" entry point required in consent regions.
 */

import { MarketingAdProvider } from '../ads/marketingAdProvider';
import { marketingPlugin, ConfigFetcher, bannerAdManager } from 'react-native-marketing-plugin';

jest.mock('react-native-marketing-plugin', () => ({
  marketingPlugin: {
    adModel: null,
    canRequestAds: false,
    isPrivacyOptionsRequired: false,
    initialize: jest.fn().mockResolvedValue(false),
    showPrivacyOptionsForm: jest.fn().mockResolvedValue(true),
  },
  ConfigFetcher: { fetchData: jest.fn() },
  BannerAdView: jest.fn().mockReturnValue(null),
  NativeAdComponent: jest.fn().mockReturnValue(null),
  bannerAdManager: { adModel: null, preloadAll: jest.fn() },
  nativeAdManager: { adModel: null, preloadAll: jest.fn() },
  interstitialAdManager: { adModel: null, preloadAds: jest.fn().mockResolvedValue(undefined) },
  rewardedAdManager: { adModel: null, preloadAds: jest.fn().mockResolvedValue(undefined) },
  MyAds: { nativeNormal: 'nativeNormal' },
}));

const remoteAdModel = { isad: true, isbannerenable: true, adTime: 3 };

describe('MarketingAdProvider consent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    marketingPlugin.adModel = null;
    marketingPlugin.canRequestAds = false;
    marketingPlugin.isPrivacyOptionsRequired = false;
    bannerAdManager.adModel = null;
  });

  test('asks the plugin to gather consent', async () => {
    await new MarketingAdProvider().initialize();

    expect(marketingPlugin.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ requestConsent: true, enableAppOpenOnResume: false })
    );
  });

  test('does not load or preload ads without consent, and retries later', async () => {
    const provider = new MarketingAdProvider();

    await expect(provider.initialize()).resolves.toBe(false);
    expect(ConfigFetcher.fetchData).not.toHaveBeenCalled();
    expect(bannerAdManager.preloadAll).not.toHaveBeenCalled();
    expect(provider.isBannerAvailable()).toBe(false);

    marketingPlugin.canRequestAds = true;
    marketingPlugin.initialize.mockImplementationOnce(async () => {
      marketingPlugin.adModel = remoteAdModel;
      return true;
    });

    await expect(provider.initialize()).resolves.toBe(true);
    expect(marketingPlugin.initialize).toHaveBeenCalledTimes(2);
    expect(provider.isBannerAvailable()).toBe(true);
  });

  test('exposes the privacy options entry point', async () => {
    const provider = new MarketingAdProvider();
    expect(provider.isPrivacyOptionsRequired()).toBe(false);

    marketingPlugin.isPrivacyOptionsRequired = true;
    expect(provider.isPrivacyOptionsRequired()).toBe(true);

    await expect(provider.showPrivacyOptionsForm()).resolves.toBe(true);
    expect(marketingPlugin.showPrivacyOptionsForm).toHaveBeenCalled();
  });
});

/**
 * MarketingAdProvider recovery when the remote ad configuration fails to load.
 * The plugin fetches its config only once, so the provider must re-fetch it.
 */

import { MarketingAdProvider } from '../ads/marketingAdProvider';
import {
  marketingPlugin,
  ConfigFetcher,
  bannerAdManager,
  interstitialAdManager,
  rewardedAdManager,
} from 'react-native-marketing-plugin';

jest.mock('react-native-marketing-plugin', () => ({
  marketingPlugin: {
    adModel: null,
    initialize: jest.fn().mockResolvedValue(false),
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

const remoteAdModel = {
  isad: true,
  isbannerenable: true,
  isinterstitialenable: true,
  isrewarded: true,
  adTime: 3,
};

describe('MarketingAdProvider config recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    marketingPlugin.adModel = null;
    bannerAdManager.adModel = null;
    interstitialAdManager.adModel = null;
    rewardedAdManager.adModel = null;
  });

  test('re-fetches the config when the plugin started without one', async () => {
    ConfigFetcher.fetchData.mockResolvedValueOnce(remoteAdModel);
    const provider = new MarketingAdProvider();

    await expect(provider.initialize()).resolves.toBe(true);

    expect(ConfigFetcher.fetchData).toHaveBeenCalledWith(
      'https://binarykode-technologies.web.app/adconfigs',
      'com.loanpilot.app'
    );
    expect(marketingPlugin.adModel).toBe(remoteAdModel);
    expect(bannerAdManager.adModel).toBe(remoteAdModel);
    expect(interstitialAdManager.adModel).toBe(remoteAdModel);
    expect(bannerAdManager.preloadAll).toHaveBeenCalled();
    expect(interstitialAdManager.preloadAds).toHaveBeenCalled();
    expect(rewardedAdManager.preloadAds).toHaveBeenCalled();
    expect(provider.isBannerAvailable()).toBe(true);
  });

  test('reports failure and allows a later retry when the config is still unavailable', async () => {
    ConfigFetcher.fetchData.mockResolvedValueOnce(null).mockResolvedValueOnce(remoteAdModel);
    const provider = new MarketingAdProvider();

    await expect(provider.initialize()).resolves.toBe(false);
    expect(provider.isInitialized).toBe(false);

    await expect(provider.initialize()).resolves.toBe(true);
    expect(ConfigFetcher.fetchData).toHaveBeenCalledTimes(2);
    expect(provider.isInitialized).toBe(true);
  });

  test('rewarded ads are unavailable until a config is loaded', () => {
    const provider = new MarketingAdProvider();
    expect(provider.isRewardedAvailable()).toBe(false);

    marketingPlugin.adModel = remoteAdModel;
    expect(provider.isRewardedAvailable()).toBe(true);
  });
});

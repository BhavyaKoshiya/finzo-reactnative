import React from 'react';
import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';
import { normalizeAdTime } from './interstitialFrequencyService';
import {
  marketingPlugin,
  BannerAdView,
  NativeAdComponent,
  bannerAdManager,
  nativeAdManager,
  interstitialAdManager,
  rewardedAdManager,
  MyAds,
} from 'react-native-marketing-plugin';
import logger from '../logger';

/**
 * Marketing Plugin Ad Provider Adapter.
 * Adapts react-native-marketing-plugin and react-native-google-mobile-ads
 * strictly behind Finzo's BaseAdProvider interface.
 *
 * Guarantees:
 * 1. Financial data firewall: zero financial data is passed to the SDK.
 * 2. enableAppOpenOnResume is strictly false.
 * 3. Finzo adDecisionEngine remains authoritative for frequency, cooldowns, and screening.
 * 4. Preloaded ads NEVER automatically display; they remain cached for user-triggered / authorized requests.
 */
export class MarketingAdProvider extends BaseAdProvider {
  constructor(config = {}) {
    super();
    this.config = {
      baseUrl: config.baseUrl || 'https://binarykode-technologies.web.app/adconfigs',
      bundleId: config.bundleId || 'com.finzo.financecalculator',
      enableAppOpenOnResume: false, // Strictly disabled in Finzo to protect financial workflows
      ...config,
    };
    this.isInitialized = false;
    this.initPromise = null;
  }

  getType() {
    return AD_PROVIDER_TYPES.APPROVED_REAL;
  }

  isConfigured() {
    return Boolean(marketingPlugin.adModel);
  }

  getAdTime() {
    return normalizeAdTime(marketingPlugin.adModel?.adTime);
  }

  initialize() {
    if (this.isInitialized) return Promise.resolve(true);
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (__DEV__) {
          logger.info('MarketingAdProvider: Startup initialization started');
        }
        const isAdEnabled = await marketingPlugin.initialize({
          baseUrl: this.config.baseUrl,
          bundleId: this.config.bundleId,
          enableAppOpenOnResume: false,
        });
        this.isInitialized = true;
        if (__DEV__) {
          logger.info('MarketingAdProvider initialized successfully, preloading active', { isAdEnabled });
        }
        return true;
      } catch (error) {
        if (__DEV__) {
          logger.warn('MarketingAdProvider initialization failed:', { error: error.message });
        }
        this.isInitialized = false;
        return false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Preloads supported ad inventory (Banner, Native, Interstitial, Rewarded).
   * Ensures preloaded ads are ready in memory for future authorized display.
   * NEVER triggers automatic display.
   * @returns {Promise<{ success: boolean }>}
   */
  async preloadAds() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return { success: false };
    }

    try {
      if (__DEV__) {
        logger.info('MarketingAdProvider: Preload requested for Banner, Native, Interstitial, Rewarded');
      }

      // 1. Banner descriptors preload
      if (typeof bannerAdManager?.preloadAll === 'function') {
        bannerAdManager.preloadAll();
      }

      // 2. Native descriptors preload
      if (typeof nativeAdManager?.preloadAll === 'function') {
        const nativeVariant = MyAds?.nativeNormal || 'nativeNormal';
        nativeAdManager.preloadAll(nativeVariant);
      }

      // 3. Interstitial preload (AdMob / Ad Manager)
      if (typeof interstitialAdManager?.preloadAds === 'function') {
        await interstitialAdManager.preloadAds();
      }

      // 4. Rewarded preload (if enabled in adModel)
      if (marketingPlugin.adModel?.isrewarded && typeof rewardedAdManager?.preloadAds === 'function') {
        await rewardedAdManager.preloadAds();
      }

      if (__DEV__) {
        logger.info('MarketingAdProvider: Preload completed / active in background');
      }
      return { success: true };
    } catch (err) {
      if (__DEV__) {
        logger.warn('MarketingAdProvider.preloadAds error:', { error: err?.message });
      }
      return { success: false, reason: err?.message };
    }
  }

  // 1. BANNER AD API
  isBannerAvailable(_placementId) {
    return Boolean(marketingPlugin.adModel?.isad && marketingPlugin.adModel?.isbannerenable);
  }

  async loadBanner(_placementId) {
    return { success: this.isBannerAvailable(_placementId), provider: this.getType() };
  }

  renderBanner({ placementId, style, onAdLoaded, onAdFailed } = {}) {
    return (
      <BannerAdView
        key={placementId}
        onAdLoaded={onAdLoaded}
        onAdFailed={onAdFailed}
      />
    );
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

  // 2. NATIVE AD API
  isNativeAvailable(_placementId) {
    return Boolean(marketingPlugin.adModel?.isad && marketingPlugin.adModel?.isnativeenable);
  }

  async loadNative(_placementId) {
    return { success: this.isNativeAvailable(_placementId), provider: this.getType() };
  }

  renderNative({ placementId, size = 'medium', style, onAdLoaded, onAdFailed } = {}) {
    return (
      <NativeAdComponent
        key={placementId}
        size={size}
        onAdLoaded={onAdLoaded}
        onAdFailed={onAdFailed}
      />
    );
  }

  async destroyNative(_placementId) {
    return { success: true };
  }

  // 3. INTERSTITIAL AD API
  isInterstitialAvailable(_placementId) {
    return Boolean(marketingPlugin.adModel?.isad && marketingPlugin.adModel?.isinterstitialenable);
  }

  async loadInterstitial(_placementId) {
    return { success: this.isInterstitialAvailable(_placementId), provider: this.getType() };
  }

  async showInterstitial(placementId, _options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Finzo adDecisionEngine has already authorized this show.
      // Pass a derived counter matching the plugin's adTime to ensure internal trigger conditions pass.
      const targetCounter = marketingPlugin.adModel?.adTime ?? 2;
      await marketingPlugin.showInterstitial(targetCounter);

      return {
        status: AD_STATES.COMPLETED,
        provider: this.getType(),
        placementId,
      };
    } catch (error) {
      logger.warn('MarketingAdProvider showInterstitial error:', { error: error.message });
      return {
        status: AD_STATES.FAILED,
        provider: this.getType(),
        reason: error.message || 'Interstitial show failed',
      };
    }
  }

  async destroyInterstitial(_placementId) {
    return { success: true };
  }

  // 4. REWARDED AD API
  isRewardedAvailable(_placementId) {
    if (!marketingPlugin.adModel) {
      return true;
    }
    return Boolean(marketingPlugin.adModel?.isad && marketingPlugin.adModel?.isrewarded);
  }

  async loadRewarded(_placementId) {
    return { success: this.isRewardedAvailable(_placementId), provider: this.getType() };
  }

  async showRewarded(placementId, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      let completed = false;

      // Wrap and await the callback from marketingPlugin
      const earned = await marketingPlugin.showRewardAd(() => {
        completed = true;
        if (typeof options.onRewarded === 'function') {
          options.onRewarded();
        }
      });

      const isSuccess = Boolean(earned || completed);

      return {
        status: isSuccess ? AD_STATES.COMPLETED : AD_STATES.DISMISSED,
        provider: this.getType(),
        placementId,
        rewardGranted: isSuccess,
      };
    } catch (error) {
      logger.warn('MarketingAdProvider showRewarded error:', { error: error.message });
      return {
        status: AD_STATES.FAILED,
        provider: this.getType(),
        reason: error.message || 'Rewarded show failed',
      };
    }
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default MarketingAdProvider;

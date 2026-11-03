import React from 'react';
import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';
import { normalizeAdTime } from './interstitialFrequencyService';
import { AdEventType } from 'react-native-google-mobile-ads';
import {
  marketingPlugin,
  BannerAdView,
  NativeAdComponent,
  bannerAdManager,
  nativeAdManager,
  interstitialAdManager,
  rewardedAdManager,
  MyAds,
  ConfigFetcher,
} from 'react-native-marketing-plugin';
import logger from '../logger';

/**
 * Marketing Plugin Ad Provider Adapter.
 * Adapts react-native-marketing-plugin and react-native-google-mobile-ads
 * strictly behind LoanPilot's BaseAdProvider interface.
 *
 * Guarantees:
 * 1. Financial data firewall: zero financial data is passed to the SDK.
 * 2. enableAppOpenOnResume is strictly false.
 * 2a. Consent is gathered with Google's UMP before any ad is requested (GDPR / US states).
 * 3. LoanPilot adDecisionEngine remains authoritative for frequency, cooldowns, and screening.
 * 4. Preloaded ads NEVER automatically display; they remain cached for user-triggered / authorized requests.
 */
export class MarketingAdProvider extends BaseAdProvider {
  constructor(config = {}) {
    super();
    this.config = {
      baseUrl: config.baseUrl || 'https://binarykode-technologies.web.app/adconfigs',
      bundleId: config.bundleId || 'com.loanpilot.app',
      enableAppOpenOnResume: false, // Strictly disabled in LoanPilot to protect financial workflows
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
          requestConsent: true,
        });

        // No ad may be requested until consent allows it; initialize() is retried later.
        if (!this._canRequestAds()) {
          throw new Error('Ad consent not obtained');
        }

        // The plugin fetches its config only once; if that fetch failed it would stay
        // without ads for the whole session, so fetch it again ourselves.
        if (!marketingPlugin.adModel) {
          const loaded = await this._loadMissingAdModel();
          if (!loaded) {
            throw new Error('Ad configuration unavailable');
          }
          this.isInitialized = true;
          await this.preloadAds();
        }

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
        this.initPromise = null; // allow a later retry (e.g. after reconnecting)
        return false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Plugin versions without consent support do not expose `canRequestAds`.
   * @returns {boolean}
   */
  _canRequestAds() {
    return marketingPlugin.canRequestAds !== false;
  }

  isPrivacyOptionsRequired() {
    return Boolean(marketingPlugin.isPrivacyOptionsRequired);
  }

  async showPrivacyOptionsForm() {
    if (typeof marketingPlugin.showPrivacyOptionsForm !== 'function') return false;
    return marketingPlugin.showPrivacyOptionsForm();
  }

  /**
   * Re-fetches the remote ad configuration and hands it to the plugin's ad managers.
   * @returns {Promise<boolean>} Whether a configuration was loaded
   */
  async _loadMissingAdModel() {
    const adModel = await ConfigFetcher.fetchData(this.config.baseUrl, this.config.bundleId);
    if (!adModel) return false;

    marketingPlugin.adModel = adModel;
    bannerAdManager.adModel = adModel;
    nativeAdManager.adModel = adModel;
    interstitialAdManager.adModel = adModel;
    rewardedAdManager.adModel = adModel;
    return true;
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
    const model = marketingPlugin.adModel;
    logger.info('[FAD] called', {
      placementId,
      isInitialized: this.isInitialized,
      hasAdModel: !!model,
      isad: model?.isad,
      isbannerenable: model?.isbannerenable,
      isadManger: model?.isadManger,
      bannerAd: model?.bannerAd,
      bannerAdPriority: JSON.stringify(model?.bannerAdPriority),
      isBannerAvailable: this.isBannerAvailable(placementId),
    });
    if (!this.isBannerAvailable(placementId)) {
      logger.warn('[FAD] BLOCKED: isBannerAvailable=false');
      return null;
    }
    logger.info('[FAD] Rendering <BannerAdView>');
    return (
      <BannerAdView
        key={placementId}
        onAdLoaded={() => {
          logger.info('[FAD] ✅ BannerAdView onAdLoaded');
          onAdLoaded?.();
        }}
        onAdFailed={(err) => {
          logger.warn('[FAD] ❌ BannerAdView onAdFailed', { error: err });
          onAdFailed?.(err);
        }}
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
    if (!this.isNativeAvailable(placementId)) {
      return null;
    }
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

      // Capture the currently loaded ad instance BEFORE calling show.
      // We need this reference to listen for the CLOSED event, since the plugin's
      // showInterstitial() resolves immediately after ad.show() — it doesn't wait
      // for the user to dismiss the ad. Without this, navigation.goBack() fires
      // while the ad is still visible, causing it to disappear.
      const activeAd = interstitialAdManager._admobInterstitial || interstitialAdManager._adManagerInterstitial;

      // LoanPilot adDecisionEngine has already authorized this show.
      // Pass a derived counter matching the plugin's adTime to ensure internal trigger conditions pass.
      const targetCounter = marketingPlugin.adModel?.adTime ?? 2;

      if (activeAd && activeAd.loaded) {
        // Wrap in a Promise that only resolves when the ad is CLOSED (user dismissed it)
        await new Promise((resolve) => {
          const AD_DISMISS_TIMEOUT_MS = 120000; // 2 minute safety timeout

          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            clearTimeout(safetyTimer);
            resolve();
          };

          // Listen for the CLOSED event (user dismissed the ad)
          const unsubscribeClosed = activeAd.addAdEventListener(
            AdEventType.CLOSED,
            () => {
              unsubscribeClosed();
              if (unsubscribeError) unsubscribeError();
              settle();
            }
          );

          // Listen for ERROR event (ad failed to render)
          const unsubscribeError = activeAd.addAdEventListener(
            AdEventType.ERROR,
            () => {
              if (unsubscribeClosed) unsubscribeClosed();
              unsubscribeError();
              settle();
            }
          );

          // Safety timeout: don't block navigation forever if events don't fire
          const safetyTimer = setTimeout(() => {
            try { unsubscribeClosed(); } catch (_e) { /* ignore */ }
            try { unsubscribeError(); } catch (_e) { /* ignore */ }
            settle();
          }, AD_DISMISS_TIMEOUT_MS);

          // Show the ad directly with immersiveModeEnabled to fix rendering on
          // Xiaomi/MIUI devices. MIUI's custom window manager can cause the ad's
          // SurfaceView content to be invisible unless immersive mode forces the
          // ad Activity to take full window control.
          activeAd.show({ immersiveModeEnabled: true }).catch(() => {
            settle();
          });
        });
      } else {
        // No preloaded ad available — call show anyway (may be a Qureka/FB fallback)
        await marketingPlugin.showInterstitial(targetCounter);
      }

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
    // Without a config the plugin refuses to show rewarded ads, so report unavailable
    // and let callers keep polling until the config arrives.
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

import { AdProviderFactory } from './adProviderFactory';
import { AD_PLACEMENTS } from './ads/adPlacementConstants';
import { AD_STATES } from './ads/adProviderTypes';
import adDecisionEngine from './ads/adDecisionEngine';
import { adFrequencyService } from './ads/adFrequencyService';
import { rewardedAdSessionManager } from './ads/rewardedAdSessionManager';
import { adMetricsService } from './ads/adMetricsService';
import { realtimeConfigService } from '../config/realtimeConfigService';
import logger from './logger';

/**
 * Main Application Advertising Service Boundary.
 * The ONLY service imported by UI components / screens for ad actions.
 * Wraps the active provider selected by AdProviderFactory.
 * Enforces single central ad decision pipeline, financial workflow protection, frequency caps, and reward security.
 */
class AdService {
  constructor() {
    this.providerOverride = null;
    this.devSimulationEnabled = true;
    this.modalHandler = null;
    this.interstitialModalHandler = null;
    this.cachedProvider = null;
  }

  setProviderOverride(provider) {
    this.providerOverride = provider;
    this.cachedProvider = null;
  }

  setDevSimulationEnabled(enabled) {
    this.devSimulationEnabled = Boolean(enabled);
    this.cachedProvider = null;
  }

  setModalHandler(handler) {
    this.modalHandler = handler;
    const provider = this.getProvider();
    if (provider && typeof provider.setModalHandler === 'function') {
      provider.setModalHandler(handler);
    }
  }

  setInterstitialModalHandler(handler) {
    this.interstitialModalHandler = handler;
    const provider = this.getProvider();
    if (provider && typeof provider.setInterstitialModalHandler === 'function') {
      provider.setInterstitialModalHandler(handler);
    }
  }

  getProvider() {
    if (this.providerOverride) {
      return this.providerOverride;
    }

    if (!this.cachedProvider) {
      this.cachedProvider = AdProviderFactory.getProvider({
        devSimulationEnabled: this.devSimulationEnabled,
      });
    }

    const provider = this.cachedProvider;

    if (this.modalHandler && typeof provider.setModalHandler === 'function') {
      provider.setModalHandler(this.modalHandler);
    }

    if (this.interstitialModalHandler && typeof provider.setInterstitialModalHandler === 'function') {
      provider.setInterstitialModalHandler(this.interstitialModalHandler);
    }

    return provider;
  }

  isConfigured() {
    return this.getProvider().isConfigured();
  }

  /**
   * Central decision method. UI screens can query authorization before attempting ad load/display.
   */
  canShowAd(params = {}) {
    const config = params.config || realtimeConfigService.getConfig();
    const frequencyStatus = {
      ...adFrequencyService.canShowInterstitial({
        cooldownMinutes: config?.ads?.interstitial?.cooldownMinutes,
        maxPerSession: config?.ads?.interstitial?.maxPerSession,
      }),
      canShow: adFrequencyService.canShowInterstitial({
        cooldownMinutes: config?.ads?.interstitial?.cooldownMinutes,
        maxPerSession: config?.ads?.interstitial?.maxPerSession,
      }).allowed,
    };

    const decision = adDecisionEngine.canShowAd({
      ...params,
      config,
      frequencyStatus,
      provider: this.getProvider(),
    });

    if (__DEV__) {
      adMetricsService.logDecision({
        placementId: params.placementId,
        adType: params.adType,
        screen: params.screen,
        allowed: decision.allowed,
        reason: decision.reason,
      });
      if (!decision.allowed) {
        adMetricsService.recordSuppression(decision.reason);
      }
    }

    return decision;
  }

  // 1. BANNER AD API
  isBannerAvailable(placementId = AD_PLACEMENTS.HOME_BANNER, options = {}) {
    const decision = this.canShowAd({
      adType: 'banner',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) return false;
    return this.getProvider().isBannerAvailable(placementId);
  }

  async loadBanner(placementId = AD_PLACEMENTS.HOME_BANNER, options = {}) {
    const decision = this.canShowAd({
      adType: 'banner',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) {
      return { success: false, reason: decision.reason };
    }

    try {
      return await this.getProvider().loadBanner(placementId);
    } catch (err) {
      logger.warn('AdService.loadBanner failed', { placementId, error: err?.message });
      return { success: false, reason: err?.message || 'Banner load error' };
    }
  }

  async destroyBanner(placementId = AD_PLACEMENTS.HOME_BANNER) {
    return await this.getProvider().destroyBanner(placementId);
  }

  // 2. NATIVE AD API
  isNativeAvailable(placementId = AD_PLACEMENTS.HOME_NATIVE, options = {}) {
    const decision = this.canShowAd({
      adType: 'native',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) return false;
    return this.getProvider().isNativeAvailable(placementId);
  }

  async loadNative(placementId = AD_PLACEMENTS.HOME_NATIVE, options = {}) {
    const decision = this.canShowAd({
      adType: 'native',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) {
      return { success: false, reason: decision.reason };
    }

    try {
      return await this.getProvider().loadNative(placementId);
    } catch (err) {
      logger.warn('AdService.loadNative failed', { placementId, error: err?.message });
      return { success: false, reason: err?.message || 'Native ad load error' };
    }
  }

  async destroyNative(placementId = AD_PLACEMENTS.HOME_NATIVE) {
    return await this.getProvider().destroyNative(placementId);
  }

  // 3. INTERSTITIAL AD API
  isInterstitialAvailable(placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, options = {}) {
    const decision = this.canShowAd({
      adType: 'interstitial',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) return false;
    return this.getProvider().isInterstitialAvailable(placementId);
  }

  async loadInterstitial(placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, options = {}) {
    const decision = this.canShowAd({
      adType: 'interstitial',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });
    if (!decision.allowed) {
      return { success: false, reason: decision.reason };
    }

    try {
      return await this.getProvider().loadInterstitial(placementId);
    } catch (err) {
      logger.warn('AdService.loadInterstitial failed', { placementId, error: err?.message });
      return { success: false, reason: err?.message || 'Interstitial load error' };
    }
  }

  async showInterstitial(placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, options = {}) {
    const decision = this.canShowAd({
      adType: 'interstitial',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: options.isAdFree,
    });

    if (!decision.allowed) {
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: decision.reason,
      };
    }

    adFrequencyService.setInterstitialShowing(true);

    try {
      const result = await this.getProvider().showInterstitial(placementId, options);
      if (result.status === AD_STATES.COMPLETED) {
        adFrequencyService.recordInterstitialImpression();
      } else {
        adFrequencyService.setInterstitialShowing(false);
      }
      return result;
    } catch (err) {
      adFrequencyService.setInterstitialShowing(false);
      logger.warn('AdService.showInterstitial failed', { placementId, error: err?.message });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: err?.message || 'Interstitial playback error',
      };
    }
  }

  async destroyInterstitial(placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL) {
    return await this.getProvider().destroyInterstitial(placementId);
  }

  // 4. REWARDED AD API
  isRewardedAvailable(placementId = AD_PLACEMENTS.PROFILE_REWARDED, options = {}) {
    const decision = this.canShowAd({
      adType: 'rewarded',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: false, // Rewarded ads remain accessible via explicit button action
    });
    if (!decision.allowed) return false;
    return this.getProvider().isRewardedAvailable(placementId);
  }

  async loadRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED, options = {}) {
    const decision = this.canShowAd({
      adType: 'rewarded',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: false,
    });
    if (!decision.allowed) {
      return { success: false, reason: decision.reason };
    }

    try {
      return await this.getProvider().loadRewarded(placementId);
    } catch (err) {
      logger.warn('AdService.loadRewarded failed', { placementId, error: err?.message });
      return { success: false, reason: err?.message || 'Rewarded load error' };
    }
  }

  async showRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED, options = {}) {
    const decision = this.canShowAd({
      adType: 'rewarded',
      placementId,
      screen: options.screen,
      isOnline: options.isOnline,
      isAdFree: false,
    });

    if (!decision.allowed) {
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: decision.reason,
      };
    }

    // Start unique local session ID
    const sessionId = rewardedAdSessionManager.startSession(placementId);

    try {
      const result = await this.getProvider().showRewarded(placementId, options);
      if (result.status === AD_STATES.COMPLETED) {
        rewardedAdSessionManager.completeSession(sessionId);
        return {
          ...result,
          sessionId,
        };
      }
      rewardedAdSessionManager.cancelSession(sessionId);
      return {
        ...result,
        sessionId,
      };
    } catch (err) {
      rewardedAdSessionManager.failSession(sessionId);
      logger.warn('AdService.showRewarded failed', { placementId, error: err?.message });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: err?.message || 'Playback error',
        sessionId,
      };
    }
  }

  /**
   * Securely validates and grants reward for a completed session ID.
   */
  claimRewardedSession(sessionId) {
    return rewardedAdSessionManager.claimRewardForSession(sessionId);
  }

  async destroyRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED) {
    return await this.getProvider().destroyRewarded(placementId);
  }
}

export const adService = new AdService();
export default adService;

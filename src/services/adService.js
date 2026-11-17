import { AdProviderFactory } from './adProviderFactory';
import { AD_PLACEMENTS } from './ads/adPlacementConstants';
import { AD_STATES } from './ads/adProviderTypes';
import adDecisionEngine from './ads/adDecisionEngine';
import { adFrequencyService } from './ads/adFrequencyService';
import { interstitialFrequencyService, normalizeAdTime } from './ads/interstitialFrequencyService';
import { rewardedAdSessionManager } from './ads/rewardedAdSessionManager';
import { adMetricsService } from './ads/adMetricsService';
import { realtimeConfigService } from '../config/realtimeConfigService';
import firebaseAnalyticsService from './firebaseAnalyticsService';
import logger from './logger';

/** Default for how many opportunities before an interstitial is due to start loading it. */
export const INTERSTITIAL_PREPARE_AHEAD = 2;

/**
 * Main Application Advertising Service Boundary.
 * The ONLY service imported by UI components / screens for ad actions.
 * Wraps the active provider selected by AdProviderFactory.
 * Enforces single central ad decision pipeline, financial workflow protection, frequency caps, and reward security.
 */
class AdService {
  constructor() {
    this.providerOverride = null;
    this.devSimulationEnabled = false;
    this.modalHandler = null;
    this.interstitialModalHandler = null;
    this.cachedProvider = null;
    this.isInitialized = false;
    this.initPromise = null;
    this.readyListeners = new Set();
  }

  /**
   * Calls `listener` once ads finish starting (e.g. after a consent form that outlasted
   * the launch screen), so ad slots already on screen can try again.
   * @param {() => void} listener
   * @returns {() => void} Unsubscribe
   */
  subscribeToReady(listener) {
    this.readyListeners.add(listener);
    return () => this.readyListeners.delete(listener);
  }

  _notifyReady() {
    this.readyListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        logger.warn('AdService ready listener failed', { error: err?.message });
      }
    });
  }

  setProviderOverride(provider) {
    this.providerOverride = provider;
    this.cachedProvider = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  setDevSimulationEnabled(enabled) {
    this.devSimulationEnabled = Boolean(enabled);
    this.cachedProvider = null;
    this.isInitialized = false;
    this.initPromise = null;
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

  initialize(options = {}) {
    if (this.isInitialized) return Promise.resolve(true);
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const provider = this.getProvider();
        if (provider && typeof provider.initialize === 'function') {
          const result = await provider.initialize(options);
          this.isInitialized = Boolean(result);
          if (!result) {
            this.initPromise = null; // allow a later retry (e.g. after reconnecting)
          } else {
            this._notifyReady();
          }
          return result;
        }
        this.isInitialized = true;
        this._notifyReady();
        return true;
      } catch (err) {
        logger.warn('AdService async initialization error:', { error: err?.message });
        this.initPromise = null;
        return false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Preload supported ad inventory via active provider.
   * @param {Object} [options]
   * @returns {Promise<{ success: boolean, reason?: string }>}
   */
  async preloadAds(options = {}) {
    try {
      const provider = this.getProvider();
      if (provider && typeof provider.preloadAds === 'function') {
        return await provider.preloadAds(options);
      }
      return { success: true };
    } catch (err) {
      logger.warn('AdService.preloadAds error:', { error: err?.message });
      return { success: false, reason: err?.message };
    }
  }

  isConfigured() {
    return this.getProvider().isConfigured();
  }

  /**
   * Whether the user must be offered a "Privacy choices" entry to change ad consent.
   * @returns {boolean}
   */
  isPrivacyOptionsRequired() {
    const provider = this.getProvider();
    return typeof provider.isPrivacyOptionsRequired === 'function'
      ? Boolean(provider.isPrivacyOptionsRequired())
      : false;
  }

  /**
   * Shows the ad consent privacy options form.
   * @returns {Promise<boolean>} Whether the form was shown
   */
  async showPrivacyOptionsForm() {
    try {
      const provider = this.getProvider();
      if (typeof provider.showPrivacyOptionsForm !== 'function') return false;
      return Boolean(await provider.showPrivacyOptionsForm());
    } catch (err) {
      logger.warn('AdService.showPrivacyOptionsForm failed', { error: err?.message });
      return false;
    }
  }

  /**
   * Resolves once the startup (app open) ad is finished, or when `timeoutMs` passes
   * without one loading. Never rejects.
   * @param {number} timeoutMs
   * @returns {Promise<void>}
   */
  async waitForStartupAd(timeoutMs) {
    try {
      const provider = this.getProvider();
      if (typeof provider.waitForStartupAd === 'function') {
        await provider.waitForStartupAd(timeoutMs);
      }
    } catch (err) {
      logger.warn('AdService.waitForStartupAd failed', { error: err?.message });
    }
  }

  /** Stops a startup ad that hasn't loaded yet from appearing over the app later. */
  endStartupAd() {
    try {
      const provider = this.getProvider();
      if (typeof provider.endStartupAd === 'function') provider.endStartupAd();
    } catch (err) {
      logger.warn('AdService.endStartupAd failed', { error: err?.message });
    }
  }

  /**
   * How long the launch screen may wait for the startup ad.
   * @param {number} defaultMs - Used when the remote ad config doesn't say
   * @returns {number}
   */
  getStartupAdWaitMs(defaultMs) {
    try {
      const provider = this.getProvider();
      const ms = typeof provider.getStartupAdWaitMs === 'function' ? provider.getStartupAdWaitMs() : null;
      return typeof ms === 'number' ? ms : defaultMs;
    } catch (_err) {
      return defaultMs;
    }
  }

  /**
   * How many opportunities before an interstitial is due to start loading it.
   * @returns {number}
   */
  getInterstitialPrepareAhead() {
    try {
      const provider = this.getProvider();
      const steps =
        typeof provider.getInterstitialPrepareAhead === 'function' ? provider.getInterstitialPrepareAhead() : null;
      return typeof steps === 'number' ? steps : INTERSTITIAL_PREPARE_AHEAD;
    } catch (_err) {
      return INTERSTITIAL_PREPARE_AHEAD;
    }
  }

  /** Starts loading an interstitial so one is ready when it is next due. */
  prepareInterstitial(placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL) {
    try {
      const provider = this.getProvider();
      if (typeof provider.prepareInterstitial === 'function') provider.prepareInterstitial(placementId);
    } catch (err) {
      logger.warn('AdService.prepareInterstitial failed', { error: err?.message });
    }
  }

  /**
   * Resolves authoritative adTime configuration from active provider and remote config.
   * Single source of truth: Provider -> RTDB config -> Default fallback (3).
   * @param {Object} [options]
   * @returns {number}
   */
  getAdTime(options = {}) {
    const provider = this.getProvider();
    if (provider && typeof provider.getAdTime === 'function') {
      return provider.getAdTime();
    }
    const config = options.config || realtimeConfigService.getConfig();
    return normalizeAdTime(config?.ads?.adTime || config?.ads?.interstitial?.adTime);
  }

  /**
   * Central decision method. UI screens can query authorization before attempting ad load/display.
   */
  canShowAd(params = {}) {
    const config = params.config || realtimeConfigService.getConfig();
    const adTime = params.adTime ? normalizeAdTime(params.adTime) : this.getAdTime({ config });
    const maxPerSession = config?.ads?.interstitial?.maxPerSession;

    const frequencyStatus = interstitialFrequencyService.checkFrequencyStatus({
      adTime,
      maxPerSession,
    });

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
    const config = options.config || realtimeConfigService.getConfig();
    const adTime = options.adTime ? normalizeAdTime(options.adTime) : this.getAdTime({ config });
    const maxPerSession = config?.ads?.interstitial?.maxPerSession;

    let isAdFree = options.isAdFree;
    let isOnline = options.isOnline;
    if (isAdFree === undefined || isOnline === undefined) {
      try {
        const { store } = require('../store');
        const state = store?.getState?.();
        if (state) {
          if (isAdFree === undefined) {
            const { selectIsAdFree } = require('../store/slices/rewardsSlice');
            isAdFree = selectIsAdFree ? selectIsAdFree(state) : false;
          }
          if (isOnline === undefined) {
            const { selectIsOnline } = require('../store/slices/connectivitySlice');
            isOnline = selectIsOnline ? selectIsOnline(state) : (state.connectivity?.isOnline ?? true);
          }
        }
      } catch (_err) {
        // Redux store lookup fallback
      }
    }

    // 1. Evaluate basic safety constraints (isOnline, isAdFree, protectedScreen, global enabled, placement enabled)
    // Pass frequencyStatus as allowing so canShowAd evaluates safety preconditions first
    const basicDecision = adDecisionEngine.canShowAd({
      adType: 'interstitial',
      placementId,
      screen: options.screen,
      isOnline: isOnline !== undefined ? isOnline : true,
      isAdFree: isAdFree !== undefined ? isAdFree : false,
      config,
      frequencyStatus: { canShow: true },
      provider: this.getProvider(),
    });

    // If safety check fails (e.g. protected screen, offline, ad-free, disabled) -> return failed WITHOUT incrementing counter!
    if (!basicDecision.allowed) {
      firebaseAnalyticsService.logInterstitialAdSuppressed({
        placementId,
        screen: options.screen,
        reason: basicDecision.reason,
      });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: basicDecision.reason,
      };
    }

    // 2. Evaluate Eligible Opportunity and App-Side Counter
    const oppResult = interstitialFrequencyService.recordEligibleOpportunity({
      adTime,
      maxPerSession,
    });

    if (!oppResult.triggered) {
      // Load the interstitial a couple of opportunities early so it is ready when due
      if (
        oppResult.reason === 'THRESHOLD_NOT_MET' &&
        oppResult.counter >= oppResult.target - this.getInterstitialPrepareAhead()
      ) {
        this.prepareInterstitial(placementId);
      }
      firebaseAnalyticsService.logInterstitialAdSuppressed({
        placementId,
        screen: options.screen,
        reason: oppResult.reason,
      });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: oppResult.reason,
        counter: oppResult.counter,
        target: oppResult.target,
      };
    }

    // Due, but nothing loaded yet: keep it due for the next opportunity instead of losing it
    const provider = this.getProvider();
    if (typeof provider.isInterstitialReady === 'function' && !provider.isInterstitialReady(placementId)) {
      interstitialFrequencyService.deferDueInterstitial(oppResult.target);
      this.prepareInterstitial(placementId);
      firebaseAnalyticsService.logInterstitialAdSuppressed({
        placementId,
        screen: options.screen,
        reason: 'NOT_READY',
      });
      return {
        status: AD_STATES.FAILED,
        provider: provider.getType(),
        reason: 'NOT_READY',
      };
    }

    // 3. Threshold Met! Trigger provider to display interstitial
    adFrequencyService.setInterstitialShowing(true);

    try {
      const result = await this.getProvider().showInterstitial(placementId, {
        ...options,
        counter: oppResult.target,
      });
      if (result.status === AD_STATES.COMPLETED) {
        adFrequencyService.recordInterstitialImpression();
        firebaseAnalyticsService.logInterstitialAdShown({
          placementId,
          screen: options.screen,
        });
      } else {
        firebaseAnalyticsService.logInterstitialAdFailed({
          placementId,
          screen: options.screen,
          reason: result.reason || 'Not completed',
        });
      }
      return result;
    } catch (err) {
      logger.warn('AdService.showInterstitial failed', { placementId, error: err?.message });
      firebaseAnalyticsService.logInterstitialAdFailed({
        placementId,
        screen: options.screen,
        reason: err?.message || 'Playback error',
      });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: err?.message || 'Interstitial playback error',
      };
    } finally {
      interstitialFrequencyService.setInterstitialShowing(false);
      adFrequencyService.setInterstitialShowing(false);
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
      firebaseAnalyticsService.logRewardedAdSuppressed({
        placementId,
        screen: options.screen,
        reason: decision.reason,
      });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: decision.reason,
      };
    }

    // Start unique local session ID
    const sessionId = rewardedAdSessionManager.startSession(placementId);
    firebaseAnalyticsService.logRewardedAdStarted(placementId, options.screen);

    try {
      const result = await this.getProvider().showRewarded(placementId, options);
      if (result.status === AD_STATES.COMPLETED) {
        rewardedAdSessionManager.completeSession(sessionId);
        firebaseAnalyticsService.logRewardedAdCompleted(placementId, options.screen);
        return {
          ...result,
          sessionId,
        };
      }
      rewardedAdSessionManager.cancelSession(sessionId);
      firebaseAnalyticsService.logRewardedAdFailed({
        placementId,
        screen: options.screen,
        reason: result.reason || 'Not completed',
      });
      return {
        ...result,
        sessionId,
      };
    } catch (err) {
      rewardedAdSessionManager.failSession(sessionId);
      logger.warn('AdService.showRewarded failed', { placementId, error: err?.message });
      firebaseAnalyticsService.logRewardedAdFailed({
        placementId,
        screen: options.screen,
        reason: err?.message || 'Playback error',
      });
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
    const validation = rewardedAdSessionManager.claimRewardForSession(sessionId);
    if (validation && validation.valid) {
      firebaseAnalyticsService.logRewardedAdRewardClaimed({
        placementId: validation.session?.placementId,
      });
    }
    return validation;
  }

  async destroyRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED) {
    return await this.getProvider().destroyRewarded(placementId);
  }
}

export const adService = new AdService();
export default adService;

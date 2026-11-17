import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Base Ad Provider Contract Interface.
 * Defines the provider-agnostic contract implemented by SimulatedAdProvider, NoAdProvider, and ApprovedAdProvider.
 * Supports 4 Ad Types: BANNER, NATIVE, INTERSTITIAL, REWARDED.
 */
export class BaseAdProvider {
  getType() {
    return AD_PROVIDER_TYPES.NO_AD;
  }

  isConfigured() {
    return false;
  }

  getAdTime() {
    return 3;
  }

  /**
   * Whether the user must be offered a "Privacy choices" entry (ad consent regions).
   * @returns {boolean}
   */
  isPrivacyOptionsRequired() {
    return false;
  }

  /**
   * Shows the ad consent privacy options form.
   * @returns {Promise<boolean>} Whether the form was shown
   */
  async showPrivacyOptionsForm() {
    return false;
  }

  /**
   * Preload supported ad inventory (Banner, Native, Interstitial, Rewarded).
   * @returns {Promise<{ success: boolean }>}
   */
  async preloadAds() {
    return { success: true };
  }

  /**
   * Resolves once the startup (app open) ad is finished, or when `timeoutMs` passes
   * without one loading.
   * @param {number} _timeoutMs
   * @returns {Promise<void>}
   */
  async waitForStartupAd(_timeoutMs) {}

  /** Stops a startup ad that hasn't loaded yet from appearing later. */
  endStartupAd() {}

  /**
   * How long the launch screen may wait for the startup ad, from the remote ad config.
   * @returns {number|null} Milliseconds, or null to use the app default
   */
  getStartupAdWaitMs() {
    return null;
  }

  /**
   * How many opportunities before an interstitial is due to start loading it.
   * @returns {number|null} From the remote ad config, or null to use the app default
   */
  getInterstitialPrepareAhead() {
    return null;
  }

  // 1. BANNER AD API
  isBannerAvailable(_placementId) {
    return false;
  }

  async loadBanner(_placementId) {
    return { success: false, reason: 'Provider not configured' };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

  // 2. NATIVE AD API
  isNativeAvailable(_placementId) {
    return false;
  }

  async loadNative(_placementId) {
    return { success: false, reason: 'Provider not configured' };
  }

  async destroyNative(_placementId) {
    return { success: true };
  }

  // 3. INTERSTITIAL AD API
  isInterstitialAvailable(_placementId) {
    return false;
  }

  async loadInterstitial(_placementId) {
    return { success: false, reason: 'Provider not configured' };
  }

  /** Starts loading an interstitial so one is ready when it is next due. */
  prepareInterstitial(_placementId) {}

  /**
   * Whether an interstitial can be shown right away. Providers that can't tell report true.
   * @returns {boolean}
   */
  isInterstitialReady(_placementId) {
    return true;
  }

  async showInterstitial(_placementId, _options = {}) {
    return {
      status: AD_STATES.FAILED,
      provider: this.getType(),
      reason: 'Provider not configured',
    };
  }

  async destroyInterstitial(_placementId) {
    return { success: true };
  }

  // 4. REWARDED AD API
  isRewardedAvailable(_placementId) {
    return false;
  }

  async loadRewarded(_placementId) {
    return { success: false, reason: 'Provider not configured' };
  }

  async showRewarded(_placementId, _options = {}) {
    return {
      status: AD_STATES.FAILED,
      provider: this.getType(),
      reason: 'Provider not configured',
    };
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default BaseAdProvider;

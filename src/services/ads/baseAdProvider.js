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
   * Preload supported ad inventory (Banner, Native, Interstitial, Rewarded).
   * @returns {Promise<{ success: boolean }>}
   */
  async preloadAds() {
    return { success: true };
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

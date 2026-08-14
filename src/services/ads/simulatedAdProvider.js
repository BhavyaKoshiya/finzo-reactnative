import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Simulated Advertising Provider (Development Only).
 * Implements the provider contract for local testing during development across all 4 ad types:
 * - BANNER
 * - NATIVE
 * - INTERSTITIAL
 * - REWARDED
 * STRICTLY REQUIRES __DEV__ === true AND explicit simulation flag.
 */
export class SimulatedAdProvider extends BaseAdProvider {
  constructor(options = {}) {
    super();
    this.simulationEnabled = options.simulationEnabled ?? true;
    this.forcedState = options.forcedState || null; // null | 'cancel' | 'fail'
    this.modalHandler = null; // Handler function set by UI modal container for rewarded ads
    this.interstitialModalHandler = null; // Handler function set by UI modal container for interstitials
  }

  setModalHandler(handler) {
    this.modalHandler = handler;
  }

  setInterstitialModalHandler(handler) {
    this.interstitialModalHandler = handler;
  }

  getType() {
    return AD_PROVIDER_TYPES.SIMULATED;
  }

  isConfigured() {
    return Boolean(this.simulationEnabled);
  }

  // 1. BANNER AD API
  isBannerAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadBanner(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Simulated ads disabled' };
    }
    return { success: true, placementId: _placementId, provider: this.getType() };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

  // 2. NATIVE AD API
  isNativeAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadNative(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Simulated ads disabled' };
    }
    return {
      success: true,
      placementId: _placementId,
      provider: this.getType(),
      adData: {
        headline: 'Example Sponsor',
        body: 'Simulated native advertisement — Finzo swappable ad architecture',
        callToAction: 'Learn More',
        advertiser: 'Sponsored',
        isSimulated: true,
      },
    };
  }

  async destroyNative(_placementId) {
    return { success: true };
  }

  // 3. INTERSTITIAL AD API
  isInterstitialAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadInterstitial(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Simulated ads disabled' };
    }
    return { success: true, state: AD_STATES.READY, placementId: _placementId };
  }

  async showInterstitial(_placementId, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: AD_STATES.FAILED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        reason: 'Simulated ads disabled',
      };
    }

    const forcedMode = options.forcedMode || this.forcedState;

    if (forcedMode === 'fail') {
      return {
        status: AD_STATES.FAILED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        isTest: true,
        reason: 'Simulated interstitial playback failed',
      };
    }

    if (forcedMode === 'cancel') {
      return {
        status: AD_STATES.CANCELLED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        isTest: true,
        reason: 'Simulated interstitial dismissed by user',
      };
    }

    // Trigger visual full-screen modal if handler is registered
    if (this.interstitialModalHandler && typeof this.interstitialModalHandler === 'function') {
      try {
        const result = await this.interstitialModalHandler({ placementId: _placementId });
        return {
          status: result?.completed ? AD_STATES.COMPLETED : AD_STATES.CANCELLED,
          provider: AD_PROVIDER_TYPES.SIMULATED,
          isTest: true,
          transactionId: `sim_inter_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          completedAt: new Date().toISOString(),
        };
      } catch (err) {
        return {
          status: AD_STATES.FAILED,
          provider: AD_PROVIDER_TYPES.SIMULATED,
          isTest: true,
          reason: err?.message || 'Interstitial modal handler failed',
        };
      }
    }

    // Default fast completion for test runner / automated calls
    return {
      status: AD_STATES.COMPLETED,
      provider: AD_PROVIDER_TYPES.SIMULATED,
      isTest: true,
      transactionId: `sim_inter_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      completedAt: new Date().toISOString(),
    };
  }

  async destroyInterstitial(_placementId) {
    return { success: true };
  }

  // 4. REWARDED AD API
  isRewardedAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadRewarded(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Simulated ads unavailable in production or disabled' };
    }
    return { success: true, state: AD_STATES.READY, placementId: _placementId };
  }

  async showRewarded(_placementId, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: AD_STATES.FAILED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        reason: 'Simulated ads unavailable in production or disabled',
      };
    }

    const forcedMode = options.forcedMode || this.forcedState;

    if (forcedMode === 'fail') {
      return {
        status: AD_STATES.FAILED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        isTest: true,
        reason: 'Simulated ad playback failed',
      };
    }

    if (forcedMode === 'cancel') {
      return {
        status: AD_STATES.CANCELLED,
        provider: AD_PROVIDER_TYPES.SIMULATED,
        isTest: true,
        reason: 'Simulated ad playback cancelled by user',
      };
    }

    if (this.modalHandler && typeof this.modalHandler === 'function') {
      try {
        const result = await this.modalHandler({ placementId: _placementId });
        return {
          status: result?.completed ? AD_STATES.COMPLETED : AD_STATES.CANCELLED,
          provider: AD_PROVIDER_TYPES.SIMULATED,
          isTest: true,
          transactionId: `sim_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          completedAt: new Date().toISOString(),
        };
      } catch (err) {
        return {
          status: AD_STATES.FAILED,
          provider: AD_PROVIDER_TYPES.SIMULATED,
          isTest: true,
          reason: err?.message || 'Modal handler failed',
        };
      }
    }

    return {
      status: AD_STATES.COMPLETED,
      provider: AD_PROVIDER_TYPES.SIMULATED,
      isTest: true,
      transactionId: `sim_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      completedAt: new Date().toISOString(),
    };
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default SimulatedAdProvider;

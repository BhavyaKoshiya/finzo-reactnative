import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Simulated Advertising Provider (Development Only).
 * Implements the provider contract for local testing during development.
 * STRICTLY REQUIRES __DEV__ === true AND explicit simulation flag.
 */
export class SimulatedAdProvider extends BaseAdProvider {
  constructor(options = {}) {
    super();
    this.simulationEnabled = options.simulationEnabled ?? true;
    this.forcedState = options.forcedState || null; // null | 'cancel' | 'fail'
    this.modalHandler = null; // Handler function set by UI modal container
  }

  setModalHandler(handler) {
    this.modalHandler = handler;
  }

  getType() {
    return AD_PROVIDER_TYPES.SIMULATED;
  }

  isConfigured() {
    return Boolean(__DEV__ && this.simulationEnabled);
  }

  isBannerAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadBanner(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Simulated ads unavailable in production or disabled' };
    }
    return { success: true, placementId: _placementId, provider: this.getType() };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

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

    // If a modal handler is registered by RewardedAdModal, trigger the visual countdown modal
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

    // Default fast completion for test runner / automated calls
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

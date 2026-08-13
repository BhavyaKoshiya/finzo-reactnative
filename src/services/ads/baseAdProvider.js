import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Base Ad Provider Contract Interface.
 * Defines the provider-agnostic contract implemented by SimulatedAdProvider, NoAdProvider, and ApprovedAdProvider.
 */
export class BaseAdProvider {
  getType() {
    return AD_PROVIDER_TYPES.NO_AD;
  }

  isConfigured() {
    return false;
  }

  isBannerAvailable(_placementId) {
    return false;
  }

  async loadBanner(_placementId) {
    return { success: false, reason: 'Provider not configured' };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

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

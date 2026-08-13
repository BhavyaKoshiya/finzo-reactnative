import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * No-Ad Provider implementation.
 * Production-safe fallback when no approved ad provider exists or advertising is disabled.
 * Never shows ads, never returns completion, never grants rewards.
 */
export class NoAdProvider extends BaseAdProvider {
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
    return { success: false, reason: 'No advertising provider configured' };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

  isRewardedAvailable(_placementId) {
    return false;
  }

  async loadRewarded(_placementId) {
    return { success: false, reason: 'No advertising provider configured' };
  }

  async showRewarded(_placementId, _options = {}) {
    return {
      status: AD_STATES.FAILED,
      provider: AD_PROVIDER_TYPES.NO_AD,
      reason: 'No advertising provider configured',
    };
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default NoAdProvider;

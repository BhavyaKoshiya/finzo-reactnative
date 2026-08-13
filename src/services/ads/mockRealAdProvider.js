import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Mock Real Ad Provider.
 * Implements the exact same provider contract as SimulatedAdProvider and ApprovedAdProvider.
 * Used for verifying provider swappability without UI or service layer modifications.
 */
export class MockRealAdProvider extends BaseAdProvider {
  getType() {
    return AD_PROVIDER_TYPES.MOCK_REAL;
  }

  isConfigured() {
    return true;
  }

  isBannerAvailable(_placementId) {
    return true;
  }

  async loadBanner(placementId) {
    return { success: true, placementId, provider: this.getType() };
  }

  async destroyBanner(_placementId) {
    return { success: true };
  }

  isRewardedAvailable(_placementId) {
    return true;
  }

  async loadRewarded(placementId) {
    return { success: true, state: AD_STATES.READY, placementId };
  }

  async showRewarded(_placementId, _options = {}) {
    return {
      status: AD_STATES.COMPLETED,
      provider: AD_PROVIDER_TYPES.MOCK_REAL,
      isTest: false,
      transactionId: `mock_real_tx_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default MockRealAdProvider;

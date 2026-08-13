import { BaseAdProvider } from './baseAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from './adProviderTypes';

/**
 * Approved Real Ad Provider Stub.
 * Contract compliant interface ready to wrap the approved advertising SDK once license approval is granted.
 */
export class ApprovedAdProvider extends BaseAdProvider {
  constructor(sdkConfig = {}) {
    super();
    this.sdkConfig = sdkConfig;
    this.initialized = false;
  }

  getType() {
    return AD_PROVIDER_TYPES.APPROVED_REAL;
  }

  isConfigured() {
    return this.initialized && Boolean(this.sdkConfig.appId);
  }

  isBannerAvailable(_placementId) {
    return this.isConfigured();
  }

  async loadBanner(_placementId) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'Approved SDK not initialized' };
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
      return { success: false, reason: 'Approved SDK not initialized' };
    }
    return { success: true, state: AD_STATES.READY, placementId: _placementId };
  }

  async showRewarded(_placementId, _options = {}) {
    if (!this.isConfigured()) {
      return {
        status: AD_STATES.FAILED,
        provider: AD_PROVIDER_TYPES.APPROVED_REAL,
        reason: 'Approved SDK not initialized',
      };
    }

    return {
      status: AD_STATES.COMPLETED,
      provider: AD_PROVIDER_TYPES.APPROVED_REAL,
      isTest: false,
      transactionId: `approved_tx_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
  }

  async destroyRewarded(_placementId) {
    return { success: true };
  }
}

export default ApprovedAdProvider;

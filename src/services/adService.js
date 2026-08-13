import { AdProviderFactory } from './adProviderFactory';
import { AD_PLACEMENTS } from './ads/adPlacementConstants';
import { AD_STATES } from './ads/adProviderTypes';
import logger from './logger';

/**
 * Main Application Advertising Service Boundary.
 * The ONLY service imported by UI components / screens.
 * Wraps the active provider selected by AdProviderFactory.
 */
class AdService {
  constructor() {
    this.providerOverride = null;
    this.devSimulationEnabled = true;
    this.modalHandler = null;
  }

  setProviderOverride(provider) {
    this.providerOverride = provider;
  }

  setDevSimulationEnabled(enabled) {
    this.devSimulationEnabled = Boolean(enabled);
  }

  setModalHandler(handler) {
    this.modalHandler = handler;
    const provider = this.getProvider();
    if (provider && typeof provider.setModalHandler === 'function') {
      provider.setModalHandler(handler);
    }
  }

  getProvider() {
    const provider = AdProviderFactory.getProvider({
      providerOverride: this.providerOverride,
      devSimulationEnabled: this.devSimulationEnabled,
    });

    if (this.modalHandler && typeof provider.setModalHandler === 'function') {
      provider.setModalHandler(this.modalHandler);
    }

    return provider;
  }

  isConfigured() {
    return this.getProvider().isConfigured();
  }

  isBannerAvailable(placementId = AD_PLACEMENTS.HOME_BANNER) {
    return this.getProvider().isBannerAvailable(placementId);
  }

  async loadBanner(placementId = AD_PLACEMENTS.HOME_BANNER) {
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

  isRewardedAvailable(placementId = AD_PLACEMENTS.PROFILE_REWARDED) {
    return this.getProvider().isRewardedAvailable(placementId);
  }

  async loadRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED) {
    try {
      return await this.getProvider().loadRewarded(placementId);
    } catch (err) {
      logger.warn('AdService.loadRewarded failed', { placementId, error: err?.message });
      return { success: false, reason: err?.message || 'Rewarded load error' };
    }
  }

  async showRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED, options = {}) {
    try {
      return await this.getProvider().showRewarded(placementId, options);
    } catch (err) {
      logger.warn('AdService.showRewarded failed', { placementId, error: err?.message });
      return {
        status: AD_STATES.FAILED,
        provider: this.getProvider().getType(),
        reason: err?.message || 'Playback error',
      };
    }
  }

  async destroyRewarded(placementId = AD_PLACEMENTS.PROFILE_REWARDED) {
    return await this.getProvider().destroyRewarded(placementId);
  }
}

export const adService = new AdService();
export default adService;

import { AdProviderFactory } from '../adProviderFactory';
import { NoAdProvider } from '../ads/noAdProvider';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { MockRealAdProvider } from '../ads/mockRealAdProvider';
import { ApprovedAdProvider } from '../ads/approvedAdProvider';
import { adService } from '../adService';
import { AD_PROVIDER_TYPES, AD_STATES } from '../ads/adProviderTypes';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';

describe('Phase 16.15 — Swappable Ad Provider Architecture', () => {
  afterEach(() => {
    adService.setProviderOverride(null);
    adService.setDevSimulationEnabled(true);
  });

  it('NoAdProvider returns configured=false and fails showRewarded cleanly', async () => {
    const provider = new NoAdProvider();
    expect(provider.getType()).toBe(AD_PROVIDER_TYPES.NO_AD);
    expect(provider.isConfigured()).toBe(false);
    expect(provider.isBannerAvailable()).toBe(false);
    expect(provider.isRewardedAvailable()).toBe(false);

    const result = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED);
    expect(result.status).toBe(AD_STATES.FAILED);
    expect(result.provider).toBe(AD_PROVIDER_TYPES.NO_AD);
  });

  it('SimulatedAdProvider supports loading, showing, success, cancel, and failure modes', async () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    expect(provider.getType()).toBe(AD_PROVIDER_TYPES.SIMULATED);
    expect(provider.isConfigured()).toBe(true);
    expect(provider.isRewardedAvailable()).toBe(true);

    // Test Success
    const successRes = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED);
    expect(successRes.status).toBe(AD_STATES.COMPLETED);
    expect(successRes.provider).toBe(AD_PROVIDER_TYPES.SIMULATED);
    expect(successRes.isTest).toBe(true);
    expect(successRes.transactionId).toBeDefined();

    // Test Cancel
    const cancelRes = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED, { forcedMode: 'cancel' });
    expect(cancelRes.status).toBe(AD_STATES.CANCELLED);

    // Test Failure
    const failRes = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED, { forcedMode: 'fail' });
    expect(failRes.status).toBe(AD_STATES.FAILED);
  });

  it('AdProviderFactory strictly prevents SimulatedAdProvider in Production (__DEV__ = false)', () => {
    const devProvider = AdProviderFactory.getProvider({ isDev: true, devSimulationEnabled: true });
    expect(devProvider.getType()).toBe(AD_PROVIDER_TYPES.SIMULATED);

    // PRODUCTION SAFETY GUARD: SimulatedAdProvider is strictly blocked in production
    const prodProvider = AdProviderFactory.getProvider({ isDev: false, devSimulationEnabled: false });
    expect(prodProvider.getType()).not.toBe(AD_PROVIDER_TYPES.SIMULATED);
  });

  it('Provider Swap Test: MockRealAdProvider implements identical contract without breaking service boundary', async () => {
    const mockReal = new MockRealAdProvider();

    // Temporarily swap to MockRealAdProvider via service boundary
    adService.setProviderOverride(mockReal);
    expect(adService.getProvider().getType()).toBe(AD_PROVIDER_TYPES.MOCK_REAL);
    expect(adService.isBannerAvailable()).toBe(true);
    expect(adService.isRewardedAvailable()).toBe(true);

    const bannerRes = await adService.loadBanner(AD_PLACEMENTS.HOME_BANNER);
    expect(bannerRes.success).toBe(true);
    expect(bannerRes.provider).toBe(AD_PROVIDER_TYPES.MOCK_REAL);

    const rewardRes = await adService.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED);
    expect(rewardRes.status).toBe(AD_STATES.COMPLETED);
    expect(rewardRes.provider).toBe(AD_PROVIDER_TYPES.MOCK_REAL);
    expect(rewardRes.isTest).toBe(false);
  });

  it('ApprovedAdProvider stub implements identical contract', async () => {
    const approved = new ApprovedAdProvider({ appId: 'ca-app-pub-12345' });
    approved.initialized = true;

    expect(approved.getType()).toBe(AD_PROVIDER_TYPES.APPROVED_REAL);
    expect(approved.isConfigured()).toBe(true);

    const result = await approved.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED);
    expect(result.status).toBe(AD_STATES.COMPLETED);
    expect(result.provider).toBe(AD_PROVIDER_TYPES.APPROVED_REAL);
  });
});

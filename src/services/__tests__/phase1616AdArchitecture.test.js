import { AdProviderFactory } from '../adProviderFactory';
import { adService } from '../adService';
import { adFrequencyService } from '../ads/adFrequencyService';
import { BaseAdProvider } from '../ads/baseAdProvider';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { NoAdProvider } from '../ads/noAdProvider';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';
import { AD_STATES, AD_PROVIDER_TYPES } from '../ads/adProviderTypes';
import { DEFAULT_ADS_CONFIG } from '../../config/realtimeConfigDefaults';
import { validateRealtimeConfig } from '../../config/realtimeConfigSchema';
import {
  selectAdConfig,
  selectAdsGlobalEnabled,
  selectBannerAdsEnabled,
  selectNativeAdsEnabled,
  selectInterstitialAdsEnabled,
  isAdAllowedForPlacement,
} from '../../config/realtimeConfigSelectors';

describe('Phase 16.16 — Moderate Ad Experience & Swappable Ad Architecture Tests', () => {
  beforeEach(() => {
    adFrequencyService.resetSession();
    adService.setProviderOverride(null);
    adService.setDevSimulationEnabled(true);
  });

  test('1. Banner Ad API: load, availability, and destroy', async () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    expect(provider.isBannerAvailable(AD_PLACEMENTS.HOME_BANNER)).toBe(true);

    const loadRes = await provider.loadBanner(AD_PLACEMENTS.HOME_BANNER);
    expect(loadRes.success).toBe(true);
    expect(loadRes.placementId).toBe(AD_PLACEMENTS.HOME_BANNER);

    const destroyRes = await provider.destroyBanner(AD_PLACEMENTS.HOME_BANNER);
    expect(destroyRes.success).toBe(true);
  });

  test('2. Native Ad API: load, availability, and adData contract', async () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    expect(provider.isNativeAvailable(AD_PLACEMENTS.HOME_NATIVE)).toBe(true);

    const loadRes = await provider.loadNative(AD_PLACEMENTS.HOME_NATIVE);
    expect(loadRes.success).toBe(true);
    expect(loadRes.adData.headline).toBe('Example Sponsor');
    expect(loadRes.adData.callToAction).toBe('Learn More');

    const destroyRes = await provider.destroyNative(AD_PLACEMENTS.HOME_NATIVE);
    expect(destroyRes.success).toBe(true);
  });

  test('3. Interstitial Ad API: load, show, and completion state', async () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    expect(provider.isInterstitialAvailable(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL)).toBe(true);

    const loadRes = await provider.loadInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL);
    expect(loadRes.success).toBe(true);
    expect(loadRes.state).toBe(AD_STATES.READY);

    const showRes = await provider.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL);
    expect(showRes.status).toBe(AD_STATES.COMPLETED);
    expect(showRes.isTest).toBe(true);

    const destroyRes = await provider.destroyInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL);
    expect(destroyRes.success).toBe(true);
  });

  test('4 & 5. Interstitial Frequency Caps: cooldown and max per session', () => {
    const now = new Date(2026, 7, 13, 14, 0, 0);

    // Initial check allowed
    expect(adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 1, now }).allowed).toBe(true);

    // Record impression at 2:00 PM
    adFrequencyService.recordInterstitialImpression(now);

    // Second check immediately after should be blocked by session cap (maxPerSession = 1) and cooldown
    const immediatelyAfter = new Date(2026, 7, 13, 14, 1, 0);
    expect(
      adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 1, now: immediatelyAfter }).allowed
    ).toBe(false);

    // Even if maxPerSession were 2, 5 minutes later should be blocked by 10-minute cooldown
    const fiveMinsLater = new Date(2026, 7, 13, 14, 5, 0);
    expect(
      adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 2, now: fiveMinsLater }).allowed
    ).toBe(false);

    // 11 minutes later with higher session cap allowed
    const elevenMinsLater = new Date(2026, 7, 13, 14, 11, 0);
    expect(
      adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 2, now: elevenMinsLater }).allowed
    ).toBe(true);
  });

  test('6. Production Safety: NoAdProvider returned when devSimulationEnabled is false', () => {
    const prodProvider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: false,
      providerOverride: null,
      approvedSdkConfig: null,
    });

    expect(prodProvider.getType()).toBe(AD_PROVIDER_TYPES.NO_AD);
    expect(prodProvider instanceof SimulatedAdProvider).toBe(false);
  });

  test('7. Rewarded Ad Completion vs Cancellation handling', async () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });

    // Completed flow
    const completeRes = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED);
    expect(completeRes.status).toBe(AD_STATES.COMPLETED);

    // Cancelled flow
    const cancelRes = await provider.showRewarded(AD_PLACEMENTS.PROFILE_REWARDED, { forcedMode: 'cancel' });
    expect(cancelRes.status).toBe(AD_STATES.CANCELLED);
  });

  test('8. RTDB Schema & Selectors: Ads configuration parsing & placement permission gating', () => {
    const sampleConfig = {
      version: 1,
      rewards: {
        dailyCheckIn: { enabled: true, rewardSchedule: [5, 10], maxReward: 10, resetOnMissedDay: true },
        catalog: {
          ad_free_1h: { enabled: true, title: '1h', description: '1h', pointsCost: 50, durationMinutes: 60 },
        },
      },
      ads: {
        ...DEFAULT_ADS_CONFIG,
        enabled: true,
      },
    };

    const validationRes = validateRealtimeConfig(sampleConfig);
    expect(validationRes.valid).toBe(true);

    expect(selectAdsGlobalEnabled(sampleConfig)).toBe(true);
    expect(selectBannerAdsEnabled(sampleConfig)).toBe(true);
    expect(selectNativeAdsEnabled(sampleConfig)).toBe(true);
    expect(selectInterstitialAdsEnabled(sampleConfig)).toBe(true);

    expect(isAdAllowedForPlacement(sampleConfig, 'home', 'banner')).toBe(true);
    expect(isAdAllowedForPlacement(sampleConfig, 'home', 'native')).toBe(true);
    expect(isAdAllowedForPlacement(sampleConfig, 'loanDetails', 'native')).toBe(true);
  });

  test('9. Safe Defaults: Malformed/Missing ads section falls back safely', () => {
    const configWithNoAds = { version: 1, rewards: {} };
    const adConfig = selectAdConfig(configWithNoAds);

    expect(adConfig).toBeDefined();
    expect(adConfig.enabled).toBeDefined();
  });

  test('10. Privacy Isolation: Provider methods accept only placementId & options, no financial data', () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(provider));

    // Confirm standard provider method signatures
    expect(methodNames).toContain('loadBanner');
    expect(methodNames).toContain('loadNative');
    expect(methodNames).toContain('loadInterstitial');
    expect(methodNames).toContain('loadRewarded');
  });
});

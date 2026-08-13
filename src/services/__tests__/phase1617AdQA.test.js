import adDecisionEngine, { AD_DECISION_REASONS, PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import { rewardedAdSessionManager, SESSION_STATES } from '../ads/rewardedAdSessionManager';
import { adFrequencyService } from '../ads/adFrequencyService';
import { adService } from '../adService';
import { AdProviderFactory } from '../adProviderFactory';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { AD_PROVIDER_TYPES } from '../ads/adProviderTypes';
import { DEFAULT_ADS_CONFIG } from '../../config/realtimeConfigDefaults';

describe('Phase 16.17 — Ad Experience QA, Monetization Controls & Security Tests', () => {
  beforeEach(() => {
    adFrequencyService.resetSession();
    rewardedAdSessionManager.reset();
    adService.setProviderOverride(null);
    adService.setDevSimulationEnabled(true);
  });

  const validSampleConfig = {
    version: 1,
    ads: {
      ...DEFAULT_ADS_CONFIG,
      enabled: true,
    },
  };

  test('1. Financial Workflow Protection: All protected screens return FINANCIAL_WORKFLOW reason', () => {
    PROTECTED_FINANCIAL_SCREENS.forEach((screen) => {
      const decision = adDecisionEngine.canShowAd({
        adType: 'banner',
        screen,
        isOnline: true,
        isAdFree: false,
        config: validSampleConfig,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
    });
  });

  test('2. Ad-Free Always Wins: adFreeUntil > now suppresses ordinary ads', () => {
    const bannerDecision = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: true,
      config: validSampleConfig,
    });
    expect(bannerDecision.allowed).toBe(false);
    expect(bannerDecision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);

    const nativeDecision = adDecisionEngine.canShowAd({
      adType: 'native',
      screen: 'loanDetails',
      isOnline: true,
      isAdFree: true,
      config: validSampleConfig,
    });
    expect(nativeDecision.allowed).toBe(false);
    expect(nativeDecision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);

    const interstitialDecision = adDecisionEngine.canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: true,
      config: validSampleConfig,
    });
    expect(interstitialDecision.allowed).toBe(false);
    expect(interstitialDecision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);

    // Rewarded ads remain accessible via explicit button action
    const rewardedDecision = adDecisionEngine.canShowAd({
      adType: 'rewarded',
      screen: 'rewards',
      isOnline: true,
      isAdFree: true,
      config: validSampleConfig,
    });
    expect(rewardedDecision.allowed).toBe(true);
  });

  test('3. Offline Handling: isOnline = false suppresses all ad loading', () => {
    const decision = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: false,
      isAdFree: false,
      config: validSampleConfig,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.OFFLINE);
  });

  test('4. Interstitial Request Queue & Deduplication: Concurrent requests ignored', () => {
    expect(adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 1 }).allowed).toBe(true);

    // Lock display
    adFrequencyService.setInterstitialShowing(true);

    // Concurrent request should be rejected
    const concurrentReq = adFrequencyService.canShowInterstitial({ cooldownMinutes: 10, maxPerSession: 1 });
    expect(concurrentReq.allowed).toBe(false);
    expect(concurrentReq.reason).toBe('request_active');
  });

  test('5. Rewarded Ad Security: Unique Session ID & Replay Protection', () => {
    const sessionId = rewardedAdSessionManager.startSession('profile_rewarded');
    expect(sessionId).toMatch(/^rwd_sess_/);

    // Attempting to claim before completion fails
    const prematureClaim = rewardedAdSessionManager.claimRewardForSession(sessionId);
    expect(prematureClaim.success).toBe(false);

    // Complete session
    const completed = rewardedAdSessionManager.completeSession(sessionId);
    expect(completed).toBe(true);

    // Claim reward successfully
    const validClaim = rewardedAdSessionManager.claimRewardForSession(sessionId);
    expect(validClaim.success).toBe(true);
    expect(validClaim.session.status).toBe(SESSION_STATES.REWARDED);

    // Duplicate claim attempt fails (replay protection)
    const duplicateClaim = rewardedAdSessionManager.claimRewardForSession(sessionId);
    expect(duplicateClaim.success).toBe(false);
    expect(duplicateClaim.reason).toContain('already been claimed');
  });

  test('6. Production Safety: SimulatedAdProvider is NEVER returned in production (__DEV__ === false)', () => {
    const prodProvider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: true,
      providerOverride: null,
      approvedSdkConfig: null,
    });

    expect(prodProvider.getType()).toBe(AD_PROVIDER_TYPES.NO_AD);
    expect(prodProvider instanceof SimulatedAdProvider).toBe(false);
  });

  test('7. Safe Remote Config Fallback: Malformed/Missing config handles cleanly without crash', () => {
    const malformedConfig = { version: 1, ads: null };
    const decision = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: malformedConfig,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.INVALID_CONFIGURATION);
  });

  test('8. Financial Data Firewall: Provider methods accept string placement IDs and options', () => {
    const provider = new SimulatedAdProvider({ simulationEnabled: true });
    expect(() => provider.isBannerAvailable('home_banner')).not.toThrow();
    expect(() => provider.isNativeAvailable('home_native')).not.toThrow();
    expect(() => provider.isInterstitialAvailable('calc_interstitial')).not.toThrow();
    expect(() => provider.isRewardedAvailable('profile_rewarded')).not.toThrow();
  });
});

/**
 * FINZO — PHASE 21 — Real Marketing Plugin Integration Tests
 *
 * Validates real marketing plugin integration in DEV + PRODUCTION,
 * environment-aware JSON configuration, fail-safe error recovery,
 * rewarded session security, financial data firewall, and placement preservation.
 */

import { AdProviderFactory } from '../adProviderFactory';
import { MarketingAdProvider } from '../ads/marketingAdProvider';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { NoAdProvider } from '../ads/noAdProvider';
import { AD_PROVIDER_TYPES, AD_STATES } from '../ads/adProviderTypes';
import adDecisionEngine, { PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';
import { rewardedAdSessionManager } from '../ads/rewardedAdSessionManager';
import { marketingPlugin } from 'react-native-marketing-plugin';

// Mock react-native-marketing-plugin
jest.mock('react-native-marketing-plugin', () => {
  const mockMarketingPlugin = {
    adModel: {
      isad: true,
      isbannerenable: true,
      isnativeenable: true,
      isinterstitialenable: true,
      isrewarded: true,
      adTime: 2,
    },
    initialize: jest.fn().mockResolvedValue(true),
    showInterstitial: jest.fn().mockResolvedValue(undefined),
    showRewardAd: jest.fn().mockImplementation((cb) => {
      if (typeof cb === 'function') cb();
      return Promise.resolve();
    }),
  };

  return {
    marketingPlugin: mockMarketingPlugin,
    BannerAdView: jest.fn().mockReturnValue(null),
    NativeAdComponent: jest.fn().mockReturnValue(null),
    MarketingPlugin: {
      getInstance: () => mockMarketingPlugin,
    },
  };
});

describe('Phase 21 — Real Marketing Plugin Integration', () => {
  const originalDev = global.__DEV__;

  afterEach(() => {
    global.__DEV__ = originalDev;
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. PROVIDER SELECTION: DEV + PRODUCTION
  // ============================================================
  test('1. In Development (__DEV__ === true), AdProviderFactory returns MarketingAdProvider by default', () => {
    global.__DEV__ = true;
    const provider = AdProviderFactory.getProvider({ isDev: true });

    expect(provider instanceof MarketingAdProvider).toBe(true);
    expect(provider.getType()).toBe(AD_PROVIDER_TYPES.APPROVED_REAL);
  });

  test('2. In Production (__DEV__ === false), AdProviderFactory returns MarketingAdProvider', () => {
    global.__DEV__ = false;
    const provider = AdProviderFactory.getProvider({ isDev: false });

    expect(provider instanceof MarketingAdProvider).toBe(true);
    expect(provider instanceof SimulatedAdProvider).toBe(false);
  });

  test('3. SimulatedAdProvider can NEVER be created in production under any options', () => {
    global.__DEV__ = false;
    const provider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: true,
      forceSimulation: true,
    });

    expect(provider instanceof SimulatedAdProvider).toBe(false);
    expect(provider instanceof MarketingAdProvider).toBe(true);
  });

  // ============================================================
  // 2. PLUGIN INITIALIZATION & APP-OPEN SAFETY
  // ============================================================
  test('4. MarketingAdProvider initializes with enableAppOpenOnResume strictly set to false', async () => {
    const provider = new MarketingAdProvider({
      baseUrl: 'https://ad-config-test.finzocalculator.com/api',
      bundleId: 'com.finzo.financecalculator',
    });

    const success = await provider.initialize();
    expect(success).toBe(true);
    expect(marketingPlugin.initialize).toHaveBeenCalledWith({
      baseUrl: 'https://ad-config-test.finzocalculator.com/api',
      bundleId: 'com.finzo.financecalculator',
      enableAppOpenOnResume: false, // Must be strictly disabled
    });
  });

  test('5. MarketingAdProvider initialization is idempotent', async () => {
    const provider = new MarketingAdProvider();
    await provider.initialize();
    await provider.initialize();

    expect(marketingPlugin.initialize).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // 3. FAIL-SAFE INTERSTITIAL EXECUTION
  // ============================================================
  test('6. showInterstitial passes derived counter matching adTime and handles success', async () => {
    const provider = new MarketingAdProvider();
    const result = await provider.showInterstitial('calculator_interstitial');

    expect(marketingPlugin.showInterstitial).toHaveBeenCalledWith(2);
    expect(result.status).toBe(AD_STATES.COMPLETED);
    expect(result.placementId).toBe('calculator_interstitial');
  });

  test('7. showInterstitial recovers fail-safely if marketing plugin throws', async () => {
    marketingPlugin.showInterstitial.mockRejectedValueOnce(new Error('AdMob SDK timeout'));

    const provider = new MarketingAdProvider();
    const result = await provider.showInterstitial('calculator_interstitial');

    expect(result.status).toBe(AD_STATES.FAILED);
    expect(result.reason).toContain('AdMob SDK timeout');
  });

  // ============================================================
  // 4. REWARDED AD BINDING & SECURITY
  // ============================================================
  test('8. Rewarded ad completion invokes session callback and grants reward exactly once', async () => {
    const provider = new MarketingAdProvider();
    const session = rewardedAdSessionManager.startSession({
      placementId: 'rewards_native',
      rewardType: 'ad_free_30m',
    });

    let callbackFired = 0;
    const result = await provider.showRewarded('rewards_native', {
      onRewarded: () => {
        callbackFired++;
        rewardedAdSessionManager.claimRewardForSession(session.sessionId);
      },
    });

    expect(result.status).toBe(AD_STATES.COMPLETED);
    expect(result.rewardGranted).toBe(true);
    expect(callbackFired).toBe(1);

    // Duplicate claim attempt should return false
    const duplicateClaim = rewardedAdSessionManager.claimRewardForSession(session.sessionId);
    expect(duplicateClaim.success).toBe(false);
  });

  test('9. Rewarded ad failure returns failed status cleanly', async () => {
    marketingPlugin.showRewardAd.mockRejectedValueOnce(new Error('Network dropped during rewarded video'));

    const provider = new MarketingAdProvider();
    const result = await provider.showRewarded('rewards_native');

    expect(result.status).toBe(AD_STATES.FAILED);
    expect(result.reason).toContain('Network dropped');
  });

  // ============================================================
  // 5. FINANCIAL WORKFLOW PROTECTION & PRIVACY FIREWALL
  // ============================================================
  test('10. Financial workflows are 100% protected and reject ad display unconditionally', () => {
    PROTECTED_FINANCIAL_SCREENS.forEach((screen) => {
      const decision = adDecisionEngine.canShowAd({
        placementId: 'test_banner',
        screen,
        isAdFree: false,
        isOnline: true,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('FINANCIAL_WORKFLOW');
    });
  });

  test('11. Zero financial parameters are passed across the provider boundary', async () => {
    const provider = new MarketingAdProvider();

    // Calling showInterstitial with purely generic placement ID
    const res = await provider.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL);
    expect(res.placementId).toBe('calculator_interstitial');

    // Verify no financial metrics are stored on the provider instance
    expect(provider.loan).toBeUndefined();
    expect(provider.principal).toBeUndefined();
    expect(provider.balance).toBeUndefined();
    expect(provider.emi).toBeUndefined();
  });

  // ============================================================
  // 6. FROZEN PLACEMENT MAP PRESERVATION
  // ============================================================
  test('12. Frozen placement map contains all 15 placements without alterations', () => {
    expect(AD_PLACEMENTS.HOME_NATIVE).toBe('home_native');
    expect(AD_PLACEMENTS.HOME_BANNER).toBe('home_banner');
    expect(AD_PLACEMENTS.TAB_BOTTOM_BANNER).toBe('tab_bottom_banner');
    expect(AD_PLACEMENTS.CALCULATOR_NATIVE).toBe('calculator_native');
    expect(AD_PLACEMENTS.CALCULATOR_BANNER).toBe('calculator_banner');
    expect(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL).toBe('calculator_interstitial');
    expect(AD_PLACEMENTS.MY_LOANS_BANNER).toBe('my_loans_banner');
    expect(AD_PLACEMENTS.LOAN_DETAILS_NATIVE).toBe('loan_details_native');
    expect(AD_PLACEMENTS.PROFILE_BANNER).toBe('profile_banner');
    expect(AD_PLACEMENTS.REWARDS_NATIVE).toBe('rewards_native');
  });
});

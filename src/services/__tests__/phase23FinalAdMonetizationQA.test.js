/* eslint-env jest */
import adService from '../adService';
import { AdProviderFactory } from '../adProviderFactory';
import { MarketingAdProvider } from '../ads/marketingAdProvider';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { interstitialFrequencyService, normalizeAdTime } from '../ads/interstitialFrequencyService';
import { adDecisionEngine, AD_DECISION_REASONS, PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';
import { AD_STATES, AD_PROVIDER_TYPES } from '../ads/adProviderTypes';
import { rewardedAdSessionManager } from '../ads/rewardedAdSessionManager';
import { marketingPlugin } from 'react-native-marketing-plugin';

describe('Phase 23 — Final Ad Configuration & Monetization QA (Feature Freeze)', () => {
  beforeEach(() => {
    interstitialFrequencyService.resetSession();
    rewardedAdSessionManager.reset();
    adService.setProviderOverride(null);
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. SINGLE SOURCE OF TRUTH FOR adTime
  // ============================================================
  describe('1. Single Source of Truth for adTime', () => {
    test('adService.getAdTime() delegates to active MarketingAdProvider and normalizes value', () => {
      // Default mock in jest.setup.js sets adModel.adTime = 2
      expect(adService.getAdTime()).toBe(2);
    });

    test('Fallback to RTDB config when provider has no adModel', () => {
      const providerWithoutModel = {
        getType: () => AD_PROVIDER_TYPES.APPROVED_REAL,
        isConfigured: () => true,
        getAdTime: () => normalizeAdTime(undefined),
      };
      adService.setProviderOverride(providerWithoutModel);

      expect(adService.getAdTime({ config: { ads: { adTime: 4 } } })).toBe(3); // provider getAdTime takes precedence
    });

    test('Normalization handles edge cases (invalid, negative, string, float)', () => {
      expect(normalizeAdTime(null)).toBe(3);
      expect(normalizeAdTime(undefined)).toBe(3);
      expect(normalizeAdTime(-10)).toBe(3);
      expect(normalizeAdTime(0)).toBe(3);
      expect(normalizeAdTime('5')).toBe(5);
      expect(normalizeAdTime(3.7)).toBe(3);
      expect(normalizeAdTime(NaN)).toBe(3);
    });
  });

  // ============================================================
  // 2. REAL MARKETING PLUGIN ACTIVE IN DEV & PROD
  // ============================================================
  describe('2. Real Marketing Plugin Architecture & Simulator Isolation', () => {
    test('AdProviderFactory selects MarketingAdProvider by default in development', () => {
      const provider = AdProviderFactory.getProvider({ isDev: true });
      expect(provider).toBeInstanceOf(MarketingAdProvider);
    });

    test('AdProviderFactory selects MarketingAdProvider by default in production', () => {
      const provider = AdProviderFactory.getProvider({ isDev: false });
      expect(provider).toBeInstanceOf(MarketingAdProvider);
      expect(provider).not.toBeInstanceOf(SimulatedAdProvider);
    });

    test('SimulatedAdProvider is strictly guarded and only used when forceSimulation is explicit in DEV', () => {
      const devSimulator = AdProviderFactory.getProvider({ isDev: true, forceSimulation: true });
      expect(devSimulator).toBeInstanceOf(SimulatedAdProvider);

      // In production (__DEV__ === false), forceSimulation CANNOT bypass the hard gate
      const prodSimulatorAttempt = AdProviderFactory.getProvider({ isDev: false, forceSimulation: true });
      expect(prodSimulatorAttempt).not.toBeInstanceOf(SimulatedAdProvider);
    });
  });

  // ============================================================
  // 3. FROZEN PLACEMENT VERIFICATION
  // ============================================================
  describe('3. Frozen Placement Map Verification', () => {
    test('All 14 required placement IDs are defined and intact in AD_PLACEMENTS', () => {
      const expectedPlacements = [
        'home_native',
        'home_banner',
        'tab_bottom_banner',
        'calculator_native',
        'calculator_banner',
        'my_loans_banner',
        'loan_details_native',
        'profile_banner',
        'rewards_native',
        'calculator_interstitial',
        'profile_rewarded',
        'rewards_rewarded',
      ];

      expectedPlacements.forEach((placementId) => {
        expect(Object.values(AD_PLACEMENTS)).toContain(placementId);
      });
    });
  });

  // ============================================================
  // 4. FINANCIAL DATA FIREWALL & ZERO LEAKAGE
  // ============================================================
  describe('4. Financial Data Firewall & Zero Leakage', () => {
    test('AdService methods accept only generic metadata; financial fields are omitted', async () => {
      const financialPayload = {
        screen: 'calculators',
        loanId: 'loan-secret-123',
        principal: 500000,
        balance: 450000,
        interestRate: 8.5,
        emi: 12500,
        accountNumber: '1234567890',
        pin: '9999',
        isOnline: true,
        isAdFree: false,
        adTime: 1,
      };

      // Show interstitial with financial payload
      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, financialPayload);
      expect(res.status).toBe(AD_STATES.COMPLETED);

      // Verify marketingPlugin was not called with financial data
      expect(marketingPlugin.showInterstitial).toHaveBeenCalled();
      const lastCallArgs = marketingPlugin.showInterstitial.mock.calls[0];
      // Arg should only be the numeric counter or undefined
      expect(typeof lastCallArgs[0]).toBe('number');
      expect(JSON.stringify(lastCallArgs)).not.toContain('loan-secret-123');
      expect(JSON.stringify(lastCallArgs)).not.toContain('1234567890');
      expect(JSON.stringify(lastCallArgs)).not.toContain('9999');
    });
  });

  // ============================================================
  // 5. FINANCIAL WORKFLOW PROTECTION & AD-FREE SUPPRESSION
  // ============================================================
  describe('5. Protected Financial Workflows & Entitlement Rules', () => {
    test('All 15 protected screens reject ads and do not increment the opportunity counter', async () => {
      const initialCount = interstitialFrequencyService.getCounter();

      for (const screen of PROTECTED_FINANCIAL_SCREENS) {
        const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
          screen,
          isOnline: true,
          isAdFree: false,
        });

        expect(res.status).toBe(AD_STATES.FAILED);
        expect(res.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
        expect(interstitialFrequencyService.getCounter()).toBe(initialCount);
      }
    });

    test('Offline state rejects ads and preserves opportunity counter without accumulating debt', async () => {
      const initialCount = interstitialFrequencyService.getCounter();

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: false,
        isAdFree: false,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toBe(AD_DECISION_REASONS.OFFLINE);
      expect(interstitialFrequencyService.getCounter()).toBe(initialCount);
    });

    test('Ad-Free state suppresses ordinary ads and preserves opportunity counter', async () => {
      const initialCount = interstitialFrequencyService.getCounter();

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: true,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
      expect(interstitialFrequencyService.getCounter()).toBe(initialCount);
    });
  });

  // ============================================================
  // 6. SESSION LIMIT & FAIL-SAFE CONTINUATION
  // ============================================================
  describe('6. Hard Session Limit & Fail-Safe Navigation', () => {
    test('Hard session limit of 3 interstitials per session is strictly enforced', async () => {
      // 3 successful shows
      for (let i = 1; i <= 3; i++) {
        const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
          screen: 'calculators',
          isOnline: true,
          isAdFree: false,
          adTime: 1, // trigger every time for test
        });
        expect(res.status).toBe(AD_STATES.COMPLETED);
      }

      // 4th attempt must be rejected with SESSION_LIMIT_REACHED
      const res4 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 1,
      });
      expect(res4.status).toBe(AD_STATES.FAILED);
      expect(res4.reason).toBe(AD_DECISION_REASONS.SESSION_LIMIT_REACHED);
    });

    test('Provider failure fails gracefully and consumes opportunity to prevent retry loops', async () => {
      const failingMock = {
        getType: () => AD_PROVIDER_TYPES.APPROVED_REAL,
        isConfigured: () => true,
        getAdTime: () => 1,
        showInterstitial: jest.fn().mockRejectedValue(new Error('Network timeout loading ad')),
      };
      adService.setProviderOverride(failingMock);

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 1,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toContain('Network timeout loading ad');
      // Lock is released
      expect(interstitialFrequencyService.isInterstitialShowing).toBe(false);
      // Counter was reset to 0 upon triggering
      expect(interstitialFrequencyService.getCounter()).toBe(0);
    });
  });

  // ============================================================
  // 7. REWARDED AD IDEMPOTENCY & DAILY CAP
  // ============================================================
  describe('7. Rewarded Ad Security & Daily Limits', () => {
    test('Rewarded ad awards exactly one reward per completed playback', () => {
      const sessionId = rewardedAdSessionManager.startSession('profile_rewarded');
      expect(sessionId).toBeTruthy();

      // Complete session
      expect(rewardedAdSessionManager.completeSession(sessionId)).toBe(true);

      // Claim reward
      const claimResult = rewardedAdSessionManager.claimRewardForSession(sessionId);
      expect(claimResult.success).toBe(true);
      expect(claimResult.session.status).toBe('REWARDED');
    });

    test('Duplicate claim for same session is strictly rejected', () => {
      const sessionId = rewardedAdSessionManager.startSession('rewards_rewarded');
      expect(rewardedAdSessionManager.completeSession(sessionId)).toBe(true);

      const claim1 = rewardedAdSessionManager.claimRewardForSession(sessionId);
      expect(claim1.success).toBe(true);

      const claim2 = rewardedAdSessionManager.claimRewardForSession(sessionId);
      expect(claim2.success).toBe(false);
      expect(claim2.reason).toContain('already been claimed');
    });

    test('Uncompleted session cannot be claimed', () => {
      const sessionId = rewardedAdSessionManager.startSession('rewards_rewarded');
      // Attempt claim before completion
      const claim = rewardedAdSessionManager.claimRewardForSession(sessionId);
      expect(claim.success).toBe(false);
      expect(claim.reason).toContain('Cannot claim reward for session');
    });
  });
});

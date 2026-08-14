/* eslint-env jest */
import {
  interstitialFrequencyService,
  normalizeAdTime,
  DEFAULT_AD_TIME,
  DEFAULT_MAX_PER_SESSION,
  INTERSTITIAL_ELIGIBLE_ACTIONS,
} from '../ads/interstitialFrequencyService';
import { adDecisionEngine, AD_DECISION_REASONS, PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import adService from '../adService';
import { AD_STATES } from '../ads/adProviderTypes';
import { AD_PLACEMENTS } from '../ads/adPlacementConstants';

describe('Phase 22 — App-Side Interstitial Frequency & Marketing JSON adTime', () => {
  beforeEach(() => {
    interstitialFrequencyService.resetSession();
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. adTime NORMALIZATION & SANITIZATION
  // ============================================================
  describe('1. adTime Normalization & Fallbacks', () => {
    test('Defaults to 3 when adTime is missing or undefined', () => {
      expect(normalizeAdTime(undefined)).toBe(DEFAULT_AD_TIME);
    });

    test('Defaults to 3 when adTime is null', () => {
      expect(normalizeAdTime(null)).toBe(DEFAULT_AD_TIME);
    });

    test('Defaults to 3 when adTime is negative or zero', () => {
      expect(normalizeAdTime(0)).toBe(DEFAULT_AD_TIME);
      expect(normalizeAdTime(-5)).toBe(DEFAULT_AD_TIME);
    });

    test('Parses valid string numbers correctly', () => {
      expect(normalizeAdTime('4')).toBe(4);
      expect(normalizeAdTime('1')).toBe(1);
    });

    test('Floors decimal numbers to positive integer', () => {
      expect(normalizeAdTime(2.9)).toBe(2);
      expect(normalizeAdTime(4.1)).toBe(4);
    });

    test('Defaults to 3 on NaN, non-numeric strings or objects', () => {
      expect(normalizeAdTime('invalid')).toBe(DEFAULT_AD_TIME);
      expect(normalizeAdTime({})).toBe(DEFAULT_AD_TIME);
    });
  });

  // ============================================================
  // 2. OPPORTUNITY COUNTING & THRESHOLD RESET (Examples A, B, C)
  // ============================================================
  describe('2. Example A: adTime = 3 (Show ad every 3rd opportunity)', () => {
    test('Actions 1-6 follow strict threshold gating and counter reset', () => {
      const adTime = 3;

      // Opportunity 1: counter = 1 -> no ad
      const opp1 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp1.triggered).toBe(false);
      expect(opp1.counter).toBe(1);
      expect(opp1.reason).toBe('THRESHOLD_NOT_MET');

      // Opportunity 2: counter = 2 -> no ad
      const opp2 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp2.triggered).toBe(false);
      expect(opp2.counter).toBe(2);
      expect(opp2.reason).toBe('THRESHOLD_NOT_MET');

      // Opportunity 3: counter = 3 -> ad triggered! counter reset to 0
      const opp3 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp3.triggered).toBe(true);
      expect(opp3.counter).toBe(0);
      expect(opp3.sessionCount).toBe(1);

      // Release lock
      interstitialFrequencyService.setInterstitialShowing(false);

      // Opportunity 4: counter = 1 -> no ad
      const opp4 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp4.triggered).toBe(false);
      expect(opp4.counter).toBe(1);

      // Opportunity 5: counter = 2 -> no ad
      const opp5 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp5.triggered).toBe(false);
      expect(opp5.counter).toBe(2);

      // Opportunity 6: counter = 3 -> ad triggered! counter reset to 0
      const opp6 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp6.triggered).toBe(true);
      expect(opp6.counter).toBe(0);
      expect(opp6.sessionCount).toBe(2);
    });
  });

  describe('3. Example B: adTime = 5 (Show ad every 5th opportunity)', () => {
    test('Actions 1-4 no ad, Action 5 ad, Action 6 no ad', () => {
      const adTime = 5;

      for (let i = 1; i <= 4; i++) {
        const opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
        expect(opp.triggered).toBe(false);
        expect(opp.counter).toBe(i);
        expect(opp.reason).toBe('THRESHOLD_NOT_MET');
      }

      // Action 5
      const opp5 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp5.triggered).toBe(true);
      expect(opp5.counter).toBe(0);
      expect(opp5.sessionCount).toBe(1);

      interstitialFrequencyService.setInterstitialShowing(false);

      // Action 6
      const opp6 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp6.triggered).toBe(false);
      expect(opp6.counter).toBe(1);
    });
  });

  describe('4. Example C: adTime = 1 (Show ad on every opportunity)', () => {
    test('Every opportunity triggers an ad up to session limit', () => {
      const adTime = 1;

      // Opportunity 1
      const opp1 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp1.triggered).toBe(true);
      expect(opp1.sessionCount).toBe(1);
      interstitialFrequencyService.setInterstitialShowing(false);

      // Opportunity 2
      const opp2 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp2.triggered).toBe(true);
      expect(opp2.sessionCount).toBe(2);
      interstitialFrequencyService.setInterstitialShowing(false);

      // Opportunity 3
      const opp3 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp3.triggered).toBe(true);
      expect(opp3.sessionCount).toBe(3);
      interstitialFrequencyService.setInterstitialShowing(false);

      // Opportunity 4: Hard session limit reached!
      const opp4 = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
      expect(opp4.triggered).toBe(false);
      expect(opp4.reason).toBe('SESSION_LIMIT_REACHED');
    });
  });

  // ============================================================
  // 3. SAFETY GATES PRECEDENCE OVER COUNTER
  // ============================================================
  describe('5. Safety Gates Precedence: Zero counter debt accumulation', () => {
    test('15 Protected financial workflows never increment the counter', async () => {
      const initialCounter = interstitialFrequencyService.getCounter();

      for (const screen of PROTECTED_FINANCIAL_SCREENS) {
        const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
          screen,
          isOnline: true,
          isAdFree: false,
          adTime: 3,
        });

        expect(res.status).toBe(AD_STATES.FAILED);
        expect(res.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
        // Counter must remain at initial value
        expect(interstitialFrequencyService.getCounter()).toBe(initialCounter);
      }
    });

    test('Offline state never increments the counter', async () => {
      const initialCounter = interstitialFrequencyService.getCounter();

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: false,
        isAdFree: false,
        adTime: 3,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toBe(AD_DECISION_REASONS.OFFLINE);
      expect(interstitialFrequencyService.getCounter()).toBe(initialCounter);
    });

    test('Ad-Free entitlement never increments the counter', async () => {
      const initialCounter = interstitialFrequencyService.getCounter();

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: true,
        adTime: 3,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
      expect(interstitialFrequencyService.getCounter()).toBe(initialCounter);
    });

    test('Globally disabled ads never increment the counter', async () => {
      const initialCounter = interstitialFrequencyService.getCounter();

      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        config: { ads: { enabled: false } },
        adTime: 3,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toBe(AD_DECISION_REASONS.ADS_DISABLED);
      expect(interstitialFrequencyService.getCounter()).toBe(initialCounter);
    });
  });

  // ============================================================
  // 4. SESSION LIMIT & CONCURRENCY
  // ============================================================
  describe('6. Session Limit & Concurrency Protection', () => {
    test('Enforces hard session limit of 3 interstitials', () => {
      const maxPerSession = DEFAULT_MAX_PER_SESSION; // 3
      const adTime = 1;

      // 1st ad
      let opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime, maxPerSession });
      expect(opp.triggered).toBe(true);
      interstitialFrequencyService.setInterstitialShowing(false);

      // 2nd ad
      opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime, maxPerSession });
      expect(opp.triggered).toBe(true);
      interstitialFrequencyService.setInterstitialShowing(false);

      // 3rd ad
      opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime, maxPerSession });
      expect(opp.triggered).toBe(true);
      interstitialFrequencyService.setInterstitialShowing(false);

      // 4th attempt -> Session limit reached!
      opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime, maxPerSession });
      expect(opp.triggered).toBe(false);
      expect(opp.reason).toBe('SESSION_LIMIT_REACHED');
      expect(interstitialFrequencyService.getSessionCount()).toBe(3);
    });

    test('Double-tap concurrency lock prevents duplicate triggers', () => {
      interstitialFrequencyService.setInterstitialShowing(true);

      const opp = interstitialFrequencyService.recordEligibleOpportunity({ adTime: 1 });
      expect(opp.triggered).toBe(false);
      expect(opp.reason).toBe('REQUEST_ACTIVE');
    });
  });

  // ============================================================
  // 5. PROVIDER FAILURE & END-TO-END FLOW
  // ============================================================
  describe('7. Provider Failure & End-to-End adService Integration', () => {
    test('Calculator back navigation triggers ad on 3rd tap with adTime=3', async () => {
      // Tap 1
      const res1 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 3,
      });
      expect(res1.status).toBe(AD_STATES.FAILED);
      expect(res1.reason).toBe('THRESHOLD_NOT_MET');
      expect(res1.counter).toBe(1);

      // Tap 2
      const res2 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 3,
      });
      expect(res2.status).toBe(AD_STATES.FAILED);
      expect(res2.reason).toBe('THRESHOLD_NOT_MET');
      expect(res2.counter).toBe(2);

      // Tap 3
      const res3 = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 3,
      });
      expect(res3.status).toBe(AD_STATES.COMPLETED);
      expect(interstitialFrequencyService.getCounter()).toBe(0);
      expect(interstitialFrequencyService.getSessionCount()).toBe(1);
    });

    test('Provider failure releases lock and keeps opportunity counter reset', async () => {
      // Set mock provider to fail
      const failingProvider = {
        getType: () => 'failing_mock',
        isConfigured: () => true,
        showInterstitial: jest.fn().mockRejectedValue(new Error('AdMob SDK load error')),
      };

      adService.setProviderOverride(failingProvider);

      // Reach threshold on adTime = 1
      const res = await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
        screen: 'calculators',
        isOnline: true,
        isAdFree: false,
        adTime: 1,
      });

      expect(res.status).toBe(AD_STATES.FAILED);
      expect(res.reason).toContain('AdMob SDK load error');

      // Lock must be released
      expect(interstitialFrequencyService.isInterstitialShowing).toBe(false);

      // Counter must be at 0 (consumed) to prevent immediate retry loop
      expect(interstitialFrequencyService.getCounter()).toBe(0);

      // Cleanup override
      adService.setProviderOverride(null);
    });
  });
});

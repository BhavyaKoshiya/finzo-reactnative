import adDecisionEngine, { AD_DECISION_REASONS } from '../ads/adDecisionEngine';
import { adFrequencyService } from '../ads/adFrequencyService';
import { validateRealtimeConfig } from '../../config/realtimeConfigSchema';
import { DEFAULT_ADS_CONFIG } from '../../config/realtimeConfigDefaults';

describe('Phase 18.1 — Interstitial Monetization Balancing & Remote Frequency Control Tests', () => {
  beforeEach(() => {
    adFrequencyService.resetSession();
  });

  const baseConfig = {
    version: 1,
    ads: {
      ...DEFAULT_ADS_CONFIG,
      enabled: true,
      interstitial: {
        enabled: true,
        cooldownMinutes: 3,
        maxPerSession: 3,
      },
    },
  };

  test('1. Default Policy: cooldownMinutes = 3 and maxPerSession = 3', () => {
    expect(DEFAULT_ADS_CONFIG.interstitial.cooldownMinutes).toBe(3);
    expect(DEFAULT_ADS_CONFIG.interstitial.maxPerSession).toBe(3);
  });

  test('2. Impression Sequence: 3 impressions allowed across cooldowns; 4th blocked by session limit', () => {
    const t0 = new Date('2026-08-13T10:00:00Z');

    // 1st attempt at 10:00
    const res1 = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t0 });
    expect(res1.allowed).toBe(true);
    adFrequencyService.recordInterstitialImpression(t0);

    // 2nd attempt at 10:01 (1 min later -> BLOCKED by cooldown)
    const t1 = new Date('2026-08-13T10:01:00Z');
    const res2 = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t1 });
    expect(res2.allowed).toBe(false);
    expect(res2.reason).toBe('cooldown');

    // 2nd attempt at 10:03:01 (3 mins later -> ALLOWED)
    const t2 = new Date('2026-08-13T10:03:01Z');
    const res3 = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t2 });
    expect(res3.allowed).toBe(true);
    adFrequencyService.recordInterstitialImpression(t2);

    // 3rd attempt at 10:06:02 (3 mins later -> ALLOWED)
    const t3 = new Date('2026-08-13T10:06:02Z');
    const res4 = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t3 });
    expect(res4.allowed).toBe(true);
    adFrequencyService.recordInterstitialImpression(t3);

    // 4th attempt at 10:10:00 (4 mins later -> BLOCKED by session_limit)
    const t4 = new Date('2026-08-13T10:10:00Z');
    const res5 = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t4 });
    expect(res5.allowed).toBe(false);
    expect(res5.reason).toBe('session_limit');
  });

  test('3. Decision Precedence: Financial workflow override has absolute priority', () => {
    const t0 = new Date('2026-08-13T10:00:00Z');
    const freqStatus = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t0 });

    const decision = adDecisionEngine.canShowAd({
      adType: 'interstitial',
      screen: 'add_payment',
      isOnline: true,
      isAdFree: false,
      config: baseConfig,
      frequencyStatus: freqStatus,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
  });

  test('4. Decision Precedence: Ad-free entitlement suppresses interstitials regardless of session count', () => {
    const t0 = new Date('2026-08-13T10:00:00Z');
    const freqStatus = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3, now: t0 });

    const decision = adDecisionEngine.canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: true,
      config: baseConfig,
      frequencyStatus: freqStatus,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
  });

  test('5. Config Validation: Rejects out-of-bound or invalid types for cooldownMinutes and maxPerSession', () => {
    const invalidConfig1 = {
      version: 1,
      rewards: { dailyCheckIn: { enabled: true, rewardSchedule: [5] } },
      ads: {
        enabled: true,
        interstitial: {
          cooldownMinutes: -5, // Invalid negative
          maxPerSession: 3,
        },
      },
    };
    expect(validateRealtimeConfig(invalidConfig1).valid).toBe(false);

    const invalidConfig2 = {
      version: 1,
      rewards: { dailyCheckIn: { enabled: true, rewardSchedule: [5] } },
      ads: {
        enabled: true,
        interstitial: {
          cooldownMinutes: 3,
          maxPerSession: 25, // Exceeds max 20
        },
      },
    };
    expect(validateRealtimeConfig(invalidConfig2).valid).toBe(false);
  });
});

import adDecisionEngine, { AD_DECISION_REASONS, PROTECTED_FINANCIAL_SCREENS } from '../ads/adDecisionEngine';
import { rewardedAdSessionManager, SESSION_STATES } from '../ads/rewardedAdSessionManager';
import { adFrequencyService } from '../ads/adFrequencyService';
import { adMetricsService } from '../ads/adMetricsService';
import { adService } from '../adService';
import { AdProviderFactory } from '../adProviderFactory';
import { SimulatedAdProvider } from '../ads/simulatedAdProvider';
import { AD_PROVIDER_TYPES } from '../ads/adProviderTypes';
import { DEFAULT_ADS_CONFIG } from '../../config/realtimeConfigDefaults';

describe('Phase 17 — Monetization UX, Placement Optimization & Simulated Ad Experience Tests', () => {
  beforeEach(() => {
    adFrequencyService.resetSession();
    rewardedAdSessionManager.reset();
    adMetricsService.reset();
    adService.setProviderOverride(null);
    adService.setDevSimulationEnabled(true);
  });

  const sampleConfig = {
    version: 1,
    ads: {
      ...DEFAULT_ADS_CONFIG,
      enabled: true,
    },
  };

  test('1. Protected Screens (100% Ad-Free): All financial workflows return FINANCIAL_WORKFLOW', () => {
    const screensToTest = [
      'add_payment',
      'edit_payment',
      'delete_payment',
      'correct_balance',
      'add_loan',
      'edit_loan',
      'loan_private_details',
      'loan_notes',
      'loan_prepayment_simulator',
      'loan_payoff_planner',
      'loan_goals',
      'pdf_export',
    ];

    screensToTest.forEach((screen) => {
      const decision = adDecisionEngine.canShowAd({
        adType: 'banner',
        screen,
        isOnline: true,
        isAdFree: false,
        config: sampleConfig,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
    });
  });

  test('2. Screen Placement Matrix: Allowed placements permit ads', () => {
    // Home banner
    const homeRes = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });
    expect(homeRes.allowed).toBe(true);

    // Calculators banner
    const calcRes = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'calculators',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });
    expect(calcRes.allowed).toBe(true);

    // MyLoans banner
    const myLoansRes = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'myLoans',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });
    expect(myLoansRes.allowed).toBe(true);

    // LoanDetails native
    const loanDetailsRes = adDecisionEngine.canShowAd({
      adType: 'native',
      screen: 'loanDetails',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });
    expect(loanDetailsRes.allowed).toBe(true);
  });

  test('3. Ad-Free Suppression: Ordinary ads suppressed when adFreeUntil > now', () => {
    const bannerRes = adDecisionEngine.canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: true,
      config: sampleConfig,
    });
    expect(bannerRes.allowed).toBe(false);
    expect(bannerRes.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);

    const nativeRes = adDecisionEngine.canShowAd({
      adType: 'native',
      screen: 'loanDetails',
      isOnline: true,
      isAdFree: true,
      config: sampleConfig,
    });
    expect(nativeRes.allowed).toBe(false);
    expect(nativeRes.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);

    const interstitialRes = adDecisionEngine.canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: true,
      config: sampleConfig,
    });
    expect(interstitialRes.allowed).toBe(false);
    expect(interstitialRes.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
  });

  test('4. Local Development Metrics & Debugger Logging', () => {
    adService.canShowAd({
      adType: 'banner',
      placementId: 'home_banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });

    adService.canShowAd({
      adType: 'banner',
      placementId: 'payment_banner',
      screen: 'add_payment',
      isOnline: true,
      isAdFree: false,
      config: sampleConfig,
    });

    const logs = adMetricsService.getDecisionLogs();
    expect(logs.length).toBeGreaterThanOrEqual(2);

    // Latest log should be blocked by financial workflow
    expect(logs[0].screen).toBe('add_payment');
    expect(logs[0].allowed).toBe(false);
    expect(logs[0].reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
  });

  test('5. Rewarded Session ID Security & Single Claim Lock', () => {
    const sessionId = rewardedAdSessionManager.startSession('profile_rewarded');
    expect(sessionId).toMatch(/^rwd_sess_/);

    // Cannot claim before completion
    expect(rewardedAdSessionManager.claimRewardForSession(sessionId).success).toBe(false);

    // Mark complete
    expect(rewardedAdSessionManager.completeSession(sessionId)).toBe(true);

    // Claim reward once
    const claimRes = rewardedAdSessionManager.claimRewardForSession(sessionId);
    expect(claimRes.success).toBe(true);
    expect(claimRes.session.status).toBe(SESSION_STATES.REWARDED);

    // Duplicate claim attempt fails
    expect(rewardedAdSessionManager.claimRewardForSession(sessionId).success).toBe(false);
  });

  test('6. Production Safety Guard: NoAdProvider returned when devSimulationEnabled is false', () => {
    const prodProvider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: false,
      providerOverride: null,
    });

    expect(prodProvider.getType()).toBe(AD_PROVIDER_TYPES.NO_AD);
    expect(prodProvider instanceof SimulatedAdProvider).toBe(false);
  });
});

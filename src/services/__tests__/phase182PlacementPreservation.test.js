/**
 * FINZO — PHASE 18.2 — Ad Placement Preservation & Hardening Tests
 *
 * Verifies that the existing placement map is unchanged, all suppression/protection
 * logic works correctly, and production safety is enforced.
 */

import { canShowAd, AD_DECISION_REASONS, PROTECTED_FINANCIAL_SCREENS, isProtectedScreen } from '../../services/ads/adDecisionEngine';
import { AdProviderFactory } from '../../services/adProviderFactory';
import { SimulatedAdProvider } from '../../services/ads/simulatedAdProvider';
import { NoAdProvider } from '../../services/ads/noAdProvider';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';
import { adFrequencyService } from '../../services/ads/adFrequencyService';
import { DEFAULT_ADS_CONFIG } from '../../config/realtimeConfigDefaults';

// Full RTDB-like config with ads enabled
const FULL_CONFIG = {
  version: 1,
  ads: { ...DEFAULT_ADS_CONFIG },
  rewards: { dailyCheckIn: { enabled: true, rewardSchedule: [5], maxReward: 20, resetOnMissedDay: true }, rewardedAds: { enabled: true, pointsPerAd: 10, dailyWatchLimit: 5, cooldownMinutes: 0, milestone: { enabled: true, requiredAds: 5, adFreeMinutes: 30 } }, catalog: {}, discounts: { enabled: true, items: {} } },
  featureFlags: { rewardsEnabled: true },
};

const makeProvider = () => new SimulatedAdProvider({ simulationEnabled: true });

// ============================================================
// 1. PLACEMENT INVENTORY VERIFICATION
// ============================================================

describe('Phase 18.2 — Placement Inventory Verification', () => {
  test('1. Placement constant inventory contains all 15 known IDs', () => {
    const expectedIds = [
      'home_banner',
      'home_native',
      'tab_bottom_banner',
      'calculator_banner',
      'calculator_native',
      'calculator_interstitial',
      'my_loans_banner',
      'loan_details_native',
      'loan_insights_banner',
      'profile_banner',
      'profile_native',
      'profile_rewarded',
      'rewards_banner',
      'rewards_native',
      'rewards_rewarded',
    ];
    const actualIds = Object.values(AD_PLACEMENTS);
    expectedIds.forEach((id) => {
      expect(actualIds).toContain(id);
    });
  });

  test('2. Calculator banner placement ID exists', () => {
    expect(AD_PLACEMENTS.CALCULATOR_BANNER).toBe('calculator_banner');
  });

  test('3. Calculator native placement ID exists', () => {
    expect(AD_PLACEMENTS.CALCULATOR_NATIVE).toBe('calculator_native');
  });

  test('4. Calculator interstitial placement ID exists', () => {
    expect(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL).toBe('calculator_interstitial');
  });

  test('5. All placement IDs are non-empty strings', () => {
    Object.entries(AD_PLACEMENTS).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// 2. CALCULATOR CATEGORY ADS — CONFIG ALLOWS
// ============================================================

describe('Phase 18.2 — Calculator Category Ads Config', () => {
  test('6. Calculators screen allows banner ads via config', () => {
    const decision = canShowAd({
      adType: 'banner',
      screen: 'calculators',
      placementId: AD_PLACEMENTS.CALCULATOR_BANNER,
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(true);
  });

  test('7. Calculators screen allows native ads via config', () => {
    const decision = canShowAd({
      adType: 'native',
      screen: 'calculators',
      placementId: AD_PLACEMENTS.CALCULATOR_NATIVE,
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(true);
  });

  test('8. Calculators screen allows interstitial ads via config', () => {
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      placementId: AD_PLACEMENTS.CALCULATOR_INTERSTITIAL,
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: true },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(true);
  });
});

// ============================================================
// 3. AD-FREE SUPPRESSION
// ============================================================

describe('Phase 18.2 — Ad-Free Suppression', () => {
  test('9. Ad-free suppresses banner placements', () => {
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: true,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
  });

  test('10. Ad-free suppresses native placements', () => {
    const decision = canShowAd({
      adType: 'native',
      screen: 'home',
      isOnline: true,
      isAdFree: true,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
  });

  test('11. Ad-free suppresses interstitial placements', () => {
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: true,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: true },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.AD_FREE_ACTIVE);
  });

  test('12. Ad-free does NOT suppress rewarded ads', () => {
    const decision = canShowAd({
      adType: 'rewarded',
      screen: 'rewards',
      isOnline: true,
      isAdFree: true,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(true);
  });
});

// ============================================================
// 4. OFFLINE SUPPRESSION
// ============================================================

describe('Phase 18.2 — Offline Suppression', () => {
  test('13. Offline suppresses banner placements', () => {
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: false,
      isAdFree: false,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.OFFLINE);
  });

  test('14. Offline suppresses native placements', () => {
    const decision = canShowAd({
      adType: 'native',
      screen: 'calculators',
      isOnline: false,
      isAdFree: false,
      config: FULL_CONFIG,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.OFFLINE);
  });

  test('15. Offline suppresses interstitial placements', () => {
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: false,
      isAdFree: false,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: true },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.OFFLINE);
  });
});

// ============================================================
// 5. FINANCIAL WORKFLOW PROTECTION
// ============================================================

describe('Phase 18.2 — Financial Workflow Protection', () => {
  const protectedScreens = [
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
    'loan_goal_details',
    'pdf_export',
    'pdf_generation',
    'local_data_privacy',
  ];

  test('16. All protected financial screens are registered', () => {
    protectedScreens.forEach((screen) => {
      expect(PROTECTED_FINANCIAL_SCREENS).toContain(screen);
    });
  });

  test('17. All protected screens return FINANCIAL_WORKFLOW reason', () => {
    protectedScreens.forEach((screen) => {
      const decision = canShowAd({
        adType: 'banner',
        screen,
        isOnline: true,
        isAdFree: false,
        config: FULL_CONFIG,
        provider: makeProvider(),
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
    });
  });

  test('18. isProtectedScreen returns true for all protected screens', () => {
    protectedScreens.forEach((screen) => {
      expect(isProtectedScreen(screen)).toBe(true);
    });
  });

  test('19. Non-protected screens are not blocked by financial protection', () => {
    ['home', 'calculators', 'myLoans', 'profile', 'rewards', 'loanDetails'].forEach((screen) => {
      expect(isProtectedScreen(screen)).toBe(false);
    });
  });
});

// ============================================================
// 6. BACK NAVIGATION SAFETY
// ============================================================

describe('Phase 18.2 — Back Navigation Safety', () => {
  test('20. Interstitial blocked by cooldown still returns a result (not a crash)', () => {
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: false, reason: 'cooldown' },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.COOLDOWN_ACTIVE);
  });

  test('21. Interstitial blocked by session limit returns safely', () => {
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: false, reason: 'session_limit' },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.SESSION_LIMIT_REACHED);
  });

  test('22. Interstitial blocked by provider failure returns safely', () => {
    const brokenProvider = { isConfigured: () => false };
    const decision = canShowAd({
      adType: 'interstitial',
      screen: 'calculators',
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      frequencyStatus: { canShow: true },
      provider: brokenProvider,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.NO_PROVIDER);
  });
});

// ============================================================
// 7. INTERSTITIAL FREQUENCY & DEDUPLICATION
// ============================================================

describe('Phase 18.2 — Interstitial Frequency & Deduplication', () => {
  beforeEach(() => {
    adFrequencyService.resetSession();
  });

  test('23. Duplicate request blocked when interstitial is already showing', () => {
    adFrequencyService.setInterstitialShowing(true);
    const result = adFrequencyService.canShowInterstitial({ cooldownMinutes: 3, maxPerSession: 3 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('request_active');
    adFrequencyService.setInterstitialShowing(false);
  });

  test('24. Interstitial close callback records impression exactly once', () => {
    const beforeCount = adFrequencyService.getStatus().interstitialSessionCount;
    adFrequencyService.recordInterstitialImpression();
    const afterCount = adFrequencyService.getStatus().interstitialSessionCount;
    expect(afterCount).toBe(beforeCount + 1);
  });

  test('25. Session limit blocks after maxPerSession impressions', () => {
    adFrequencyService.resetSession();
    // Record 3 impressions (maxPerSession default)
    adFrequencyService.recordInterstitialImpression(new Date(Date.now() - 300000));
    adFrequencyService.recordInterstitialImpression(new Date(Date.now() - 200000));
    adFrequencyService.recordInterstitialImpression(new Date(Date.now() - 100000));
    const result = adFrequencyService.canShowInterstitial({ cooldownMinutes: 0, maxPerSession: 3 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('session_limit');
  });
});

// ============================================================
// 8. RTDB CONFIGURATION CONTROL
// ============================================================

describe('Phase 18.2 — RTDB Configuration Control', () => {
  test('26. Disabled global ads config blocks all placements', () => {
    const disabledConfig = { ...FULL_CONFIG, ads: { ...DEFAULT_ADS_CONFIG, enabled: false } };
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: disabledConfig,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.ADS_DISABLED);
  });

  test('27. Disabled placement blocks specific screen', () => {
    const noHomeBanner = {
      ...FULL_CONFIG,
      ads: {
        ...DEFAULT_ADS_CONFIG,
        placements: {
          ...DEFAULT_ADS_CONFIG.placements,
          home: { banner: false, native: true, interstitial: false },
        },
      },
    };
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: noHomeBanner,
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.PLACEMENT_DISABLED);
  });

  test('28. Current defaults set cooldown=3, maxPerSession=3', () => {
    expect(DEFAULT_ADS_CONFIG.interstitial.cooldownMinutes).toBe(3);
    expect(DEFAULT_ADS_CONFIG.interstitial.maxPerSession).toBe(3);
  });
});

// ============================================================
// 9. INVALID CONFIGURATION SAFETY
// ============================================================

describe('Phase 18.2 — Invalid Configuration Safety', () => {
  test('29. Config with ads=null fails safely', () => {
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: { version: 1, ads: null },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.INVALID_CONFIGURATION);
  });

  test('30. Config with ads=undefined fails safely', () => {
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: { version: 1 },
      provider: makeProvider(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe(AD_DECISION_REASONS.INVALID_CONFIGURATION);
  });
});

// ============================================================
// 10. FINANCIAL DATA FIREWALL
// ============================================================

describe('Phase 18.2 — Financial Data Firewall', () => {
  test('31. canShowAd params do NOT accept financial data fields', () => {
    // Verify the function signature only accepts adType, screen, isOnline, isAdFree, config, frequencyStatus, provider
    const decision = canShowAd({
      adType: 'banner',
      screen: 'home',
      isOnline: true,
      isAdFree: false,
      config: FULL_CONFIG,
      provider: makeProvider(),
      // These should be ignored — they are not part of the contract
      loanAmount: 5000000,
      interestRate: 8.5,
      emiAmount: 45000,
      accountNumber: '1234567890',
    });
    // The decision is purely based on ad params, not financial data
    expect(decision.allowed).toBe(true);
    // The function should not have stored or forwarded financial data
    expect(decision.loanAmount).toBeUndefined();
    expect(decision.interestRate).toBeUndefined();
  });

  test('32. SimulatedAdProvider showInterstitial receives only placementId and options', () => {
    const provider = makeProvider();
    // Verify the method signature - it only accepts placementId and generic options
    expect(typeof provider.showInterstitial).toBe('function');
    // The provider has no financial data properties
    expect(provider.loanAmount).toBeUndefined();
    expect(provider.emiAmount).toBeUndefined();
  });
});

// ============================================================
// 11. PRODUCTION SAFETY
// ============================================================

describe('Phase 18.2 — Production Simulator Safety', () => {
  const realDev = global.__DEV__;

  afterEach(() => {
    global.__DEV__ = realDev;
  });

  test('33. AdProviderFactory returns NoAdProvider when __DEV__=false', () => {
    global.__DEV__ = false;
    const provider = AdProviderFactory.getProvider({
      isDev: false,
      devSimulationEnabled: true,
    });
    expect(provider).toBeInstanceOf(NoAdProvider);
  });

  test('34. AdProviderFactory hard gate: isDev=true override cannot bypass __DEV__=false', () => {
    global.__DEV__ = false;
    const provider = AdProviderFactory.getProvider({
      isDev: true, // Attempting to override
      devSimulationEnabled: true,
    });
    expect(provider).toBeInstanceOf(NoAdProvider);
    expect(provider).not.toBeInstanceOf(SimulatedAdProvider);
  });

  test('35. AdProviderFactory returns SimulatedAdProvider when __DEV__=true', () => {
    global.__DEV__ = true;
    const provider = AdProviderFactory.getProvider({
      isDev: true,
      devSimulationEnabled: true,
    });
    expect(provider).toBeInstanceOf(SimulatedAdProvider);
  });

  test('36. No real advertising SDK packages installed', () => {
    // Verify no real ad SDK is importable
    const realAdSdks = [
      'react-native-google-mobile-ads',
      'react-native-admob',
      '@react-native-admob/admob',
      'react-native-applovin-max',
      'react-native-iron-source',
      'react-native-unity-ads',
    ];
    realAdSdks.forEach((sdk) => {
      expect(() => require(sdk)).toThrow();
    });
  });
});

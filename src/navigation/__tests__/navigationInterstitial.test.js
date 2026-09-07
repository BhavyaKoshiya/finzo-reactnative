import { selectPlacementAdConfig, isAdAllowedForPlacement } from '../../config/realtimeConfigSelectors';
import { DEFAULT_REALTIME_CONFIG } from '../../config/realtimeConfigDefaults';
import { isProtectedScreen, canShowAd, AD_DECISION_REASONS } from '../../services/ads/adDecisionEngine';
import { interstitialFrequencyService } from '../../services/ads/interstitialFrequencyService';

describe('Navigation Interstitial & Placement Architecture', () => {
  test('1. selectPlacementAdConfig maps calculator route names to calculators placement', () => {
    const config = DEFAULT_REALTIME_CONFIG;
    const calcScreens = [
      'SIPCalculator',
      'FDCalculator',
      'RDCalculator',
      'ROICalculator',
      'CAGRCalculator',
      'GSTCalculator',
      'SimpleInterestCalculator',
      'CompoundInterestCalculator',
      'PercentageCalculator',
      'EMICalculator',
      'HomeLoanEMI',
      'PersonalLoanEMI',
    ];

    calcScreens.forEach((screen) => {
      const placement = selectPlacementAdConfig(config, screen);
      expect(placement.interstitial).toBe(true);
      expect(isAdAllowedForPlacement(config, screen, 'interstitial')).toBe(true);
    });
  });

  test('2. selectPlacementAdConfig maps navigation route to navigation placement with interstitial enabled', () => {
    const config = DEFAULT_REALTIME_CONFIG;
    const navPlacement = selectPlacementAdConfig(config, 'navigation');
    expect(navPlacement.interstitial).toBe(true);
    expect(isAdAllowedForPlacement(config, 'navigation', 'interstitial')).toBe(true);
  });

  test('3. Protected financial screens are barred from interstitial ads', () => {
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

    protectedScreens.forEach((screen) => {
      expect(isProtectedScreen(screen)).toBe(true);
      expect(interstitialFrequencyService.isActionEligible(screen)).toBe(false);

      const decision = canShowAd({
        adType: 'interstitial',
        screen,
        isOnline: true,
        isAdFree: false,
        config: DEFAULT_REALTIME_CONFIG,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe(AD_DECISION_REASONS.FINANCIAL_WORKFLOW);
    });
  });

  test('4. interstitialFrequencyService recognizes navigation and tab changes as eligible', () => {
    expect(interstitialFrequencyService.isActionEligible('navigation')).toBe(true);
    expect(interstitialFrequencyService.isActionEligible('navigation_change')).toBe(true);
    expect(interstitialFrequencyService.isActionEligible('tab_change')).toBe(true);
    expect(interstitialFrequencyService.isActionEligible('calculators')).toBe(true);
  });
});

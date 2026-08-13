/**
 * Centralized Placement IDs for Finzo Advertising Architecture.
 * Prevents string literal scattering across UI components.
 * Future real ad unit IDs (AdMob / AppLovin / Unity) map centrally to these placement IDs.
 */
export const AD_PLACEMENTS = {
  HOME_BANNER: 'home_banner',
  HOME_NATIVE: 'home_native',

  CALCULATOR_BANNER: 'calculator_banner',
  CALCULATOR_NATIVE: 'calculator_native',
  CALCULATOR_INTERSTITIAL: 'calculator_interstitial',

  MY_LOANS_BANNER: 'my_loans_banner',
  LOAN_DETAILS_NATIVE: 'loan_details_native',
  LOAN_INSIGHTS_BANNER: 'loan_insights_banner',

  PROFILE_BANNER: 'profile_banner',
  PROFILE_NATIVE: 'profile_native',
  PROFILE_REWARDED: 'profile_rewarded',

  REWARDS_BANNER: 'rewards_banner',
  REWARDS_NATIVE: 'rewards_native',
  REWARDS_REWARDED: 'rewards_rewarded',
};

export default AD_PLACEMENTS;

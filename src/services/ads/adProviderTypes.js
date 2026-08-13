/**
 * Advertising Provider Types and State Enum definitions.
 * Provides type-safe definitions for ad lifecycle management and provider selection.
 */
export const AD_PROVIDER_TYPES = {
  NO_AD: 'no_ad',
  SIMULATED: 'simulated',
  MOCK_REAL: 'mock_real',
  APPROVED_REAL: 'approved_real',
};

export const AD_TYPES = {
  BANNER: 'banner',
  NATIVE: 'native',
  INTERSTITIAL: 'interstitial',
  REWARDED: 'rewarded',
};

export const AD_STATES = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  LOADING: 'LOADING',
  READY: 'READY',
  SHOWING: 'SHOWING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
};

export default {
  AD_PROVIDER_TYPES,
  AD_TYPES,
  AD_STATES,
};

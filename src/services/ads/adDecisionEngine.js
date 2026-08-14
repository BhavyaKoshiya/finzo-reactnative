import { selectAdConfig, isAdAllowedForPlacement } from '../../config/realtimeConfigSelectors';

/**
 * Ad Decision Engine Reasons Enum
 */
export const AD_DECISION_REASONS = {
  ALLOWED: 'ONLINE',
  OFFLINE: 'OFFLINE',
  ADS_DISABLED: 'ADS_DISABLED',
  PLACEMENT_DISABLED: 'PLACEMENT_DISABLED',
  AD_FREE_ACTIVE: 'AD_FREE_ACTIVE',
  THRESHOLD_NOT_MET: 'THRESHOLD_NOT_MET',
  COOLDOWN_ACTIVE: 'COOLDOWN_ACTIVE',
  SESSION_LIMIT_REACHED: 'SESSION_LIMIT_REACHED',
  REQUEST_ACTIVE: 'REQUEST_ACTIVE',
  FINANCIAL_WORKFLOW: 'FINANCIAL_WORKFLOW',
  NO_PROVIDER: 'NO_PROVIDER',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
};

/**
 * Central List of Protected Financial Workflow Screens.
 * These screens are ALWAYS 100% ad-free to protect user trust during sensitive tasks.
 */
export const PROTECTED_FINANCIAL_SCREENS = [
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

/**
 * Checks if a given screen name belongs to protected financial workflows.
 * @param {string} screen
 * @returns {boolean}
 */
export const isProtectedScreen = (screen) => {
  if (!screen || typeof screen !== 'string') return false;
  const normalized = screen.toLowerCase().trim();
  return PROTECTED_FINANCIAL_SCREENS.includes(normalized);
};

/**
 * Single Central Ad Decision Pipeline.
 * Evaluates all authorization, entitlement, connectivity, frequency, and safety constraints.
 *
 * @param {Object} params
 * @param {string} params.adType - 'banner' | 'native' | 'interstitial' | 'rewarded'
 * @param {string} [params.placementId]
 * @param {string} [params.screen]
 * @param {boolean} [params.isOnline]
 * @param {boolean} [params.isAdFree]
 * @param {Object} [params.config]
 * @param {Object} [params.frequencyStatus] - { canShow }
 * @param {Object} [params.provider] - Active provider instance
 * @returns {{ allowed: boolean, reason: string }}
 */
export const canShowAd = (params = {}) => {
  const {
    adType = 'banner',
    screen,
    isOnline = true,
    isAdFree = false,
    config,
    frequencyStatus = {},
    provider,
  } = params;

  // 0. INVALID CONFIGURATION CHECK
  if (config && (config.ads === null || config.ads === undefined)) {
    return { allowed: false, reason: AD_DECISION_REASONS.INVALID_CONFIGURATION };
  }

  // 1. FINANCIAL WORKFLOW PROTECTION (Highest priority for user trust)
  if (screen && isProtectedScreen(screen)) {
    return { allowed: false, reason: AD_DECISION_REASONS.FINANCIAL_WORKFLOW };
  }

  // 2. AD-FREE ENTITLEMENT CHECK (Ordinary ads suppressed when active)
  if (isAdFree && adType !== 'rewarded') {
    return { allowed: false, reason: AD_DECISION_REASONS.AD_FREE_ACTIVE };
  }

  // 3. CONNECTIVITY REQUIREMENT (Ads require internet connection)
  if (isOnline === false) {
    return { allowed: false, reason: AD_DECISION_REASONS.OFFLINE };
  }

  // 4. REMOTE CONFIGURATION GATING
  const adConfig = selectAdConfig(config);
  if (!adConfig) {
    return { allowed: false, reason: AD_DECISION_REASONS.INVALID_CONFIGURATION };
  }

  // Allow test override when explicitly passing enabled or in mock test environment
  const isGlobalEnabled = adConfig.enabled !== false;
  if (!isGlobalEnabled) {
    return { allowed: false, reason: AD_DECISION_REASONS.ADS_DISABLED };
  }

  if (screen && !isAdAllowedForPlacement(config, screen, adType)) {
    return { allowed: false, reason: AD_DECISION_REASONS.PLACEMENT_DISABLED };
  }

  // 5. INTERSTITIAL FREQUENCY & THRESHOLD CHECKS
  if (adType === 'interstitial') {
    if (frequencyStatus.canShow === false) {
      if (frequencyStatus.reason === 'THRESHOLD_NOT_MET') {
        return { allowed: false, reason: AD_DECISION_REASONS.THRESHOLD_NOT_MET };
      }
      if (frequencyStatus.reason === 'session_limit' || frequencyStatus.reason === 'SESSION_LIMIT_REACHED') {
        return { allowed: false, reason: AD_DECISION_REASONS.SESSION_LIMIT_REACHED };
      }
      if (frequencyStatus.reason === 'request_active' || frequencyStatus.reason === 'REQUEST_ACTIVE') {
        return { allowed: false, reason: AD_DECISION_REASONS.REQUEST_ACTIVE };
      }
      if (frequencyStatus.reason === 'cooldown') {
        return { allowed: false, reason: AD_DECISION_REASONS.COOLDOWN_ACTIVE };
      }
      return { allowed: false, reason: AD_DECISION_REASONS.THRESHOLD_NOT_MET };
    }
  }

  // 6. PROVIDER AVAILABILITY CHECK
  if (provider && typeof provider.isConfigured === 'function') {
    if (!provider.isConfigured()) {
      return { allowed: false, reason: AD_DECISION_REASONS.NO_PROVIDER };
    }
  }

  return { allowed: true, reason: AD_DECISION_REASONS.ALLOWED };
};

export default {
  AD_DECISION_REASONS,
  PROTECTED_FINANCIAL_SCREENS,
  isProtectedScreen,
  canShowAd,
};

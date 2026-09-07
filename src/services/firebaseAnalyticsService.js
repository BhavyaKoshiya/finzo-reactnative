import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  logScreenView as firebaseLogScreenView,
} from '@react-native-firebase/analytics';
import logger from './logger';

/**
 * Allowed Non-Financial Analytics Event Names
 */
export const ANALYTICS_EVENTS = {
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  CALCULATOR_OPENED: 'calculator_opened',
  CALCULATOR_COMPLETED: 'calculator_completed',
  LOAN_CREATED: 'loan_created',
  LOAN_DELETED: 'loan_deleted',
  PAYMENT_RECORDED: 'payment_recorded',
  GOAL_CREATED: 'goal_created',
  PDF_EXPORTED: 'pdf_exported',
  // Legacy / Product Events
  REWARDED_AD_STARTED: 'rewarded_ad_started',
  REWARDED_AD_COMPLETED: 'rewarded_ad_completed',
  AD_FREE_ACTIVATED: 'ad_free_activated',
  UPDATE_PROMPT_SHOWN: 'update_prompt_shown',
  UPDATE_CLICKED: 'update_clicked',

  // 1. Interstitial Ads (Separate Format Events)
  INTERSTITIAL_AD_SHOWN: 'interstitial_ad_shown',
  INTERSTITIAL_AD_FAILED: 'interstitial_ad_failed',
  INTERSTITIAL_AD_DISMISSED: 'interstitial_ad_dismissed',
  INTERSTITIAL_AD_SUPPRESSED: 'interstitial_ad_suppressed',

  // 2. Rewarded Ads (Separate Format Events)
  REWARDED_AD_REWARD_CLAIMED: 'rewarded_ad_reward_claimed',
  REWARDED_AD_FAILED: 'rewarded_ad_failed',
  REWARDED_AD_SUPPRESSED: 'rewarded_ad_suppressed',

  // 3. Banner Ads (Separate Format Events)
  BANNER_AD_LOADED: 'banner_ad_loaded',
  BANNER_AD_FAILED: 'banner_ad_failed',
  BANNER_AD_CLICKED: 'banner_ad_clicked',
  BANNER_AD_SUPPRESSED: 'banner_ad_suppressed',

  // 4. Native Ads (Separate Format Events)
  NATIVE_AD_LOADED: 'native_ad_loaded',
  NATIVE_AD_FAILED: 'native_ad_failed',
  NATIVE_AD_CLICKED: 'native_ad_clicked',
  NATIVE_AD_SUPPRESSED: 'native_ad_suppressed',
};

/**
 * Strict Forbidden Financial & Sensitive Keys Blocklist.
 * These keys are NEVER allowed in analytics parameters — they represent
 * financial amounts, account details, or private information that must
 * never leave the device.
 */
export const FORBIDDEN_FINANCIAL_KEYS = new Set([
  'amount',
  'balance',
  'emi',
  'emiamount',
  'emi_amount',
  'interest',
  'interestrate',
  'interest_rate',
  'principal',
  'loanamount',
  'loan_amount',
  'totalinterest',
  'total_interest',
  'totalpayment',
  'total_payment',
  'monthlyemi',
  'monthly_emi',
  'investmentamount',
  'investment_amount',
  'maturityamount',
  'maturity_amount',
  'sipamount',
  'sip_amount',
  'fdamount',
  'fd_amount',
  'rdamount',
  'rd_amount',
  'roi',
  'returnrate',
  'return_rate',
  'salary',
  'income',
  'tax',
  'gst',
  'accountnumber',
  'account_number',
  'account',
  'note',
  'notes',
  'title',
  'description',
  'privatedetails',
  'private_details',
  'password',
  'pin',
  'otp',
  'credentials',
  'secret',
  'data',
  'payload',
  'outstanding',
  'outstandingbalance',
  'outstanding_balance',
]);

/**
 * Sanitizes analytics parameters by stripping any forbidden financial/sensitive keys.
 * All remaining string values are truncated to 100 characters.
 *
 * @param {Object} params - Raw analytics event parameters
 * @returns {Object} sanitized - Safe event parameters
 */
export const sanitizeAnalyticsParams = (params = {}) => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return {};
  }

  const sanitized = {};

  Object.entries(params).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();

    if (FORBIDDEN_FINANCIAL_KEYS.has(lowerKey)) {
      if (__DEV__) {
        logger.warn(`FirebaseAnalyticsService: Blocked financial key '${key}' from analytics payload`);
      }
      return;
    }

    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      sanitized[key] = value.substring(0, 100);
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'number') {
      // Block large numeric values that could represent money amounts
      if (Math.abs(value) > 9999) {
        if (__DEV__) {
          logger.warn(`FirebaseAnalyticsService: Blocked large numeric value for key '${key}'`);
        }
        return;
      }
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      if (__DEV__) {
        logger.warn(`FirebaseAnalyticsService: Stripped nested object key '${key}'`);
      }
    }
  });

  return sanitized;
};

class FirebaseAnalyticsService {
  constructor() {
    this.analyticsInstance = null;
  }

  /**
   * Resolves the Firebase Analytics instance using the modular v26 API.
   */
  _getAnalytics() {
    if (!this.analyticsInstance) {
      try {
        this.analyticsInstance = getAnalytics();
      } catch (err) {
        if (__DEV__) {
          logger.warn('FirebaseAnalyticsService: Failed to resolve instance', { error: err?.message });
        }
      }
    }
    return this.analyticsInstance;
  }

  /**
   * Logs a sanitized product-level analytics event.
   * @param {string} eventName
   * @param {Object} [params={}]
   * @returns {Promise<boolean>}
   */
  async logEvent(eventName, params = {}) {
    if (!eventName || typeof eventName !== 'string') {
      return false;
    }

    const sanitized = sanitizeAnalyticsParams(params);

    try {
      const instance = this._getAnalytics();
      if (instance) {
        await firebaseLogEvent(instance, eventName, sanitized);
        return true;
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn(`FirebaseAnalyticsService.logEvent failed for '${eventName}'`, { error: err?.message });
      }
    }

    return false;
  }

  /**
   * Safe screen view tracking helper.
   * @param {string} screenName
   * @param {string} [screenClass]
   */
  async logScreenView(screenName, screenClass = 'Screen') {
    try {
      const instance = this._getAnalytics();
      if (instance) {
        await firebaseLogScreenView(instance, {
          screen_name: String(screenName || 'Unknown').substring(0, 60),
          screen_class: String(screenClass || 'Screen').substring(0, 60),
        });
        return true;
      }
    } catch (err) {
      if (__DEV__) {
        logger.warn('FirebaseAnalyticsService.logScreenView failed', { error: err?.message });
      }
    }
    return false;
  }

  async logCalculatorOpened(calculatorType) {
    return this.logEvent(ANALYTICS_EVENTS.CALCULATOR_OPENED, {
      calculator_type: String(calculatorType || 'generic').substring(0, 40),
    });
  }

  async logCalculatorCompleted(calculatorType) {
    return this.logEvent(ANALYTICS_EVENTS.CALCULATOR_COMPLETED, {
      calculator_type: String(calculatorType || 'generic').substring(0, 40),
    });
  }

  async logLoanCreated(loanType) {
    return this.logEvent(ANALYTICS_EVENTS.LOAN_CREATED, {
      loan_type: String(loanType || 'other').substring(0, 40),
    });
  }

  async logLoanDeleted(loanType) {
    return this.logEvent(ANALYTICS_EVENTS.LOAN_DELETED, {
      loan_type: String(loanType || 'other').substring(0, 40),
    });
  }

  async logPaymentRecorded(paymentType) {
    return this.logEvent(ANALYTICS_EVENTS.PAYMENT_RECORDED, {
      payment_type: String(paymentType || 'regular_emi').substring(0, 40),
    });
  }

  async logGoalCreated(goalType) {
    return this.logEvent(ANALYTICS_EVENTS.GOAL_CREATED, {
      goal_type: String(goalType || 'prepayment').substring(0, 40),
    });
  }

  async logPdfExported(reportType) {
    return this.logEvent(ANALYTICS_EVENTS.PDF_EXPORTED, {
      report_type: String(reportType || 'loan_statement').substring(0, 40),
    });
  }

  // 1. Rewarded Ad Events
  async logRewardedAdStarted(placementId, screen = 'profile') {
    return this.logEvent(ANALYTICS_EVENTS.REWARDED_AD_STARTED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'profile').substring(0, 40),
    });
  }

  async logRewardedAdCompleted(placementId, screen = 'profile') {
    return this.logEvent(ANALYTICS_EVENTS.REWARDED_AD_COMPLETED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'profile').substring(0, 40),
    });
  }

  async logRewardedAdRewardClaimed({ placementId, points, durationMinutes } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.REWARDED_AD_REWARD_CLAIMED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      points: typeof points === 'number' ? points : 0,
      duration_minutes: typeof durationMinutes === 'number' ? durationMinutes : 0,
    });
  }

  async logRewardedAdFailed({ placementId, screen = 'profile', reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.REWARDED_AD_FAILED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'profile').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  async logRewardedAdSuppressed({ placementId, screen = 'profile', reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.REWARDED_AD_SUPPRESSED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'profile').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  // 2. Interstitial Ad Events
  async logInterstitialAdShown({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.INTERSTITIAL_AD_SHOWN, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logInterstitialAdFailed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.INTERSTITIAL_AD_FAILED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  async logInterstitialAdDismissed({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.INTERSTITIAL_AD_DISMISSED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logInterstitialAdSuppressed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.INTERSTITIAL_AD_SUPPRESSED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  // 3. Banner Ad Events
  async logBannerAdLoaded({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.BANNER_AD_LOADED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logBannerAdFailed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.BANNER_AD_FAILED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  async logBannerAdClicked({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.BANNER_AD_CLICKED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logBannerAdSuppressed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.BANNER_AD_SUPPRESSED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  // 4. Native Ad Events
  async logNativeAdLoaded({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.NATIVE_AD_LOADED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logNativeAdFailed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.NATIVE_AD_FAILED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  async logNativeAdClicked({ placementId, screen } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.NATIVE_AD_CLICKED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
    });
  }

  async logNativeAdSuppressed({ placementId, screen, reason } = {}) {
    return this.logEvent(ANALYTICS_EVENTS.NATIVE_AD_SUPPRESSED, {
      placement_id: String(placementId || 'default').substring(0, 40),
      screen: String(screen || 'unknown').substring(0, 40),
      reason: String(reason || 'unknown').substring(0, 60),
    });
  }

  async logAdFreeActivated(durationMinutes = 30) {
    return this.logEvent(ANALYTICS_EVENTS.AD_FREE_ACTIVATED, {
      duration_minutes: durationMinutes,
    });
  }

  async logUpdatePromptShown(updateType = 'optional') {
    return this.logEvent(ANALYTICS_EVENTS.UPDATE_PROMPT_SHOWN, {
      update_type: String(updateType).substring(0, 20),
    });
  }

  async logUpdateClicked(updateType = 'optional') {
    return this.logEvent(ANALYTICS_EVENTS.UPDATE_CLICKED, {
      update_type: String(updateType).substring(0, 20),
    });
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();
export default firebaseAnalyticsService;

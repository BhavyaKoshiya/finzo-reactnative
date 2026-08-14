import { isProtectedScreen } from './adDecisionEngine';

/**
 * App-Side Interstitial Frequency Service.
 * Manages interstitial opportunity counting using the marketing JSON `adTime` parameter.
 *
 * Replaces fixed time cooldowns with deterministic opportunity-based threshold gating.
 * Example: `adTime: 3` triggers an interstitial on every 3rd eligible non-financial opportunity.
 *
 * State is strictly local in-memory (session-scoped) and NEVER uploaded to external servers.
 */

export const DEFAULT_AD_TIME = 3;
export const DEFAULT_MAX_PER_SESSION = 3;

/**
 * Registered list of eligible interstitial action contexts.
 */
export const INTERSTITIAL_ELIGIBLE_ACTIONS = [
  'calculators',
  'calculator_exit',
  'calculator_result',
  'info_screen_exit',
  'calculator_interstitial',
];

/**
 * Sanitizes and normalizes the `adTime` remote configuration parameter.
 * Must be a positive integer >= 1.
 * @param {*} rawAdTime
 * @returns {number}
 */
export const normalizeAdTime = (rawAdTime) => {
  if (rawAdTime === null || rawAdTime === undefined) {
    return DEFAULT_AD_TIME;
  }
  const parsed = Number(rawAdTime);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return DEFAULT_AD_TIME;
  }
  const intVal = Math.floor(parsed);
  return intVal >= 1 ? intVal : DEFAULT_AD_TIME;
};

export class InterstitialFrequencyService {
  constructor() {
    this.opportunityCounter = 0;
    this.sessionCount = 0;
    this.isInterstitialShowing = false;
    this.lastTriggerTimestamp = null;
  }

  /**
   * Checks whether a screen or action identifier is an eligible interstitial opportunity.
   * @param {string} action
   * @returns {boolean}
   */
  isActionEligible(action) {
    if (!action || typeof action !== 'string') return false;
    const normalized = action.toLowerCase().trim();

    // Financial workflows are strictly barred from counting
    if (isProtectedScreen(normalized)) {
      return false;
    }

    return INTERSTITIAL_ELIGIBLE_ACTIONS.includes(normalized) || normalized.includes('calculator');
  }

  /**
   * Evaluates current frequency status without mutating the counter.
   * @param {Object} options - { adTime, maxPerSession }
   * @returns {{ canShow: boolean, reason?: string, counter: number, target: number }}
   */
  checkFrequencyStatus(options = {}) {
    if (this.isInterstitialShowing) {
      return { canShow: false, reason: 'REQUEST_ACTIVE', counter: this.opportunityCounter };
    }

    const maxPerSession = typeof options.maxPerSession === 'number' ? options.maxPerSession : DEFAULT_MAX_PER_SESSION;
    if (this.sessionCount >= maxPerSession) {
      return { canShow: false, reason: 'SESSION_LIMIT_REACHED', counter: this.opportunityCounter };
    }

    const target = normalizeAdTime(options.adTime);
    const nextCount = this.opportunityCounter + 1;

    if (nextCount >= target) {
      return { canShow: true, counter: nextCount, target };
    }

    return { canShow: false, reason: 'THRESHOLD_NOT_MET', counter: nextCount, target };
  }

  /**
   * Evaluates an eligible opportunity, increments the counter, and triggers threshold reset when reached.
   *
   * Flow:
   * 1. If currently showing -> reject duplicate trigger.
   * 2. If session limit reached -> reject trigger.
   * 3. Increment opportunityCounter++.
   * 4. If opportunityCounter >= adTime -> trigger interstitial and reset opportunityCounter = 0.
   * 5. Else -> hold until next eligible opportunity.
   *
   * @param {Object} options - { adTime, maxPerSession }
   * @returns {{ triggered: boolean, reason?: string, counter: number, target: number, sessionCount: number }}
   */
  recordEligibleOpportunity(options = {}) {
    if (this.isInterstitialShowing) {
      return {
        triggered: false,
        reason: 'REQUEST_ACTIVE',
        counter: this.opportunityCounter,
        sessionCount: this.sessionCount,
      };
    }

    const maxPerSession = typeof options.maxPerSession === 'number' ? options.maxPerSession : DEFAULT_MAX_PER_SESSION;
    if (this.sessionCount >= maxPerSession) {
      return {
        triggered: false,
        reason: 'SESSION_LIMIT_REACHED',
        counter: this.opportunityCounter,
        sessionCount: this.sessionCount,
      };
    }

    const target = normalizeAdTime(options.adTime);
    this.opportunityCounter += 1;

    if (this.opportunityCounter >= target) {
      // Threshold reached! Trigger ad and reset opportunity counter
      this.opportunityCounter = 0;
      this.sessionCount += 1;
      this.lastTriggerTimestamp = new Date();
      this.isInterstitialShowing = true;

      return {
        triggered: true,
        counter: 0,
        target,
        sessionCount: this.sessionCount,
      };
    }

    return {
      triggered: false,
      reason: 'THRESHOLD_NOT_MET',
      counter: this.opportunityCounter,
      target,
      sessionCount: this.sessionCount,
    };
  }

  /**
   * Sets request lock status.
   * @param {boolean} showing
   */
  setInterstitialShowing(showing) {
    this.isInterstitialShowing = Boolean(showing);
  }

  /**
   * Manually resets the opportunity counter.
   */
  resetCounter() {
    this.opportunityCounter = 0;
  }

  /**
   * Resets all session metrics (e.g. app cold start or test harness).
   */
  resetSession() {
    this.opportunityCounter = 0;
    this.sessionCount = 0;
    this.isInterstitialShowing = false;
    this.lastTriggerTimestamp = null;
  }

  /**
   * Returns current opportunity counter value.
   * @returns {number}
   */
  getCounter() {
    return this.opportunityCounter;
  }

  /**
   * Returns current session count.
   * @returns {number}
   */
  getSessionCount() {
    return this.sessionCount;
  }
}

export const interstitialFrequencyService = new InterstitialFrequencyService();
export default interstitialFrequencyService;

/**
 * Ad Frequency Manager.
 * Controls interstitial cooldowns, session impression limits, and request deduplication locally.
 * STRICT PRIVACY GUARANTEE: Frequency tracking state is strictly local in-memory.
 * It is NEVER sent to Firebase, external servers, or tracked as user analytics.
 */
class AdFrequencyService {
  constructor() {
    this.lastInterstitialTimestamp = null;
    this.interstitialSessionCount = 0;
    this.isInterstitialShowing = false;
  }

  /**
   * Evaluates whether an interstitial ad impression is permitted under frequency rules.
   * @param {Object} options - { cooldownMinutes, maxPerSession, now }
   * @returns {{ allowed: boolean, reason?: string }}
   */
  canShowInterstitial(options = {}) {
    // Deduplication check: ignore concurrent requests if an interstitial is currently active
    if (this.isInterstitialShowing) {
      return { allowed: false, reason: 'request_active' };
    }

    const cooldownMinutes = Number(options.cooldownMinutes) ?? 10;
    const maxPerSession = Number(options.maxPerSession) ?? 1;
    const now = options.now instanceof Date ? options.now : new Date();

    // 1. Session Count Limit Check
    if (this.interstitialSessionCount >= maxPerSession) {
      return { allowed: false, reason: 'session_limit' };
    }

    // 2. Cooldown Duration Check
    if (this.lastInterstitialTimestamp) {
      const elapsedMs = now.getTime() - this.lastInterstitialTimestamp.getTime();
      const requiredMs = cooldownMinutes * 60 * 1000;
      if (elapsedMs < requiredMs) {
        return { allowed: false, reason: 'cooldown' };
      }
    }

    return { allowed: true };
  }

  /**
   * Sets request display lock to prevent concurrent interstitial triggers.
   * @param {boolean} showing
   */
  setInterstitialShowing(showing) {
    this.isInterstitialShowing = Boolean(showing);
  }

  /**
   * Records an interstitial ad impression event.
   * @param {Date} now
   */
  recordInterstitialImpression(now = new Date()) {
    const timestamp = now instanceof Date ? now : new Date(now);
    this.lastInterstitialTimestamp = timestamp;
    this.interstitialSessionCount += 1;
    this.isInterstitialShowing = false;
  }

  /**
   * Resets session count (e.g. on app restart or test scenario).
   */
  resetSession() {
    this.lastInterstitialTimestamp = null;
    this.interstitialSessionCount = 0;
    this.isInterstitialShowing = false;
  }

  /**
   * Returns current frequency status summary for diagnostic testing.
   */
  getStatus() {
    return {
      lastInterstitialTimestamp: this.lastInterstitialTimestamp,
      interstitialSessionCount: this.interstitialSessionCount,
      isInterstitialShowing: this.isInterstitialShowing,
    };
  }
}

export const adFrequencyService = new AdFrequencyService();
export default adFrequencyService;

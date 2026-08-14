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

    const cooldownMinutes = typeof options.cooldownMinutes === 'number' && options.cooldownMinutes > 0 ? options.cooldownMinutes : 3;
    const maxPerSession = typeof options.maxPerSession === 'number' && options.maxPerSession >= 0 ? options.maxPerSession : 3;
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
   * Returns remaining cooldown milliseconds.
   * @param {number} cooldownMinutes
   * @param {Date} now
   * @returns {number}
   */
  getRemainingCooldownMs(cooldownMinutes = 3, now = new Date()) {
    if (!this.lastInterstitialTimestamp) return 0;
    const elapsedMs = (now instanceof Date ? now : new Date()).getTime() - this.lastInterstitialTimestamp.getTime();
    const requiredMs = cooldownMinutes * 60 * 1000;
    return Math.max(0, requiredMs - elapsedMs);
  }

  /**
   * Returns formatted mm:ss remaining cooldown string for dev debugging.
   * @param {number} cooldownMinutes
   * @param {Date} now
   * @returns {string}
   */
  getFormattedRemainingCooldown(cooldownMinutes = 3, now = new Date()) {
    const remainingMs = this.getRemainingCooldownMs(cooldownMinutes, now);
    if (remainingMs <= 0) return '0:00';
    const totalSec = Math.ceil(remainingMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

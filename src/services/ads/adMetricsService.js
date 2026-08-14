/**
 * Local Development Ad Metrics & Debugging Tracker.
 * STRICT PRIVACY & SAFETY GUARANTEE:
 * 1. Metrics are stored strictly in local memory.
 * 2. Zero data is sent to Firebase, analytics services, or external servers.
 * 3. Zero financial data (loans, payments, balances, rates, EMIs) is recorded.
 * 4. Used strictly for development QA debugging (__DEV__ === true).
 */
class AdMetricsService {
  constructor() {
    this.metrics = {
      bannerRenders: 0,
      nativeRenders: 0,
      interstitialAttempts: 0,
      interstitialShown: 0,
      rewardedStarts: 0,
      rewardedCompletions: 0,
      rewardedCancellations: 0,
      adFreeSuppressions: 0,
      offlineSuppressions: 0,
      protectedWorkflowSuppressions: 0,
    };
    this.decisionLogs = [];
  }

  recordRender(adType) {
    if (adType === 'banner') this.metrics.bannerRenders += 1;
    if (adType === 'native') this.metrics.nativeRenders += 1;
  }

  recordInterstitialAttempt() {
    this.metrics.interstitialAttempts += 1;
  }

  recordInterstitialShown() {
    this.metrics.interstitialShown += 1;
  }

  recordRewardedStart() {
    this.metrics.rewardedStarts += 1;
  }

  recordRewardedCompletion() {
    this.metrics.rewardedCompletions += 1;
  }

  recordRewardedCancellation() {
    this.metrics.rewardedCancellations += 1;
  }

  recordSuppression(reason) {
    if (reason === 'AD_FREE_ACTIVE') this.metrics.adFreeSuppressions += 1;
    if (reason === 'OFFLINE') this.metrics.offlineSuppressions += 1;
    if (reason === 'FINANCIAL_WORKFLOW') this.metrics.protectedWorkflowSuppressions += 1;
  }

  logDecision(entry) {
    const timestamp = new Date().toLocaleTimeString();
    const logItem = {
      timestamp,
      placementId: entry.placementId || 'N/A',
      adType: entry.adType || 'N/A',
      screen: entry.screen || 'N/A',
      allowed: Boolean(entry.allowed),
      reason: entry.reason || 'N/A',
    };

    this.decisionLogs.unshift(logItem);
    if (this.decisionLogs.length > 50) {
      this.decisionLogs.pop();
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getDecisionLogs() {
    return [...this.decisionLogs];
  }

  reset() {
    this.metrics = {
      bannerRenders: 0,
      nativeRenders: 0,
      interstitialAttempts: 0,
      interstitialShown: 0,
      rewardedStarts: 0,
      rewardedCompletions: 0,
      rewardedCancellations: 0,
      adFreeSuppressions: 0,
      offlineSuppressions: 0,
      protectedWorkflowSuppressions: 0,
    };
    this.decisionLogs = [];
  }
}

export const adMetricsService = new AdMetricsService();
export default adMetricsService;

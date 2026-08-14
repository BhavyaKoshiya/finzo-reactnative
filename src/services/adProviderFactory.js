import { NoAdProvider } from './ads/noAdProvider';
import { SimulatedAdProvider } from './ads/simulatedAdProvider';
import { ApprovedAdProvider } from './ads/approvedAdProvider';

/**
 * Advertising Provider Factory.
 * Determines the active ad provider based on environment, configuration, and safety rules.
 * STRICTLY ENFORCES Production Safety: In production (__DEV__ === false), SimulatedAdProvider can NEVER be selected.
 */
export class AdProviderFactory {
  static getProvider(options = {}) {
    const {
      isDev = __DEV__,
      devSimulationEnabled = true,
      providerOverride = null,
      approvedSdkConfig = null,
    } = options;

    // Direct override (for provider swappability testing in unit tests)
    if (providerOverride) {
      return providerOverride;
    }

    // HARD PRODUCTION SAFETY: SimulatedAdProvider can NEVER be created
    // in a production binary, regardless of options passed.
    if ((typeof __DEV__ !== 'undefined' && __DEV__ === false) || isDev === false) {
      // In production: only approved SDK or no ads
      if (approvedSdkConfig && approvedSdkConfig.appId) {
        return new ApprovedAdProvider(approvedSdkConfig);
      }
      return new NoAdProvider();
    }

    // 1. Approved SDK (when configured)
    if (approvedSdkConfig && approvedSdkConfig.appId) {
      return new ApprovedAdProvider(approvedSdkConfig);
    }

    // 2. Simulated Ad Provider (enabled for testing and evaluation)
    if (isDev && devSimulationEnabled) {
      return new SimulatedAdProvider({ simulationEnabled: true });
    }

    return new NoAdProvider();
  }
}

export default AdProviderFactory;

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

    // 1. PRODUCTION SAFETY GUARD
    if (!isDev) {
      if (approvedSdkConfig && approvedSdkConfig.appId) {
        return new ApprovedAdProvider(approvedSdkConfig);
      }
      // Production fallback when no approved SDK is configured
      return new NoAdProvider();
    }

    // 2. DEVELOPMENT ENVIRONMENT
    if (devSimulationEnabled) {
      return new SimulatedAdProvider({ simulationEnabled: true });
    }

    return new NoAdProvider();
  }
}

export default AdProviderFactory;

import { NoAdProvider } from './ads/noAdProvider';
import { SimulatedAdProvider } from './ads/simulatedAdProvider';
import { ApprovedAdProvider } from './ads/approvedAdProvider';
import { MarketingAdProvider } from './ads/marketingAdProvider';

/**
 * Advertising Provider Factory.
 * Determines the active ad provider based on environment, configuration, and safety rules.
 * STRICTLY ENFORCES Production Safety: In production (__DEV__ === false), SimulatedAdProvider can NEVER be selected.
 * In development, uses MarketingAdProvider by default as configured, while supporting mock simulation during testing.
 */
export class AdProviderFactory {
  static getProvider(options = {}) {
    const {
      isDev = __DEV__,
      devSimulationEnabled = false,
      forceSimulation = false,
      providerOverride = null,
      approvedSdkConfig = null,
      marketingConfig = null,
    } = options;

    // Direct override (for provider swappability testing in unit tests)
    if (providerOverride) {
      return providerOverride;
    }

    // HARD PRODUCTION SAFETY: SimulatedAdProvider can NEVER be created
    // in a production binary, regardless of options passed.
    if ((typeof __DEV__ !== 'undefined' && __DEV__ === false) || isDev === false) {
      // In production: only approved real SDK or marketing plugin
      if (approvedSdkConfig && approvedSdkConfig.appId) {
        return new ApprovedAdProvider(approvedSdkConfig);
      }
      return new MarketingAdProvider(marketingConfig || {});
    }

    // 1. Explicit Simulation Mode for unit tests and local mock QA
    if (forceSimulation || devSimulationEnabled) {
      return new SimulatedAdProvider({ simulationEnabled: true });
    }

    // 2. Approved SDK (when explicitly configured with appId)
    if (approvedSdkConfig && approvedSdkConfig.appId) {
      return new ApprovedAdProvider(approvedSdkConfig);
    }

    // 3. Default in Development & Production: MarketingAdProvider (react-native-marketing-plugin)
    return new MarketingAdProvider(marketingConfig || {});
  }
}

export default AdProviderFactory;

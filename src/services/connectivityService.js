import NetInfo from '@react-native-community/netinfo';
import { CONNECTIVITY_STATUS } from './types/connectivityTypes';

class ConnectivityService {
  /**
   * Evaluates current NetInfo state into normalized connectivity status.
   * Wi-Fi connected with isInternetReachable === false is treated as OFFLINE.
   */
  parseState(state) {
    const isConnected = Boolean(state?.isConnected);
    const isInternetReachable = state?.isInternetReachable;

    let status = CONNECTIVITY_STATUS.OFFLINE;

    if (isConnected && isInternetReachable !== false) {
      status = CONNECTIVITY_STATUS.ONLINE;
    } else {
      status = CONNECTIVITY_STATUS.OFFLINE;
    }

    return {
      status,
      isConnected,
      isInternetReachable,
      type: state?.type || 'unknown',
    };
  }

  /**
   * Fetches latest one-shot connectivity state.
   */
  async getConnectivityState() {
    try {
      const state = await NetInfo.fetch();
      return this.parseState(state);
    } catch (error) {
      return {
        status: CONNECTIVITY_STATUS.OFFLINE,
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
      };
    }
  }

  /**
   * Helper to check if currently online.
   */
  async isOnline() {
    const current = await this.getConnectivityState();
    return current.status === CONNECTIVITY_STATUS.ONLINE;
  }

  /**
   * Subscribes to live NetInfo state changes.
   */
  subscribeToConnectivity(listener) {
    if (typeof listener !== 'function') return () => {};

    const unsubscribe = NetInfo.addEventListener((state) => {
      const parsed = this.parseState(state);
      listener(parsed);
    });

    return unsubscribe;
  }
}

export const connectivityService = new ConnectivityService();
export default connectivityService;

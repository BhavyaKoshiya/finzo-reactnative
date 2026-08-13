import connectivityReducer, {
  setConnectivityState,
  resetConnectivityState,
  selectIsOnline,
  selectConnectivityStatus,
} from '../slices/connectivitySlice';
import { CONNECTIVITY_STATUS } from '../../services/types/connectivityTypes';

describe('connectivitySlice Reducer & Actions', () => {
  const initialState = {
    status: CONNECTIVITY_STATUS.UNKNOWN,
    isConnected: false,
    isInternetReachable: null,
    lastCheckedAt: null,
  };

  it('updates connectivity state for ONLINE status', () => {
    const action = setConnectivityState({
      status: CONNECTIVITY_STATUS.ONLINE,
      isConnected: true,
      isInternetReachable: true,
    });

    const nextState = connectivityReducer(initialState, action);
    expect(nextState.status).toBe(CONNECTIVITY_STATUS.ONLINE);
    expect(nextState.isConnected).toBe(true);
    expect(selectIsOnline({ connectivity: nextState })).toBe(true);
  });

  it('updates connectivity state for OFFLINE status', () => {
    const action = setConnectivityState({
      status: CONNECTIVITY_STATUS.OFFLINE,
      isConnected: false,
      isInternetReachable: false,
    });

    const nextState = connectivityReducer(initialState, action);
    expect(nextState.status).toBe(CONNECTIVITY_STATUS.OFFLINE);
    expect(selectIsOnline({ connectivity: nextState })).toBe(false);
  });

  it('resets connectivity state to UNKNOWN', () => {
    let state = connectivityReducer(
      initialState,
      setConnectivityState({ status: CONNECTIVITY_STATUS.ONLINE, isConnected: true })
    );

    state = connectivityReducer(state, resetConnectivityState());
    expect(state.status).toBe(CONNECTIVITY_STATUS.UNKNOWN);
  });
});

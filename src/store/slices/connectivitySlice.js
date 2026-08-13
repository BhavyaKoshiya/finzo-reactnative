import { createSlice, createSelector } from '@reduxjs/toolkit';
import { CONNECTIVITY_STATUS } from '../../services/types/connectivityTypes';

const initialState = {
  status: CONNECTIVITY_STATUS.UNKNOWN,
  isConnected: false,
  isInternetReachable: null,
  lastCheckedAt: null,
};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    setConnectivityState: (state, action) => {
      const { status, isConnected, isInternetReachable } = action.payload || {};
      state.status = status || CONNECTIVITY_STATUS.OFFLINE;
      state.isConnected = Boolean(isConnected);
      state.isInternetReachable = isInternetReachable !== undefined ? isInternetReachable : null;
      state.lastCheckedAt = new Date().toISOString();
    },

    resetConnectivityState: (state) => {
      state.status = CONNECTIVITY_STATUS.UNKNOWN;
      state.isConnected = false;
      state.isInternetReachable = null;
      state.lastCheckedAt = null;
    },
  },
});

export const { setConnectivityState, resetConnectivityState } = connectivitySlice.actions;

// Selectors
export const selectConnectivityState = (state) => state.connectivity || initialState;

export const selectConnectivityStatus = createSelector(
  [selectConnectivityState],
  (conn) => conn.status
);

export const selectIsOnline = createSelector(
  [selectConnectivityStatus],
  (status) => status === CONNECTIVITY_STATUS.ONLINE
);

export const selectIsInternetReachable = createSelector(
  [selectConnectivityState],
  (conn) => conn.isInternetReachable
);

export default connectivitySlice.reducer;

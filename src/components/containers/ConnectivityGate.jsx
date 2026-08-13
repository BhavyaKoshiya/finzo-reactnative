import React, { useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsOnline, setConnectivityState } from '../../store/slices/connectivitySlice';
import connectivityService from '../../services/connectivityService';
import InternetRequiredScreen from '../../features/connectivity/screens/InternetRequiredScreen';

export const ConnectivityGate = ({ children }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);

  const refreshConnectivity = useCallback(async () => {
    const connState = await connectivityService.getConnectivityState();
    dispatch(setConnectivityState(connState));
  }, [dispatch]);

  useEffect(() => {
    // AppState Foreground Resume Listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshConnectivity();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshConnectivity]);

  if (!isOnline) {
    return <InternetRequiredScreen onRetry={refreshConnectivity} />;
  }

  return children;
};

export default ConnectivityGate;

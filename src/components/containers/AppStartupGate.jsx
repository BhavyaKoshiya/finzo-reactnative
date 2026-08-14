import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import BootSplash from 'react-native-bootsplash';
import connectivityService from '../../services/connectivityService';
import { setConnectivityState } from '../../store/slices/connectivitySlice';
import adService from '../../services/adService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import logger from '../../services/logger';

export const AD_STARTUP_TIMEOUT_MS = 5000;

export const AppStartupGate = ({ children }) => {
  const dispatch = useDispatch();
  const [isStartupReady, setIsStartupReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performStartupInit = async () => {
      try {
        // 1. Initial connectivity check
        const initialConn = await connectivityService.getConnectivityState();
        if (isMounted) {
          dispatch(setConnectivityState(initialConn));
        }

        // 2. Initialize Ad SDK & Preloading while Splash is visible (up to 5 seconds max)
        if (initialConn?.isConnected) {
          if (__DEV__) {
            logger.info('AppStartupGate: Starting ad initialization and preloading (5s max Splash wait)');
          }

          const adInitPromise = adService.initialize();
          const configInitPromise = realtimeConfigService.initialize();

          const startupTasksPromise = Promise.allSettled([
            adInitPromise,
            configInitPromise,
          ]);

          let timerId = null;
          let timedOut = false;

          const timeoutPromise = new Promise((resolve) => {
            timerId = setTimeout(() => {
              timedOut = true;
              if (__DEV__) {
                logger.info('AppStartupGate: 5-second ad startup wait limit reached; continuing app startup while ads continue loading in background');
              }
              resolve('TIMEOUT');
            }, AD_STARTUP_TIMEOUT_MS);
          });

          try {
            await Promise.race([startupTasksPromise, timeoutPromise]);
            if (!timedOut && __DEV__) {
              logger.info('AppStartupGate: Ad initialization and startup tasks completed early; continuing app startup immediately');
            }
          } finally {
            if (timerId) {
              clearTimeout(timerId);
            }
          }
        } else {
          if (__DEV__) {
            logger.info('AppStartupGate: Device is offline at startup; bypassing ad initialization wait');
          }
        }
      } catch (err) {
        if (__DEV__) {
          logger.warn('AppStartupGate: Tolerated startup initialization error', { error: err?.message });
        }
      } finally {
        if (isMounted) {
          setIsStartupReady(true);
          // 3. Hide BootSplash only after startup initialization wait completes
          try {
            await BootSplash.hide({ fade: true });
          } catch (splashErr) {
            // Tolerated in unit test environment
          }
        }
      }
    };

    performStartupInit();

    // 4. Global subscriber for live NetInfo changes
    const unsubscribe = connectivityService.subscribeToConnectivity((connState) => {
      if (isMounted) {
        dispatch(setConnectivityState(connState));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch]);

  if (!isStartupReady) {
    // Keep blank container while native BootSplash is still visible to prevent UI flashes
    return <View style={styles.gateContainer} />;
  }

  return children;
};

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    backgroundColor: '#000B37', // Finzo brand background matching exact Android logo background
  },
});

export default AppStartupGate;

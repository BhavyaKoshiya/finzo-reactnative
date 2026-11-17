import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useStore } from 'react-redux';
import BootSplash from 'react-native-bootsplash';
import connectivityService from '../../services/connectivityService';
import { setConnectivityState } from '../../store/slices/connectivitySlice';
import { applyDetectedCurrency, selectCurrencySetupDone } from '../../store/slices/settingsSlice';
import { detectDeviceCurrency } from '../../services/currencyDetectionService';
import adService from '../../services/adService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import { selectIsAdFree } from '../../store/slices/rewardsSlice';
import logger from '../../services/logger';

/**
 * Longest the launch screen waits for ads to start and the startup (app open) ad to
 * load, unless the remote ad config sets `appOpenWaitTime`. An ad that loads later is
 * dropped, so no ad ever appears over a screen the user is already using.
 */
export const AD_STARTUP_TIMEOUT_MS = 8000;

export const AppStartupGate = ({ children }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const [isStartupReady, setIsStartupReady] = useState(false);
  const startupDoneRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const performStartupInit = async () => {
      // Fresh install only: pick the currency once from the device (offline, instant)
      if (!selectCurrencySetupDone(store.getState())) {
        dispatch(applyDetectedCurrency(detectDeviceCurrency()));
      }

      const startedAt = Date.now();
      let startupBudgetMs = AD_STARTUP_TIMEOUT_MS;
      const remainingStartupTime = () => Math.max(0, startupBudgetMs - (Date.now() - startedAt));

      // Ad-free time also covers the startup ad
      let isAdFree = false;
      try {
        isAdFree = Boolean(selectIsAdFree(store.getState()));
      } catch (_err) {
        // Missing or migrated rewards state: treat as not ad-free
      }
      if (isAdFree) {
        adService.endStartupAd();
      }

      try {
        // 1. Initial connectivity check
        const initialConn = await connectivityService.getConnectivityState();
        if (isMounted) {
          dispatch(setConnectivityState(initialConn));
        }

        // 2. Initialize Ad SDK & Preloading while Splash is visible (up to 8 seconds max)
        if (initialConn?.isConnected) {
          if (__DEV__) {
            logger.info('AppStartupGate: Starting ad initialization and preloading (8s max Splash wait)');
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
                logger.info('AppStartupGate: ad startup wait limit reached; continuing app startup while ads continue loading in background');
              }
              resolve('TIMEOUT');
            }, remainingStartupTime());
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

          // 3. Keep the splash up while the startup ad loads and shows, within the same budget
          // (the remote ad config, now loaded, may shorten or lengthen it)
          if (!timedOut && !isAdFree) {
            startupBudgetMs = adService.getStartupAdWaitMs(AD_STARTUP_TIMEOUT_MS);
            await adService.waitForStartupAd(remainingStartupTime());
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
        // Whatever happened, no startup ad may appear once the app is on screen
        adService.endStartupAd();
        startupDoneRef.current = true;
        if (isMounted) {
          setIsStartupReady(true);
          // 4. Hide BootSplash only after startup initialization wait completes
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
      // Startup skips ads and remote config when offline; start them once we reconnect.
      // Both calls are no-ops when already initialized or in progress.
      if (isMounted && connState?.isConnected && startupDoneRef.current) {
        adService.initialize();
        realtimeConfigService.initialize();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch, store]);

  if (!isStartupReady) {
    // Keep blank container while native BootSplash is still visible to prevent UI flashes
    return <View style={styles.gateContainer} />;
  }

  return children;
};

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    backgroundColor: '#0055FD', // LoanPilot brand background matching the launcher icon and splash
  },
});

export default AppStartupGate;

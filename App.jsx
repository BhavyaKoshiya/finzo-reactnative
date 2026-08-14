import React, { useEffect } from 'react';
import { AppState, StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee, { EventType } from '@notifee/react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigate } from './src/navigation/navigationRef';
import ROUTES from './src/navigation/routes';
import loanReminderService from './src/features/loans/services/loanReminderService';
import AppStartupGate from './src/components/containers/AppStartupGate';
import ConnectivityGate from './src/components/containers/ConnectivityGate';
import AppUpdateGate from './src/components/containers/AppUpdateGate';

import SimulatedInterstitialModal from './src/components/ads/SimulatedInterstitialModal';
import adService from './src/services/adService';
import firebaseAnalyticsService, { ANALYTICS_EVENTS } from './src/services/firebaseAnalyticsService';
import firebaseCrashlyticsService from './src/services/firebaseCrashlyticsService';
import firebaseMessagingService from './src/services/firebaseMessagingService';

function AppContent() {
  useEffect(() => {
    // 1. Initial reconciliation on startup
    const reconcileState = () => {
      const state = store.getState();
      const loans = state.loanProfiles?.profiles || [];
      const payments = state.loanPayments?.payments || [];
      const globalEnabled = state.settings?.loanRemindersEnabled !== false;

      loanReminderService.reconcileLoanReminders({ loans, payments, globalEnabled });
    };

    reconcileState();

    // 2. Asynchronous, non-blocking marketing ad provider initialization
    adService.initialize().catch(() => {});

    // 3. Asynchronous, non-blocking Firebase services initialization
    firebaseCrashlyticsService.initialize().catch(() => {});
    firebaseAnalyticsService.logEvent(ANALYTICS_EVENTS.APP_OPEN).catch(() => {});

    // 4. Foreground FCM message listener
    const unsubscribeFcm = firebaseMessagingService.onMessage(() => {});
    const unsubscribeFcmOpened = firebaseMessagingService.onNotificationOpenedApp(() => {});

    // 5. AppState Foreground Resume Listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        reconcileState();
      }
    });

    // 3. Notifee Tap Event Listener
    const handleNotificationTap = (detail) => {
      const loanId = detail?.notification?.data?.loanId;
      if (loanId) {
        const state = store.getState();
        const loans = state.loanProfiles?.profiles || [];
        const loanExists = loans.some((l) => l.id === loanId);

        if (loanExists) {
          navigate(ROUTES.LOAN_DETAILS, { loanId });
        } else {
          navigate(ROUTES.MY_LOANS);
        }
      }
    };

    // Foreground notification press
    const unsubscribeNotifee = typeof notifee?.onForegroundEvent === 'function'
      ? notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            handleNotificationTap(detail);
          }
        })
      : () => {};

    // Initial notification (app opened from quit state via notification tap)
    if (typeof notifee?.getInitialNotification === 'function') {
      notifee.getInitialNotification().then((initialNotif) => {
        if (initialNotif) {
          handleNotificationTap(initialNotif);
        }
      });
    }

    return () => {
      subscription.remove();
      unsubscribeNotifee();
      unsubscribeFcm();
      unsubscribeFcmOpened();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ConnectivityGate>
        <AppUpdateGate>
          <AppNavigator />
          <SimulatedInterstitialModal />
        </AppUpdateGate>
      </ConnectivityGate>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppStartupGate>
            <AppContent />
          </AppStartupGate>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import BootSplash from 'react-native-bootsplash';
import connectivityService from '../../services/connectivityService';
import { setConnectivityState } from '../../store/slices/connectivitySlice';

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
      } catch (err) {
        // Tolerated default
      } finally {
        if (isMounted) {
          setIsStartupReady(true);
          // 2. Hide BootSplash only after connectivity state decision is made
          try {
            await BootSplash.hide({ fade: true });
          } catch (splashErr) {
            // Tolerated in unit test environment
          }
        }
      }
    };

    performStartupInit();

    // 3. Global subscriber for live NetInfo changes
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

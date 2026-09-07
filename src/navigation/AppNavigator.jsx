import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import { getNavigationTheme } from './navigationTheme';
import { useAppTheme } from '../hooks/useAppTheme';
import { navigationRef } from './navigationRef';
import adService from '../services/adService';
import { AD_PLACEMENTS } from '../services/ads/adPlacementConstants';
import { isProtectedScreen } from '../services/ads/adDecisionEngine';

export const AppNavigator = () => {
  const { currentTheme, isDark } = useAppTheme();
  const navTheme = getNavigationTheme(currentTheme, isDark);
  const routeNameRef = useRef(null);
  const lastAdAttemptTimeRef = useRef(0);

  const handleNavigationReady = () => {
    if (navigationRef.isReady()) {
      routeNameRef.current = navigationRef.getCurrentRoute()?.name;
    }
  };

  const handleStateChange = async () => {
    if (!navigationRef.isReady()) return;

    const previousRouteName = routeNameRef.current;
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name;

    if (previousRouteName && currentRouteName && previousRouteName !== currentRouteName) {
      routeNameRef.current = currentRouteName;

      // Avoid double triggering if an interstitial was just attempted within 1500ms (e.g. via useInterstitialAd)
      const now = Date.now();
      if (now - lastAdAttemptTimeRef.current < 1500) {
        return;
      }

      // Check financial workflow protection: sensitive flows must never show interstitials
      if (isProtectedScreen(previousRouteName) || isProtectedScreen(currentRouteName)) {
        return;
      }

      lastAdAttemptTimeRef.current = now;
      try {
        await adService.showInterstitial(AD_PLACEMENTS.CALCULATOR_INTERSTITIAL, {
          screen: 'navigation',
        });
      } catch (_err) {
        // Silently catch navigation interstitial errors
      }
    } else if (currentRouteName) {
      routeNameRef.current = currentRouteName;
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={handleNavigationReady}
      onStateChange={handleStateChange}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;

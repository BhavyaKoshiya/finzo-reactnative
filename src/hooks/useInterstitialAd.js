import { useRef, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import adService from '../services/adService';
import { AD_PLACEMENTS } from '../services/ads/adPlacementConstants';
import { ROUTES } from '../navigation/routes';

/**
 * Custom React Hook for triggering interstitial ads on screen transitions (Finzo & Cleanzo Model).
 *
 * Features:
 * - Triggers interstitial ads on back transitions and waits for ad dismissal before completing navigation.
 * - Hardware Back Button Support: Automatically intercepts Android physical back press & gesture
 *   via BackHandler + useFocusEffect to show the interstitial ad before popping the screen.
 * - Double-tap protection: rapid repeated back presses cannot cause multiple interstitials
 *   or duplicate navigation calls.
 * - Fail-safe: Always ensures navigation succeeds even if ad fails, times out, or throws.
 *
 * @param {Object} [options]
 * @param {string} [options.placementId] - Placement ID (default CALCULATOR_INTERSTITIAL)
 * @param {string} [options.screen] - Screen identifier (default 'calculators')
 * @param {Function} [options.onCustomBack] - Optional custom callback to run instead of default goBack
 * @param {boolean} [options.enableHardwareBack] - Whether to intercept Android physical back press (default true)
 */
export const useInterstitialAd = ({
  placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL,
  screen = 'calculators',
  onCustomBack,
  enableHardwareBack = true,
} = {}) => {
  const navigation = useNavigation();
  const isProcessingRef = useRef(false);

  const handleBackWithAd = useCallback(
    async (onDone) => {
      // Double-tap guard: ignore if already processing a back-with-ad request
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;

      try {
        await adService.showInterstitial(placementId, { screen });
      } catch (_err) {
        // Fail-safe: Always ensure navigation succeeds even if ad fails or throws
      } finally {
        if (typeof onDone === 'function') {
          onDone();
        } else if (typeof onCustomBack === 'function') {
          onCustomBack();
        } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
          navigation.goBack();
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate(ROUTES.MAIN_TABS);
        }

        // Reset after a short delay to allow navigation to complete
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500);
      }
    },
    [navigation, placementId, screen, onCustomBack]
  );

  // Automatically intercept Android physical back button and gesture
  useFocusEffect(
    useCallback(() => {
      if (!enableHardwareBack) return;

      const onHardwareBackPress = () => {
        handleBackWithAd();
        return true; // Consume event to prevent immediate unmount by OS
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        } else if (BackHandler.removeEventListener) {
          BackHandler.removeEventListener('hardwareBackPress', onHardwareBackPress);
        }
      };
    }, [enableHardwareBack, handleBackWithAd])
  );

  return { handleBackWithAd };
};

export default useInterstitialAd;

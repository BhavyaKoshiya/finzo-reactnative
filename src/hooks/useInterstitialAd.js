import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import adService from '../services/adService';
import { AD_PLACEMENTS } from '../services/ads/adPlacementConstants';

/**
 * Custom React Hook for triggering interstitial ads on screen transitions.
 * Uses adService pipeline which delegates to the SimulatedInterstitialModal
 * rendered at the app root level.
 *
 * Includes double-tap protection: rapid repeated back presses cannot cause
 * multiple interstitials, modal instances, navigation calls, or callbacks.
 *
 * @param {Object} options
 * @param {string} [options.placementId] - Placement ID (default CALCULATOR_INTERSTITIAL)
 * @param {string} [options.screen] - Screen identifier (default 'calculators')
 */
export const useInterstitialAd = ({
  placementId = AD_PLACEMENTS.CALCULATOR_INTERSTITIAL,
  screen = 'calculators',
} = {}) => {
  const navigation = useNavigation();
  const isProcessingRef = useRef(false);

  const handleBackWithAd = async () => {
    // Double-tap guard: ignore if already processing a back-with-ad request
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    try {
      await adService.showInterstitial(placementId, { screen });
    } catch (_err) {
      // Silently handle errors - navigation should always complete
    } finally {
      if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
      }
      // Reset after a short delay to allow navigation to complete
      // (prevents stale ref if component re-mounts)
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  return { handleBackWithAd };
};

export default useInterstitialAd;

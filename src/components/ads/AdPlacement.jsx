import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsAdFree } from '../../store/slices/rewardsSlice';
import { selectIsOnline } from '../../store/slices/connectivitySlice';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import adService from '../../services/adService';
import firebaseAnalyticsService from '../../services/firebaseAnalyticsService';
import SimulatedBannerAd from './SimulatedBannerAd';
import SimulatedNativeAd from './SimulatedNativeAd';

/**
 * How long to wait for a native ad to load before collapsing the container.
 * The plugin's NativeAdComponent renders an ActivityIndicator with fixed
 * minHeight while loading. If the SDK is slow or silently fails (never fires
 * onAdFailed), the loader and reserved space persists forever. This timeout
 * treats a still-loading ad as failed and collapses the placement.
 */
const NATIVE_AD_LOAD_TIMEOUT_MS = 10000;

/**
 * Universal AdPlacement UI Wrapper Component.
 * Encapsulates single central decision pipeline (canShowAd) for:
 * 1. Financial workflow protection (100% ad-free on protected screens)
 * 2. Ad-Free entitlement check (suppresses ordinary ads if active)
 * 3. Internet connectivity check (suppresses ads if offline)
 * 4. Firebase RTDB configuration gating (checks screen & adType permission)
 * 5. Provider abstraction (renders active provider placement without screen knowing implementation details)
 */
export const AdPlacement = ({
  screen,
  placementId,
  adType = 'banner',
  headline,
  description,
  callToAction,
  style,
}) => {
  const isAdFree = useSelector(selectIsAdFree);
  const isOnline = useSelector((state) => (selectIsOnline ? selectIsOnline(state) : true));
  const [config, setConfig] = useState(realtimeConfigService.getConfig());
  const [adFailed, setAdFailed] = useState(false);
  const [nativeAdLoaded, setNativeAdLoaded] = useState(false);
  const nativeTimeoutRef = useRef(null);

  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

  // Safety timeout for native ads: collapse if ad never loads or fails
  useEffect(() => {
    if (adType !== 'native' || adFailed || nativeAdLoaded) {
      return;
    }

    nativeTimeoutRef.current = setTimeout(() => {
      // Only collapse if the ad still hasn't loaded or failed by now
      setAdFailed(true);
      console.log(`[FAD] ⏱ Native AD TIMEOUT (${NATIVE_AD_LOAD_TIMEOUT_MS}ms) | placementId=${placementId}`);
      firebaseAnalyticsService.logNativeAdFailed({
        placementId,
        screen,
        reason: 'Native ad load timeout',
      });
    }, NATIVE_AD_LOAD_TIMEOUT_MS);

    return () => {
      if (nativeTimeoutRef.current) {
        clearTimeout(nativeTimeoutRef.current);
        nativeTimeoutRef.current = null;
      }
    };
  }, [adType, adFailed, nativeAdLoaded, placementId, screen]);

  // Stable callbacks for native ad events
  const handleNativeAdLoaded = useCallback(() => {
    if (nativeTimeoutRef.current) {
      clearTimeout(nativeTimeoutRef.current);
      nativeTimeoutRef.current = null;
    }
    setNativeAdLoaded(true);
    console.log(`[FAD] ✅ Native AD LOADED | placementId=${placementId}`);
    firebaseAnalyticsService.logNativeAdLoaded({ placementId, screen });
  }, [placementId, screen]);

  const handleNativeAdFailed = useCallback((err) => {
    if (nativeTimeoutRef.current) {
      clearTimeout(nativeTimeoutRef.current);
      nativeTimeoutRef.current = null;
    }
    setAdFailed(true);
    console.log(`[FAD] ❌ Native AD FAILED | placementId=${placementId} error=`, err);
    firebaseAnalyticsService.logNativeAdFailed({
      placementId,
      screen,
      reason: err?.message || 'Native load error',
    });
  }, [placementId, screen]);

  console.log(`[FAD] render | screen=${screen} placementId=${placementId} adType=${adType} isAdFree=${isAdFree} isOnline=${isOnline} adFailed=${adFailed}`);

  if (adFailed) {
    console.log(`[FAD] BLOCKED: adFailed=true | placementId=${placementId}`);
    return null;
  }

  // Delegate all authorization, entitlement, connectivity, and safety decisions to central decision engine!
  const decision = adService.canShowAd({
    adType,
    placementId,
    screen,
    isOnline,
    isAdFree,
    config,
  });

  console.log(`[FAD] canShowAd decision | allowed=${decision.allowed} reason=${decision.reason || 'none'} placementId=${placementId}`);

  if (!decision.allowed) {
    console.log(`[FAD] BLOCKED by canShowAd: reason=${decision.reason} | placementId=${placementId}`);
    if (adType === 'banner') {
      firebaseAnalyticsService.logBannerAdSuppressed({ placementId, screen, reason: decision.reason });
    } else if (adType === 'native') {
      firebaseAnalyticsService.logNativeAdSuppressed({ placementId, screen, reason: decision.reason });
    }
    return null;
  }

  const provider = adService.getProvider();

  if (adType === 'banner') {
    console.log(`[FAD] Banner path | provider=${provider?.getType?.()} hasRenderBanner=${typeof provider?.renderBanner === 'function'} isBannerAvailable=${provider?.isBannerAvailable?.(placementId)}`);

    const bannerContent =
      provider && typeof provider.renderBanner === 'function'
        ? provider.renderBanner({
            placementId,
            style,
            onAdLoaded: () => {
              console.log(`[FAD] ✅ Banner AD LOADED | placementId=${placementId}`);
              firebaseAnalyticsService.logBannerAdLoaded({ placementId, screen });
            },
            onAdFailed: (err) => {
              console.log(`[FAD] ❌ Banner AD FAILED | placementId=${placementId} error=`, err);
              setAdFailed(true);
              firebaseAnalyticsService.logBannerAdFailed({
                placementId,
                screen,
                reason: err?.message || 'Banner load error',
              });
            },
          })
        : <SimulatedBannerAd style={style} />;

    console.log(`[FAD] bannerContent result | isNull=${bannerContent === null} type=${bannerContent?.type?.name || bannerContent?.type || 'null'}`);

    if (!bannerContent) {
      console.log(`[FAD] BLOCKED: renderBanner returned null | placementId=${placementId}`);
      return null;
    }

    const isTab = screen === 'tabs';
    const containerStyle = isTab ? styles.tabBannerContainer : styles.bannerContainer;

    return (
      <View style={[containerStyle, style]}>
        {bannerContent}
      </View>
    );
  }

  if (adType === 'native') {
    let nativeContent = null;
    const isRealProvider = provider && typeof provider.renderNative === 'function';

    if (isRealProvider) {
      nativeContent = provider.renderNative({
        placementId,
        style,
        headline,
        description,
        callToAction,
        onAdLoaded: handleNativeAdLoaded,
        onAdFailed: handleNativeAdFailed,
      });
    } else {
      nativeContent = (
        <SimulatedNativeAd
          headline={headline}
          description={description}
          callToAction={callToAction}
          style={style}
        />
      );
    }

    if (!nativeContent) {
      return null;
    }

    // For real provider native ads: hide the container (overflow + height 0)
    // until the ad confirms it loaded. This prevents the plugin's internal
    // ActivityIndicator from reserving layout space while loading.
    // Simulated ads are shown immediately since they don't have a loading state.
    const isLoading = isRealProvider && !nativeAdLoaded;

    return (
      <View
        style={[
          styles.nativeContainer,
          isLoading && styles.nativeContainerHidden,
          style,
        ]}
        pointerEvents={isLoading ? 'none' : 'auto'}
      >
        {nativeContent}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabBannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  nativeContainer: {
    marginVertical: 12,
    width: '100%',
  },
  /**
   * Visually hides the native ad container while the SDK's internal
   * ActivityIndicator is showing. Uses height: 0 + overflow: hidden
   * instead of display: none so the NativeAdComponent still mounts
   * and can fire its onAdLoaded / onAdFailed callbacks.
   */
  nativeContainerHidden: {
    height: 0,
    marginVertical: 0,
    overflow: 'hidden',
  },
});

export default AdPlacement;

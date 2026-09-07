import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

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
    if (provider && typeof provider.renderNative === 'function') {
      nativeContent = provider.renderNative({
        placementId,
        style,
        headline,
        description,
        callToAction,
        onAdLoaded: () => {
          firebaseAnalyticsService.logNativeAdLoaded({ placementId, screen });
        },
        onAdFailed: (err) => {
          setAdFailed(true);
          firebaseAnalyticsService.logNativeAdFailed({
            placementId,
            screen,
            reason: err?.message || 'Native load error',
          });
        },
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

    return (
      <View style={[styles.nativeContainer, style]}>
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
});

export default AdPlacement;

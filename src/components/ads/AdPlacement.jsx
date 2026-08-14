import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsAdFree } from '../../store/slices/rewardsSlice';
import { selectIsOnline } from '../../store/slices/connectivitySlice';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import adService from '../../services/adService';
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

  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

  // Delegate all authorization, entitlement, connectivity, and safety decisions to central decision engine!
  const decision = adService.canShowAd({
    adType,
    placementId,
    screen,
    isOnline,
    isAdFree,
    config,
  });

  if (!decision.allowed) {
    return null;
  }

  const provider = adService.getProvider();

  if (adType === 'banner') {
    const isTab = screen === 'tabs';
    const containerStyle = isTab ? styles.tabBannerContainer : styles.bannerContainer;
    const bannerContent =
      provider && typeof provider.renderBanner === 'function'
        ? provider.renderBanner({ placementId, style })
        : <SimulatedBannerAd style={style} />;

    return (
      <View style={[containerStyle, style]}>
        {bannerContent}
      </View>
    );
  }

  if (adType === 'native') {
    if (provider && typeof provider.renderNative === 'function') {
      return (
        <View style={[styles.nativeContainer, style]}>
          {provider.renderNative({
            placementId,
            style,
            headline,
            description,
            callToAction,
          })}
        </View>
      );
    }
    return (
      <View style={[styles.nativeContainer, style]}>
        <SimulatedNativeAd
          headline={headline}
          description={description}
          callToAction={callToAction}
          style={style}
        />
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

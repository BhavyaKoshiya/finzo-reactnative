import React, { useState, useEffect } from 'react';
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

  if (adType === 'banner') {
    return <SimulatedBannerAd style={style} />;
  }

  if (adType === 'native') {
    return (
      <SimulatedNativeAd
        headline={headline}
        description={description}
        callToAction={callToAction}
        style={style}
      />
    );
  }

  return null;
};

export default AdPlacement;

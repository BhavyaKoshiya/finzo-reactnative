import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayCircle, Clock, Lock, CheckCircle2 } from 'lucide-react-native';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import RewardedAdModal from './RewardedAdModal';
import adService from '../../services/adService';
import rewardService from '../../features/rewards/services/rewardService';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import { selectRewardedAdsConfig } from '../../config/realtimeConfigSelectors';
import { selectConnectivityState } from '../../store/slices/connectivitySlice';
import {
  selectRewardedAdsWatchedToday,
  selectRewardedAdMilestoneClaimedDate,
  selectLastRewardedAdCompletedAt,
  selectRewardsState,
} from '../../store/slices/rewardsSlice';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';

export const RewardedAdButton = ({
  placementId = AD_PLACEMENTS.PROFILE_REWARDED,
  onAdCompleted,
  style,
}) => {
  const dispatch = useDispatch();
  const [config, setConfig] = useState(realtimeConfigService.getConfig());
  const connectivity = useSelector(selectConnectivityState);
  const rewardsState = useSelector(selectRewardsState);
  const watchedToday = useSelector(selectRewardedAdsWatchedToday);
  const lastCompletedAt = useSelector(selectLastRewardedAdCompletedAt);

  useEffect(() => {
    const unsub = realtimeConfigService.subscribe((cfg) => setConfig(cfg));
    return () => unsub();
  }, []);

  const rewardedConfig = selectRewardedAdsConfig(config);

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResolver, setModalResolver] = useState(null);

  // Check network connectivity
  const isOnline = connectivity?.isConnected && connectivity?.isInternetReachable;

  // Register modal handler with adService for development simulation
  useEffect(() => {
    adService.setModalHandler(() => {
      return new Promise((resolve) => {
        setModalResolver(() => resolve);
        setModalVisible(true);
      });
    });
  }, []);

  const handleModalComplete = () => {
    setModalVisible(false);
    if (modalResolver) {
      modalResolver({ completed: true });
      setModalResolver(null);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    if (modalResolver) {
      modalResolver({ completed: false });
      setModalResolver(null);
    }
  };

  // Cooldown calculation
  const getCooldownMinutesLeft = () => {
    if (!lastCompletedAt || !rewardedConfig.cooldownMinutes) return 0;
    const elapsedMs = Date.now() - new Date(lastCompletedAt).getTime();
    const cooldownMs = rewardedConfig.cooldownMinutes * 60 * 1000;
    const remainingMs = cooldownMs - elapsedMs;
    return remainingMs > 0 ? Math.ceil(remainingMs / (60 * 1000)) : 0;
  };

  const cooldownLeft = getCooldownMinutesLeft();
  const isDailyLimitReached =
    rewardedConfig.dailyWatchLimit > 0 && watchedToday >= rewardedConfig.dailyWatchLimit;

  const isFeatureEnabled = Boolean(rewardedConfig.enabled);

  const [isProviderAvailable, setIsProviderAvailable] = useState(() =>
    adService.isRewardedAvailable(placementId)
  );

  useEffect(() => {
    setIsProviderAvailable(adService.isRewardedAvailable(placementId));
    const interval = setInterval(() => {
      const available = adService.isRewardedAvailable(placementId);
      setIsProviderAvailable(available);
      if (available) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [placementId]);

  const canWatch =
    isOnline &&
    isFeatureEnabled &&
    isProviderAvailable &&
    !isDailyLimitReached &&
    cooldownLeft === 0;

  const handlePress = async () => {
    if (!canWatch || isLoading) return;

    setIsLoading(true);
    try {
      const result = await adService.showRewarded(placementId);
      if (result && result.status === 'COMPLETED') {
        rewardService.processRewardedAdCompletion(dispatch, result, rewardsState);
        if (onAdCompleted) {
          onAdCompleted(result);
        }
      }
    } catch (err) {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button title & icon based on state
  let buttonTitle = 'Watch Rewarded Ad';
  let buttonIcon = PlayCircle;
  let disabled = false;

  if (!isOnline) {
    buttonTitle = 'Offline — Ad Unavailable';
    buttonIcon = Lock;
    disabled = true;
  } else if (!isFeatureEnabled) {
    buttonTitle = 'Rewarded Ads Unavailable';
    buttonIcon = Lock;
    disabled = true;
  } else if (isDailyLimitReached) {
    buttonTitle = 'Daily Limit Reached';
    buttonIcon = CheckCircle2;
    disabled = true;
  } else if (cooldownLeft > 0) {
    buttonTitle = `Available in ${cooldownLeft} min`;
    buttonIcon = Clock;
    disabled = true;
  } else if (isLoading) {
    buttonTitle = 'Loading Ad...';
    buttonIcon = PlayCircle;
    disabled = true;
  } else if (!isProviderAvailable) {
    buttonTitle = 'Ad Unavailable';
    buttonIcon = Lock;
    disabled = true;
  }

  return (
    <>
      {disabled ? (
        <SecondaryButton
          title={buttonTitle}
          icon={buttonIcon}
          disabled={true}
          style={[styles.btn, style]}
          accessibilityLabel={buttonTitle}
        />
      ) : (
        <PrimaryButton
          title={buttonTitle}
          icon={buttonIcon}
          onPress={handlePress}
          style={[styles.btn, style]}
          accessibilityLabel="Watch rewarded advertisement to earn points and ad-free time"
        />
      )}

      <RewardedAdModal
        visible={modalVisible}
        onComplete={handleModalComplete}
        onCancel={handleModalCancel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    marginVertical: 4,
  },
});

export default RewardedAdButton;

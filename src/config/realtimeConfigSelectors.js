import { DEFAULT_REALTIME_CONFIG } from './realtimeConfigDefaults';

/**
 * Pure selector helpers for extracting typed sections from Realtime Configuration object.
 */
export const selectDailyCheckInConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.dailyCheckIn || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn;
};

export const selectDailyCheckInUIConfig = (config) => {
  const dci = selectDailyCheckInConfig(config);
  return dci.ui || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn.ui;
};

export const selectRewardSchedule = (config) => {
  const dci = selectDailyCheckInConfig(config);
  return dci.rewardSchedule || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn.rewardSchedule;
};

export const selectRedeemableRewards = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.redeemable || DEFAULT_REALTIME_CONFIG.rewards.redeemable;
};

export const selectEnabledRewards = (config) => {
  const catalog = selectRedeemableRewards(config);
  return Object.keys(catalog)
    .map((id) => ({ id, ...catalog[id] }))
    .filter((pkg) => pkg.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const selectRewardById = (config, rewardId) => {
  if (!rewardId) return null;
  const catalog = selectRedeemableRewards(config);
  const rawPkg = catalog[rewardId];
  if (!rawPkg) return null;
  return { id: rewardId, ...rawPkg };
};

export const selectRewardedAdsConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.rewardedAds || DEFAULT_REALTIME_CONFIG.rewards.rewardedAds;
};

export const selectAdConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.ads || DEFAULT_REALTIME_CONFIG.ads;
};

export const selectFeatureFlags = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.featureFlags || DEFAULT_REALTIME_CONFIG.featureFlags;
};

export default {
  selectDailyCheckInConfig,
  selectDailyCheckInUIConfig,
  selectRewardSchedule,
  selectRedeemableRewards,
  selectEnabledRewards,
  selectRewardById,
  selectRewardedAdsConfig,
  selectAdConfig,
  selectFeatureFlags,
};

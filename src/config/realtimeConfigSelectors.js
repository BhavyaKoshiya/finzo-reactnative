import { DEFAULT_REALTIME_CONFIG, DEFAULT_ADS_CONFIG } from './realtimeConfigDefaults';

/**
 * Pure selector helpers for extracting typed sections from Realtime Configuration object.
 * Authoritative RTDB /config schema compliant.
 */
export const selectDailyCheckInConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.dailyCheckIn || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn;
};

export const selectDailyCheckInUIConfig = (config) => {
  const dci = selectDailyCheckInConfig(config);
  return dci.ui || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn.ui || {};
};

export const selectRewardSchedule = (config) => {
  const dci = selectDailyCheckInConfig(config);
  return dci.rewardSchedule || dci.schedule || DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn.rewardSchedule;
};

export const selectRewardCatalog = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.catalog || active.rewards?.redeemable || active.redemption?.packages || DEFAULT_REALTIME_CONFIG.rewards.catalog;
};

export const selectRedeemableRewards = selectRewardCatalog;

export const selectEnabledRewards = (config) => {
  const catalog = selectRewardCatalog(config);
  return Object.keys(catalog)
    .map((id) => ({ id, ...catalog[id] }))
    .filter((pkg) => pkg.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const selectRewardById = (config, rewardId) => {
  if (!rewardId) return null;
  const catalog = selectRewardCatalog(config);
  const rawPkg = catalog[rewardId];
  if (!rawPkg) return null;
  return { id: rewardId, ...rawPkg };
};

export const selectRewardedAdsConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.rewardedAds || DEFAULT_REALTIME_CONFIG.rewards.rewardedAds;
};

export const selectRewardedAdsEnabled = (config) => {
  return Boolean(selectRewardedAdsConfig(config)?.enabled);
};

export const selectRewardedAdsPointsPerAd = (config) => {
  return Number(selectRewardedAdsConfig(config)?.pointsPerAd) || 0;
};

export const selectRewardedAdsDailyWatchLimit = (config) => {
  return Number(selectRewardedAdsConfig(config)?.dailyWatchLimit) || 0;
};

export const selectRewardedAdsCooldownMinutes = (config) => {
  return Number(selectRewardedAdsConfig(config)?.cooldownMinutes) || 0;
};

export const selectRewardedAdMilestone = (config) => {
  return selectRewardedAdsConfig(config)?.milestone || DEFAULT_REALTIME_CONFIG.rewards.rewardedAds.milestone;
};

export const selectRewardedAdRequiredAds = (config) => {
  return Number(selectRewardedAdMilestone(config)?.requiredAds) || 5;
};

export const selectRewardedAdFreeMinutes = (config) => {
  return Number(selectRewardedAdMilestone(config)?.adFreeMinutes) || 30;
};

export const selectDiscountConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.rewards?.discounts || DEFAULT_REALTIME_CONFIG.rewards.discounts;
};

// ==========================================
// Ads Infrastructure Selectors (Phase 16.16)
// ==========================================

export const selectAdConfig = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.ads || DEFAULT_ADS_CONFIG;
};

export const selectAdsGlobalEnabled = (config) => {
  const adConfig = selectAdConfig(config);
  return Boolean(adConfig?.enabled);
};

export const selectBannerAdsEnabled = (config) => {
  const adConfig = selectAdConfig(config);
  return Boolean(adConfig?.enabled && (adConfig?.banner?.enabled ?? true));
};

export const selectNativeAdsEnabled = (config) => {
  const adConfig = selectAdConfig(config);
  return Boolean(adConfig?.enabled && (adConfig?.native?.enabled ?? true));
};

export const selectInterstitialAdsConfig = (config) => {
  const adConfig = selectAdConfig(config);
  return adConfig?.interstitial || DEFAULT_ADS_CONFIG.interstitial;
};

export const selectInterstitialAdsEnabled = (config) => {
  const adConfig = selectAdConfig(config);
  const inter = selectInterstitialAdsConfig(config);
  return Boolean(adConfig?.enabled && (inter?.enabled ?? true));
};

export const selectInterstitialCooldownMinutes = (config) => {
  const inter = selectInterstitialAdsConfig(config);
  return Number(inter?.cooldownMinutes) ?? 10;
};

export const selectInterstitialMaxPerSession = (config) => {
  const inter = selectInterstitialAdsConfig(config);
  return Number(inter?.maxPerSession) ?? 1;
};

export const selectRewardedAdsPlacementEnabled = (config) => {
  const adConfig = selectAdConfig(config);
  return Boolean(adConfig?.enabled && (adConfig?.rewarded?.enabled ?? true));
};

export const selectPlacementAdConfig = (config, screen) => {
  const adConfig = selectAdConfig(config);
  const placements = adConfig?.placements || DEFAULT_ADS_CONFIG.placements;
  return placements[screen] || { banner: false, native: false, interstitial: false };
};

export const isAdAllowedForPlacement = (config, screen, adType) => {
  if (!selectAdsGlobalEnabled(config)) return false;

  if (adType === 'banner' && !selectBannerAdsEnabled(config)) return false;
  if (adType === 'native' && !selectNativeAdsEnabled(config)) return false;
  if (adType === 'interstitial' && !selectInterstitialAdsEnabled(config)) return false;
  if (adType === 'rewarded' && !selectRewardedAdsPlacementEnabled(config)) return false;

  if (!screen) return true;

  const placementConfig = selectPlacementAdConfig(config, screen);
  return Boolean(placementConfig[adType]);
};

export const selectFeatureFlags = (config) => {
  const active = config || DEFAULT_REALTIME_CONFIG;
  return active.featureFlags || DEFAULT_REALTIME_CONFIG.featureFlags;
};

export default {
  selectDailyCheckInConfig,
  selectDailyCheckInUIConfig,
  selectRewardSchedule,
  selectRewardCatalog,
  selectRedeemableRewards,
  selectEnabledRewards,
  selectRewardById,
  selectRewardedAdsConfig,
  selectRewardedAdsEnabled,
  selectRewardedAdsPointsPerAd,
  selectRewardedAdsDailyWatchLimit,
  selectRewardedAdsCooldownMinutes,
  selectRewardedAdMilestone,
  selectRewardedAdRequiredAds,
  selectRewardedAdFreeMinutes,
  selectDiscountConfig,
  selectAdConfig,
  selectAdsGlobalEnabled,
  selectBannerAdsEnabled,
  selectNativeAdsEnabled,
  selectInterstitialAdsConfig,
  selectInterstitialAdsEnabled,
  selectInterstitialCooldownMinutes,
  selectInterstitialMaxPerSession,
  selectRewardedAdsPlacementEnabled,
  selectPlacementAdConfig,
  isAdAllowedForPlacement,
  selectFeatureFlags,
};

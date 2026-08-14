/**
 * Default local fallback configuration for Finzo Realtime Config.
 * Serves as the safe fallback when remote Firebase RTDB is offline, unavailable, or invalid.
 * Authoritative RTDB /config contract compliant.
 */
export const DEFAULT_ADS_CONFIG = {
  enabled: true,
  rewardedAdsEnabled: true,
  bannerAdsEnabled: true,
  interstitialAdsEnabled: true,
  banner: {
    enabled: true,
  },
  native: {
    enabled: true,
  },
  interstitial: {
    enabled: true,
    cooldownMinutes: 3,
    maxPerSession: 3,
  },
  rewarded: {
    enabled: true,
  },
  placements: {
    home: {
      banner: true,
      native: true,
      interstitial: false,
    },
    calculators: {
      banner: true,
      native: true,
      interstitial: true,
    },
    myLoans: {
      banner: true,
      native: true,
      interstitial: false,
    },
    loanDetails: {
      banner: true,
      native: true,
      interstitial: false,
    },
    profile: {
      banner: true,
      native: true,
      interstitial: false,
    },
    rewards: {
      banner: true,
      native: true,
      interstitial: false,
      rewarded: true,
    },
    tabs: {
      banner: true,
      native: false,
      interstitial: false,
    },
  },
};

export const DEFAULT_REALTIME_CONFIG = {
  version: 1,

  rewards: {
    dailyCheckIn: {
      enabled: true,
      rewardSchedule: [5, 7, 9, 12, 15, 17, 20],
      maxReward: 20,
      resetOnMissedDay: true,
    },

    rewardedAds: {
      enabled: true,
      pointsPerAd: 10,
      dailyWatchLimit: 5,
      cooldownMinutes: 0,
      milestone: {
        enabled: true,
        requiredAds: 5,
        adFreeMinutes: 30,
      },
    },

    catalog: {
      ad_free_1h: {
        enabled: true,
        title: '1 Hour Ad-Free',
        description: 'Remove ads for 1 hour',
        durationMinutes: 60,
        pointsCost: 50,
        icon: 'clock',
      },
      ad_free_6h: {
        enabled: true,
        title: '6 Hours Ad-Free',
        description: 'Remove ads for 6 hours',
        durationMinutes: 360,
        pointsCost: 150,
        icon: 'clock',
      },
      ad_free_24h: {
        enabled: true,
        title: '24 Hours Ad-Free',
        description: 'Remove ads for 24 hours',
        durationMinutes: 1440,
        pointsCost: 400,
        icon: 'calendar',
      },
    },

    discounts: {
      enabled: true,
      items: {},
    },
  },

  ads: DEFAULT_ADS_CONFIG,

  featureFlags: {
    rewardsEnabled: true,
  },
};

export default DEFAULT_REALTIME_CONFIG;

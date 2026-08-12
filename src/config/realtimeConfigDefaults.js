/**
 * Default local fallback configuration for Finzo Realtime Config.
 * Serves as the safe fallback when remote Firebase RTDB is offline, unavailable, or invalid.
 */
export const DEFAULT_REALTIME_CONFIG = {
  version: 1,

  rewards: {
    dailyCheckIn: {
      enabled: true,

      rewardSchedule: {
        1: 5,
        2: 7,
        3: 9,
        4: 12,
        5: 15,
        6: 17,
        7: 20,
      },

      maxReward: 20,
      repeatLastReward: true,
      cycleLength: 7,

      ui: {
        enabled: true,
        title: 'Daily Check-In',
        subtitle: 'Keep your streak going and earn more Finzo Points.',
        newUserTitle: 'Start Your Streak',
        newUserSubtitle: 'Check in every day to unlock bigger rewards.',
        streakTitle: '{count} Day Streak',
        todayRewardLabel: "Today's Reward",
        nextRewardLabel: 'Next Check-In',
        progressTitle: 'Weekly Progress',
        claimButtonText: 'Claim {points} Points',
        claimedButtonText: 'Claimed Today',
        pointsSuffix: 'Points',
        missedStreakMessage: 'Start a new streak today.',
        maxRewardMessage: "You're earning the maximum daily reward!",
        successMessage: '+{points} Points earned!',
        dayLabel: 'Day {day}',
        showProgress: true,
        showNextReward: true,
        showStreak: true,
        showRewardHistory: true,
      },
    },

    redeemable: {
      ad_free_1h: {
        enabled: true,
        type: 'ad_free',
        title: '1 Hour Ad-Free',
        description: 'Enjoy Finzo completely ad-free for 1 hour.',
        pointsCost: 100,
        durationMinutes: 60,
        order: 1,
        discount: {
          enabled: false,
          type: 'percentage',
          value: 0,
          label: '',
          startsAt: null,
          endsAt: null,
        },
      },

      ad_free_6h: {
        enabled: true,
        type: 'ad_free',
        title: '6 Hours Ad-Free',
        description: 'Enjoy Finzo completely ad-free for 6 hours.',
        pointsCost: 300,
        durationMinutes: 360,
        order: 2,
        discount: {
          enabled: false,
          type: 'percentage',
          value: 0,
          label: '',
          startsAt: null,
          endsAt: null,
        },
      },

      ad_free_24h: {
        enabled: true,
        type: 'ad_free',
        title: '24 Hours Ad-Free',
        description: 'Enjoy Finzo completely ad-free for 24 hours.',
        pointsCost: 750,
        durationMinutes: 1440,
        order: 3,
        discount: {
          enabled: false,
          type: 'percentage',
          value: 0,
          label: '',
          startsAt: null,
          endsAt: null,
        },
      },
    },
  },

  ads: {
    enabled: false,
    rewardedEnabled: false,
    rewardedPoints: 0,
    dailyRewardedLimit: 0,
  },

  featureFlags: {
    rewardsEnabled: true,
  },
};

export default DEFAULT_REALTIME_CONFIG;

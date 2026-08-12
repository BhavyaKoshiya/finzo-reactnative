/**
 * Central configuration constants for Finzo Rewards system.
 */
export const DAILY_CHECKIN_POINTS = 20;
export const MAX_REWARD_HISTORY = 100;

export const REWARD_TYPES = {
  DAILY_CHECKIN: 'daily_checkin',
  REDEMPTION: 'reward_redemption',
  REWARDED_AD: 'rewarded_ad', // Prepared for future phase
  ACHIEVEMENT: 'achievement', // Prepared for future phase
  PROMOTIONAL: 'promotional', // Prepared for future phase
};

export const REWARD_TITLES = {
  [REWARD_TYPES.DAILY_CHECKIN]: 'Daily Check-in',
  [REWARD_TYPES.REDEMPTION]: 'Reward Redemption',
  [REWARD_TYPES.REWARDED_AD]: 'Rewarded Ad',
  [REWARD_TYPES.ACHIEVEMENT]: 'Achievement',
  [REWARD_TYPES.PROMOTIONAL]: 'Bonus Reward',
};

export const REDEEMABLE_REWARDS = [
  {
    id: 'ad_free_1h',
    type: 'ad_free',
    title: '1 Hour Ad-Free',
    description: 'Enjoy Finzo completely ad-free for 1 hour.',
    durationMinutes: 60,
    pointsCost: 50,
  },
  {
    id: 'ad_free_6h',
    type: 'ad_free',
    title: '6 Hours Ad-Free',
    description: 'Enjoy Finzo completely ad-free for 6 hours.',
    durationMinutes: 360,
    pointsCost: 150,
  },
  {
    id: 'ad_free_24h',
    type: 'ad_free',
    title: '24 Hours Ad-Free',
    description: 'Enjoy Finzo completely ad-free for 24 hours.',
    durationMinutes: 1440,
    pointsCost: 400,
  },
];

export default {
  DAILY_CHECKIN_POINTS,
  MAX_REWARD_HISTORY,
  REWARD_TYPES,
  REWARD_TITLES,
  REDEEMABLE_REWARDS,
};

import { validateRealtimeConfig } from '../realtimeConfigSchema';
import {
  selectDailyCheckInConfig,
  selectRewardedAdsConfig,
  selectRewardedAdsPointsPerAd,
  selectRewardedAdsDailyWatchLimit,
  selectRewardedAdsCooldownMinutes,
  selectRewardedAdRequiredAds,
  selectRewardedAdFreeMinutes,
  selectRewardCatalog,
  selectDiscountConfig,
} from '../realtimeConfigSelectors';
import { getDailyCheckInReward } from '../../features/rewards/utils/dailyCheckInUtils';

describe('Phase 16.15 — Authoritative RTDB Configuration Contract Audit Test', () => {
  const AUTHORITATIVE_RTDB_JSON = {
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
  };

  it('1. Authoritative RTDB JSON passes schema validation with 0 errors', () => {
    const res = validateRealtimeConfig(AUTHORITATIVE_RTDB_JSON);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('2. Daily Check-In reward schedule array yields exact expected values (Day 1..8)', () => {
    expect(getDailyCheckInReward(0, AUTHORITATIVE_RTDB_JSON)).toBe(5); // Day 1
    expect(getDailyCheckInReward(1, AUTHORITATIVE_RTDB_JSON)).toBe(7); // Day 2
    expect(getDailyCheckInReward(2, AUTHORITATIVE_RTDB_JSON)).toBe(9); // Day 3
    expect(getDailyCheckInReward(3, AUTHORITATIVE_RTDB_JSON)).toBe(12); // Day 4
    expect(getDailyCheckInReward(4, AUTHORITATIVE_RTDB_JSON)).toBe(15); // Day 5
    expect(getDailyCheckInReward(5, AUTHORITATIVE_RTDB_JSON)).toBe(17); // Day 6
    expect(getDailyCheckInReward(6, AUTHORITATIVE_RTDB_JSON)).toBe(20); // Day 7
    expect(getDailyCheckInReward(7, AUTHORITATIVE_RTDB_JSON)).toBe(20); // Day 8+
  });

  it('3. Rewarded Ads selectors return exact expected configuration values', () => {
    expect(selectRewardedAdsPointsPerAd(AUTHORITATIVE_RTDB_JSON)).toBe(10);
    expect(selectRewardedAdsDailyWatchLimit(AUTHORITATIVE_RTDB_JSON)).toBe(5);
    expect(selectRewardedAdsCooldownMinutes(AUTHORITATIVE_RTDB_JSON)).toBe(0);
    expect(selectRewardedAdRequiredAds(AUTHORITATIVE_RTDB_JSON)).toBe(5);
    expect(selectRewardedAdFreeMinutes(AUTHORITATIVE_RTDB_JSON)).toBe(30);
  });

  it('4. Catalog selector returns exact 3 packages with correct pointsCost (50, 150, 400)', () => {
    const catalog = selectRewardCatalog(AUTHORITATIVE_RTDB_JSON);
    expect(catalog.ad_free_1h.pointsCost).toBe(50);
    expect(catalog.ad_free_6h.pointsCost).toBe(150);
    expect(catalog.ad_free_24h.pointsCost).toBe(400);
  });

  it('5. Discounts config selector extracts discounts section cleanly', () => {
    const disc = selectDiscountConfig(AUTHORITATIVE_RTDB_JSON);
    expect(disc.enabled).toBe(true);
    expect(disc.items).toEqual({});
  });
});

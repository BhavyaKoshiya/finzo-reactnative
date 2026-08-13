import rewardsReducer, {
  claimDailyCheckIn,
  redeemReward,
  selectRewardPoints,
  selectCurrentStreak,
  selectLongestStreak,
  selectTotalCheckIns,
  selectRewardHistory,
  selectHasCheckedInToday,
  selectIsAdFree,
  selectAdFreeExpiryFormatted,
} from '../../../store/slices/rewardsSlice';
import { REWARD_TYPES } from '../config/rewardConfig';

describe('rewardsSlice & Selectors', () => {
  it('should return initial state', () => {
    const state = rewardsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      totalCheckIns: 0,
      adFreeUntil: null,
      rewardHistory: [],
      rewardedAdsWatchedToday: 0,
      rewardedAdsWatchDate: null,
      rewardedAdMilestoneClaimedDate: null,
      lastRewardedAdCompletedAt: null,
      schemaVersion: 1,
    });
  });

  it('should claim daily reward with dynamic points and store snapshot metadata', () => {
    const day1 = '2026-08-11T10:00:00.000Z';
    const state1 = rewardsReducer(undefined, claimDailyCheckIn({ points: 17, scheduleDay: 6, date: day1 }));

    expect(state1.points).toBe(17);
    expect(state1.currentStreak).toBe(1);
    expect(state1.totalCheckIns).toBe(1);
    expect(state1.rewardHistory[0].points).toBe(17);
    expect(state1.rewardHistory[0].metadata.pointsAwarded).toBe(17);
    expect(state1.rewardHistory[0].metadata.rewardScheduleDay).toBe(6);
  });

  it('should redeem reward with discount and snapshot transaction metadata', () => {
    const now = '2026-08-11T10:00:00.000Z';
    const state1 = {
      points: 800,
      currentStreak: 5,
      longestStreak: 5,
      lastCheckInDate: now,
      totalCheckIns: 5,
      adFreeUntil: null,
      rewardHistory: [],
      schemaVersion: 1,
    };

    const rewardPackage = {
      id: 'ad_free_24h',
      title: '24 Hours Ad-Free',
      durationMinutes: 1440,
      pointsCost: 750,
      discount: {
        enabled: true,
        type: 'percentage',
        value: 20,
      },
    };

    const state2 = rewardsReducer(state1, redeemReward({ reward: rewardPackage, rewardId: 'ad_free_24h', date: now }));

    expect(state2.points).toBe(200); // 800 - 600 = 200
    expect(state2.adFreeUntil).toBe(new Date('2026-08-12T10:00:00.000Z').toISOString());
    expect(state2.rewardHistory[0].points).toBe(-600);
    expect(state2.rewardHistory[0].metadata.basePointsCost).toBe(750);
    expect(state2.rewardHistory[0].metadata.finalPointsCost).toBe(600);
    expect(state2.rewardHistory[0].metadata.discountAmount).toBe(150);
  });

  it('should prevent redemption when user points are below final discounted price', () => {
    const state1 = {
      points: 500,
      adFreeUntil: null,
      rewardHistory: [],
    };
    const rewardPackage = {
      id: 'ad_free_24h',
      pointsCost: 750,
      discount: { enabled: false },
    };

    const state2 = rewardsReducer(state1, redeemReward({ reward: rewardPackage }));

    expect(state2.points).toBe(500);
    expect(state2.rewardHistory.length).toBe(0);
  });

  it('should select values correctly using selectors', () => {
    const mockState = {
      rewards: {
        points: 120,
        currentStreak: 6,
        longestStreak: 12,
        lastCheckInDate: new Date().toISOString(),
        totalCheckIns: 10,
        adFreeUntil: new Date(Date.now() + 3600000).toISOString(),
        rewardHistory: [
          { id: '1', type: REWARD_TYPES.DAILY_CHECKIN, points: 20 },
          { id: '2', type: REWARD_TYPES.REDEMPTION, points: -50 },
        ],
      },
    };

    expect(selectRewardPoints(mockState)).toBe(120);
    expect(selectCurrentStreak(mockState)).toBe(6);
    expect(selectLongestStreak(mockState)).toBe(12);
    expect(selectTotalCheckIns(mockState)).toBe(10);
    expect(selectRewardHistory(mockState).length).toBe(2);
    expect(selectHasCheckedInToday(mockState)).toBe(true);
    expect(selectIsAdFree(mockState)).toBe(true);
    expect(selectAdFreeExpiryFormatted(mockState)).toContain('Until');
  });
});

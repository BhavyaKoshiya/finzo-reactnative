import rewardsReducer, {
  recordRewardedAdCompletion,
  claimRewardedAdMilestone,
  resetDailyRewardedAdsLimit,
  selectRewardedAdsWatchedToday,
  selectIsRewardedMilestoneClaimedToday,
  selectRewardPoints,
  selectIsAdFree,
  selectRewardHistory,
} from '../../../store/slices/rewardsSlice';
import rewardService from '../services/rewardService';
import { REWARD_TYPES } from '../config/rewardConfig';
import { realtimeConfigService } from '../../../config/realtimeConfigService';

describe('Phase 16.15 — Rewarded Ad & Milestone Business Logic', () => {
  beforeEach(() => {
    realtimeConfigService.activeConfig = {
      version: 1,
      rewards: {
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
      },
    };
  });

  it('records rewarded ad completion and increments points', () => {
    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const initialPoints = state.points;

    state = rewardsReducer(
      state,
      recordRewardedAdCompletion({
        pointsAwarded: 10,
        transactionId: 'tx_123',
        provider: 'simulated',
      })
    );

    expect(state.points).toBe(initialPoints + 10);
    expect(state.rewardedAdsWatchedToday).toBe(1);
    expect(state.rewardHistory[0].type).toBe(REWARD_TYPES.REWARDED_AD);
    expect(state.rewardHistory[0].points).toBe(10);
  });

  it('claims ad-free milestone idempotently and stacks entitlement', () => {
    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const todayKey = new Date().toISOString().substring(0, 10);

    // Initial claim
    state = rewardsReducer(
      state,
      claimRewardedAdMilestone({
        dateKey: todayKey,
        requiredAds: 5,
        adFreeMinutes: 30,
      })
    );

    expect(state.rewardedAdMilestoneClaimedDate).toBe(todayKey);
    expect(state.adFreeUntil).not.toBeNull();
    const expiryTime1 = new Date(state.adFreeUntil).getTime();

    // Duplicate claim on same day (Idempotency)
    state = rewardsReducer(
      state,
      claimRewardedAdMilestone({
        dateKey: todayKey,
        requiredAds: 5,
        adFreeMinutes: 30,
      })
    );

    // Expiry time must remain unchanged (duplicate claim ignored)
    expect(new Date(state.adFreeUntil).getTime()).toBe(expiryTime1);
  });

  it('rewardService.processRewardedAdCompletion grants points and automatically claims milestone on 5th ad', () => {
    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const dispatch = (action) => {
      state = rewardsReducer(state, action);
    };

    for (let i = 1; i <= 5; i++) {
      const res = rewardService.processRewardedAdCompletion(
        dispatch,
        { status: 'COMPLETED', transactionId: `tx_${i}`, provider: 'simulated' },
        state
      );
      expect(res.success).toBe(true);
    }

    expect(state.rewardedAdsWatchedToday).toBe(5);
    expect(state.points).toBe(50); // 5 ads * 10 points
    expect(state.rewardedAdMilestoneClaimedDate).toBe(new Date().toISOString().substring(0, 10));
    expect(state.adFreeUntil).not.toBeNull();
  });

  it('ignores cancelled or failed ad completions', () => {
    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const dispatch = (action) => {
      state = rewardsReducer(state, action);
    };

    const resCancel = rewardService.processRewardedAdCompletion(
      dispatch,
      { status: 'CANCELLED', transactionId: 'tx_cancel', provider: 'simulated' },
      state
    );
    expect(resCancel.success).toBe(false);
    expect(state.rewardedAdsWatchedToday).toBe(0);

    const resFail = rewardService.processRewardedAdCompletion(
      dispatch,
      { status: 'FAILED', transactionId: 'tx_fail', provider: 'simulated' },
      state
    );
    expect(resFail.success).toBe(false);
    expect(state.rewardedAdsWatchedToday).toBe(0);
  });

  it('resets daily limit and milestone claim date via dev control', () => {
    let state = rewardsReducer(undefined, { type: '@@INIT' });
    state = rewardsReducer(
      state,
      recordRewardedAdCompletion({ pointsAwarded: 10, transactionId: 'tx_1' })
    );
    expect(state.rewardedAdsWatchedToday).toBe(1);

    state = rewardsReducer(state, resetDailyRewardedAdsLimit());
    expect(state.rewardedAdsWatchedToday).toBe(0);
    expect(state.rewardedAdMilestoneClaimedDate).toBeNull();
  });
});

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

  it('supports multi-stackable ad-free milestones when isStackable is true', () => {
    realtimeConfigService.activeConfig.rewards.rewardedAds.milestone = {
      enabled: true,
      requiredAds: 5,
      adFreeMinutes: 360,
      isStackable: true,
    };

    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const dispatch = (action) => {
      state = rewardsReducer(state, action);
    };

    const startTime = new Date(2026, 7, 11, 12, 0, 0);

    // Cycle 1: watch 5 ads
    for (let i = 1; i <= 5; i++) {
      const res = rewardService.processRewardedAdCompletion(
        dispatch,
        { status: 'COMPLETED', transactionId: `cycle1_ad_${i}`, provider: 'simulated' },
        state
      );
      expect(res.success).toBe(true);
    }

    // Cycle 1 completed: counter reset to 0, points = 50, adFreeUntil set
    expect(state.rewardedAdsWatchedToday).toBe(0);
    expect(state.points).toBe(50);
    expect(state.adFreeUntil).not.toBeNull();
    const expiryAfterCycle1 = new Date(state.adFreeUntil).getTime();

    // Cycle 2: watch 5 more ads to stack!
    for (let i = 1; i <= 5; i++) {
      const res = rewardService.processRewardedAdCompletion(
        dispatch,
        { status: 'COMPLETED', transactionId: `cycle2_ad_${i}`, provider: 'simulated' },
        state
      );
      expect(res.success).toBe(true);
    }

    // Cycle 2 completed: counter reset to 0, points = 100, adFreeUntil extended by another 360 minutes!
    expect(state.rewardedAdsWatchedToday).toBe(0);
    expect(state.points).toBe(100);
    const expiryAfterCycle2 = new Date(state.adFreeUntil).getTime();

    expect(expiryAfterCycle2 - expiryAfterCycle1).toBe(360 * 60 * 1000);
  });

  it('prevents premature milestone award across midnight when 4 ads watched yesterday and 1 today', () => {
    realtimeConfigService.activeConfig.rewards.rewardedAds.milestone = {
      enabled: true,
      requiredAds: 5,
      adFreeMinutes: 30,
      isStackable: false,
    };

    let state = rewardsReducer(undefined, { type: '@@INIT' });
    const dispatch = (action) => {
      state = rewardsReducer(state, action);
    };

    const yesterdayDate = new Date(2026, 8, 6, 23, 30, 0); // Yesterday 11:30 PM

    // User watched 4 ads yesterday before midnight
    for (let i = 1; i <= 4; i++) {
      state = rewardsReducer(
        state,
        recordRewardedAdCompletion({
          pointsAwarded: 10,
          transactionId: `yesterday_ad_${i}`,
          date: yesterdayDate,
          milestone: { enabled: true, requiredAds: 5, adFreeMinutes: 30 },
        })
      );
    }

    expect(state.rewardedAdsWatchedToday).toBe(4);
    expect(state.adFreeUntil).toBeNull(); // 4 ads < 5 required

    const todayDate = new Date(2026, 8, 7, 0, 15, 0); // Today 12:15 AM (after midnight)

    // User watches 1 ad today
    state = rewardsReducer(
      state,
      recordRewardedAdCompletion({
        pointsAwarded: 10,
        transactionId: 'today_ad_1',
        date: todayDate,
        milestone: { enabled: true, requiredAds: 5, adFreeMinutes: 30 },
      })
    );

    // CRUCIAL: state for today must be 1 (reset from yesterday's 4), NOT 5!
    expect(state.rewardedAdsWatchedToday).toBe(1);
    // CRUCIAL: ad-free milestone must NOT be awarded because user has only watched 1 ad today!
    expect(state.adFreeUntil).toBeNull();
    expect(state.rewardedAdMilestoneClaimedDate).toBeNull();
  });
});

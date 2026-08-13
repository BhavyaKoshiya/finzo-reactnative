import { createSlice } from '@reduxjs/toolkit';
import { MAX_REWARD_HISTORY, REWARD_TYPES } from '../../features/rewards/config/rewardConfig';
import { hasCheckedInToday } from '../../features/rewards/utils/dateUtils';
import { calculateStreakAfterCheckIn } from '../../features/rewards/utils/streakUtils';
import { isAdFreeActive, formatAdFreeExpiry } from '../../features/rewards/utils/rewardUtils';
import { calculateRewardPrice } from '../../features/rewards/utils/discountUtils';
import logger from '../../services/logger';

const getLocalDateKey = (d = new Date()) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const da = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
};

const initialState = {
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
};

const ensureDailyReset = (state, now = new Date()) => {
  const todayKey = getLocalDateKey(now);
  if (state.rewardedAdsWatchDate !== todayKey) {
    state.rewardedAdsWatchedToday = 0;
    state.rewardedAdsWatchDate = todayKey;
  }
};

export const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    claimDailyCheckIn: (state, action) => {
      const now = action?.payload?.date ? new Date(action.payload.date) : new Date();
      const nowIso = now.toISOString();

      // Idempotency check: prevent duplicate same-day claims
      if (hasCheckedInToday(state.lastCheckInDate, now)) {
        logger.info('Daily check-in skipped: already claimed today', { lastCheckInDate: state.lastCheckInDate });
        return;
      }

      const pointsToAward = typeof action.payload?.points === 'number' ? action.payload.points : 5;
      const scheduleDay = typeof action.payload?.scheduleDay === 'number' ? action.payload.scheduleDay : 1;

      const newStreak = calculateStreakAfterCheckIn(state.lastCheckInDate, state.currentStreak, now);
      state.currentStreak = newStreak;
      state.longestStreak = Math.max(state.longestStreak, newStreak);
      state.points += pointsToAward;
      state.totalCheckIns += 1;
      state.lastCheckInDate = nowIso;

      const transaction = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: REWARD_TYPES.DAILY_CHECKIN,
        points: pointsToAward,
        createdAt: nowIso,
        metadata: {
          streakDay: newStreak,
          rewardScheduleDay: scheduleDay,
          pointsAwarded: pointsToAward,
        },
      };

      state.rewardHistory = [transaction, ...state.rewardHistory].slice(0, MAX_REWARD_HISTORY);
      logger.info('Daily reward claimed successfully', { pointsAwarded: pointsToAward, totalPoints: state.points, streak: newStreak });
    },
    redeemReward: (state, action) => {
      const payload = action.payload || {};
      const reward = payload.reward;
      const rewardId = payload.rewardId || reward?.id;

      if (!reward || !rewardId) {
        logger.warn('Redemption failed: missing reward payload', { payload });
        return;
      }

      const now = payload.date ? new Date(payload.date) : new Date();
      const nowIso = now.toISOString();

      // Calculate dynamic price & discount
      const priceInfo = calculateRewardPrice(reward, now);
      const pointsDeducted = priceInfo.finalPointsCost;

      if (state.points < pointsDeducted) {
        logger.warn('Redemption failed: insufficient points', {
          points: state.points,
          requiredPoints: pointsDeducted,
        });
        return;
      }

      // Entitlement stacking calculation:
      // baseTime = max(now, existing adFreeUntil if unexpired)
      const isCurrentlyActive = isAdFreeActive(state.adFreeUntil, now);
      const baseTime = isCurrentlyActive && state.adFreeUntil ? new Date(state.adFreeUntil) : now;
      const newExpiryDate = new Date(baseTime.getTime() + reward.durationMinutes * 60 * 1000);
      const newExpiryIso = newExpiryDate.toISOString();

      // Atomic state updates
      state.points -= pointsDeducted;
      state.adFreeUntil = newExpiryIso;

      const transaction = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: REWARD_TYPES.REDEMPTION,
        points: -pointsDeducted,
        createdAt: nowIso,
        metadata: {
          rewardId: reward.id,
          title: reward.title,
          durationMinutes: reward.durationMinutes,
          basePointsCost: priceInfo.basePointsCost,
          finalPointsCost: priceInfo.finalPointsCost,
          discountAmount: priceInfo.discountAmount,
          discountType: priceInfo.discountType || null,
          discountValue: priceInfo.discountValue || null,
          discountLabel: priceInfo.discountLabel || '',
        },
      };

      state.rewardHistory = [transaction, ...state.rewardHistory].slice(0, MAX_REWARD_HISTORY);
      logger.info('Reward redeemed successfully', {
        rewardId: reward.id,
        pointsDeducted,
        remainingPoints: state.points,
        newExpiryIso,
      });
    },
    recordRewardedAdCompletion: (state, action) => {
      const payload = action.payload || {};
      const now = payload.date ? new Date(payload.date) : new Date();
      const nowIso = now.toISOString();

      ensureDailyReset(state, now);

      const pointsAwarded = typeof payload.pointsAwarded === 'number' ? payload.pointsAwarded : 10;
      const transactionId = payload.transactionId || `tx_${Date.now()}`;
      const provider = payload.provider || 'simulated';

      state.rewardedAdsWatchedToday += 1;
      state.points += pointsAwarded;
      state.lastRewardedAdCompletedAt = nowIso;

      const transaction = {
        id: `rewarded_ad_${transactionId}_${Date.now()}`,
        type: REWARD_TYPES.REWARDED_AD,
        points: pointsAwarded,
        createdAt: nowIso,
        metadata: {
          provider,
          transactionId,
          pointsAwarded,
          completedAt: nowIso,
        },
      };

      state.rewardHistory = [transaction, ...state.rewardHistory].slice(0, MAX_REWARD_HISTORY);
      logger.info('Rewarded ad completion recorded', {
        pointsAwarded,
        totalWatchedToday: state.rewardedAdsWatchedToday,
        totalPoints: state.points,
      });
    },

    claimRewardedAdMilestone: (state, action) => {
      const payload = action.payload || {};
      const now = payload.date ? new Date(payload.date) : new Date();
      const nowIso = now.toISOString();
      const todayKey = payload.dateKey || getLocalDateKey(now);

      // Idempotency check: prevent duplicate milestone claims on same calendar day
      if (state.rewardedAdMilestoneClaimedDate === todayKey) {
        logger.info('Rewarded ad milestone claim skipped: already claimed for date', { todayKey });
        return;
      }

      const adFreeMinutes = typeof payload.adFreeMinutes === 'number' ? payload.adFreeMinutes : 30;
      const requiredAds = typeof payload.requiredAds === 'number' ? payload.requiredAds : 5;

      // Entitlement stacking calculation:
      const isCurrentlyActive = isAdFreeActive(state.adFreeUntil, now);
      const baseTime = isCurrentlyActive && state.adFreeUntil ? new Date(state.adFreeUntil) : now;
      const newExpiryDate = new Date(baseTime.getTime() + adFreeMinutes * 60 * 1000);
      const newExpiryIso = newExpiryDate.toISOString();

      state.adFreeUntil = newExpiryIso;
      state.rewardedAdMilestoneClaimedDate = todayKey;

      const transaction = {
        id: `milestone_${todayKey}_${Date.now()}`,
        type: REWARD_TYPES.REWARDED_AD_MILESTONE,
        points: 0,
        createdAt: nowIso,
        metadata: {
          dateKey: todayKey,
          completedAds: requiredAds,
          requiredAds,
          adFreeMinutes,
        },
      };

      state.rewardHistory = [transaction, ...state.rewardHistory].slice(0, MAX_REWARD_HISTORY);
      logger.info('Rewarded ad milestone claimed successfully', {
        todayKey,
        adFreeMinutes,
        newExpiryIso,
      });
    },

    resetDailyRewardedAdsLimit: (state) => {
      state.rewardedAdsWatchedToday = 0;
      state.rewardedAdMilestoneClaimedDate = null;
      state.lastRewardedAdCompletedAt = null;
    },

    resetRewards: () => initialState,
  },
});

export const {
  claimDailyCheckIn,
  redeemReward,
  recordRewardedAdCompletion,
  claimRewardedAdMilestone,
  resetDailyRewardedAdsLimit,
  resetRewards,
} = rewardsSlice.actions;

// Selectors
export const selectRewardsState = (state) => state.rewards || initialState;
export const selectRewardPoints = (state) => selectRewardsState(state).points;
export const selectCurrentStreak = (state) => selectRewardsState(state).currentStreak;
export const selectLongestStreak = (state) => selectRewardsState(state).longestStreak;
export const selectLastCheckInDate = (state) => selectRewardsState(state).lastCheckInDate;
export const selectTotalCheckIns = (state) => selectRewardsState(state).totalCheckIns;
export const selectAdFreeUntil = (state) => selectRewardsState(state).adFreeUntil;
export const selectRewardHistory = (state) => selectRewardsState(state).rewardHistory || [];

export const selectRewardedAdsWatchedToday = (state) => {
  const rewards = selectRewardsState(state);
  const todayKey = getLocalDateKey();
  if (rewards.rewardedAdsWatchDate !== todayKey) {
    return 0;
  }
  return rewards.rewardedAdsWatchedToday || 0;
};

export const selectRewardedAdMilestoneClaimedDate = (state) =>
  selectRewardsState(state).rewardedAdMilestoneClaimedDate;

export const selectLastRewardedAdCompletedAt = (state) =>
  selectRewardsState(state).lastRewardedAdCompletedAt;

export const selectIsRewardedMilestoneClaimedToday = (state) => {
  const claimedDate = selectRewardedAdMilestoneClaimedDate(state);
  return claimedDate === getLocalDateKey();
};

export const selectHasCheckedInToday = (state) =>
  hasCheckedInToday(selectLastCheckInDate(state));

export const selectIsAdFree = (state) =>
  isAdFreeActive(selectAdFreeUntil(state));

export const selectAdFreeExpiryFormatted = (state) =>
  formatAdFreeExpiry(selectAdFreeUntil(state));

export default rewardsSlice.reducer;

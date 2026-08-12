import { createSlice } from '@reduxjs/toolkit';
import { MAX_REWARD_HISTORY, REWARD_TYPES } from '../../features/rewards/config/rewardConfig';
import { hasCheckedInToday } from '../../features/rewards/utils/dateUtils';
import { calculateStreakAfterCheckIn } from '../../features/rewards/utils/streakUtils';
import { isAdFreeActive, formatAdFreeExpiry } from '../../features/rewards/utils/rewardUtils';
import { calculateRewardPrice } from '../../features/rewards/utils/discountUtils';
import logger from '../../services/logger';

const initialState = {
  points: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCheckInDate: null,
  totalCheckIns: 0,
  adFreeUntil: null,
  rewardHistory: [],
  schemaVersion: 1,
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
    resetRewards: () => initialState,
  },
});

export const { claimDailyCheckIn, redeemReward, resetRewards } = rewardsSlice.actions;

// Selectors
export const selectRewardsState = (state) => state.rewards || initialState;
export const selectRewardPoints = (state) => selectRewardsState(state).points;
export const selectCurrentStreak = (state) => selectRewardsState(state).currentStreak;
export const selectLongestStreak = (state) => selectRewardsState(state).longestStreak;
export const selectLastCheckInDate = (state) => selectRewardsState(state).lastCheckInDate;
export const selectTotalCheckIns = (state) => selectRewardsState(state).totalCheckIns;
export const selectAdFreeUntil = (state) => selectRewardsState(state).adFreeUntil;
export const selectRewardHistory = (state) => selectRewardsState(state).rewardHistory || [];

export const selectHasCheckedInToday = (state) =>
  hasCheckedInToday(selectLastCheckInDate(state));

export const selectIsAdFree = (state) =>
  isAdFreeActive(selectAdFreeUntil(state));

export const selectAdFreeExpiryFormatted = (state) =>
  formatAdFreeExpiry(selectAdFreeUntil(state));

export default rewardsSlice.reducer;

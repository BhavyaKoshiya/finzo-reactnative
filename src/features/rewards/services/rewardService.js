import { claimDailyCheckIn, redeemReward } from '../../../store/slices/rewardsSlice';
import { realtimeConfigService } from '../../../config/realtimeConfigService';
import { getDailyCheckInReward, getRewardScheduleDay } from '../utils/dailyCheckInUtils';
import { selectRewardById } from '../../../config/realtimeConfigSelectors';
import logger from '../../../services/logger';

/**
 * Reward Service
 * Encapsulates reward business operations with active configuration integration.
 */
export const rewardService = {
  /**
   * Executes daily check-in claim using active configuration rules.
   */
  claimDailyCheckIn: (dispatch, currentStreak = 0) => {
    if (!dispatch) {
      logger.warn('rewardService.claimDailyCheckIn: dispatch function missing');
      return;
    }

    const config = realtimeConfigService.getConfig();
    const pointsToAward = getDailyCheckInReward(currentStreak, config);
    const scheduleDay = getRewardScheduleDay(currentStreak, config);

    dispatch(claimDailyCheckIn({ points: pointsToAward, scheduleDay }));
  },

  /**
   * Executes point redemption using active configuration package and calculated price.
   */
  redeemReward: (dispatch, rewardId) => {
    if (!dispatch) {
      logger.warn('rewardService.redeemReward: dispatch function missing');
      return;
    }

    const config = realtimeConfigService.getConfig();
    const reward = selectRewardById(config, rewardId);

    if (!reward) {
      logger.warn('rewardService.redeemReward: reward package not found in active config', { rewardId });
      return;
    }

    dispatch(redeemReward({ reward, rewardId: reward.id }));
  },
};

export default rewardService;

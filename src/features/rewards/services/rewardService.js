import {
  claimDailyCheckIn,
  redeemReward,
  recordRewardedAdCompletion,
  claimRewardedAdMilestone,
} from '../../../store/slices/rewardsSlice';
import { realtimeConfigService } from '../../../config/realtimeConfigService';
import { getDailyCheckInReward, getRewardScheduleDay } from '../utils/dailyCheckInUtils';
import { selectRewardById, selectRewardedAdsConfig } from '../../../config/realtimeConfigSelectors';
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

  /**
   * Processes a successful rewarded ad completion using active configuration.
   * Atomically awards points per ad and checks/claims ad-free milestone if target reached.
   */
  processRewardedAdCompletion: (dispatch, adCompletionResult, currentState = {}) => {
    if (!dispatch) {
      logger.warn('rewardService.processRewardedAdCompletion: dispatch function missing');
      return { success: false, reason: 'Dispatch missing' };
    }

    if (!adCompletionResult || adCompletionResult.status !== 'COMPLETED') {
      logger.info('rewardService.processRewardedAdCompletion: ad not completed', { adCompletionResult });
      return { success: false, reason: 'Ad not completed' };
    }

    const config = realtimeConfigService.getConfig();
    const rewardedConfig = selectRewardedAdsConfig(config);

    if (!rewardedConfig.enabled) {
      logger.warn('rewardService.processRewardedAdCompletion: rewarded ads feature disabled in RTDB config');
      return { success: false, reason: 'Feature disabled' };
    }

    const pointsToAward = Number(rewardedConfig.pointsPerAd) || 0;
    const milestone = rewardedConfig.milestone;

    // Dispatch point completion and atomic milestone evaluation (safe against midnight date change)
    dispatch(
      recordRewardedAdCompletion({
        pointsAwarded: pointsToAward,
        transactionId: adCompletionResult.transactionId,
        provider: adCompletionResult.provider,
        milestone: milestone && milestone.enabled ? {
          enabled: true,
          requiredAds: milestone.requiredAds,
          adFreeMinutes: milestone.adFreeMinutes,
          isStackable: Boolean(milestone.isStackable),
        } : null,
      })
    );

    return { success: true, pointsAwarded: pointsToAward };
  },
};

export default rewardService;

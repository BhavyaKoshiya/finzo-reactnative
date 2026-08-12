import { format, isToday, parseISO } from 'date-fns';
import { realtimeConfigService } from '../../../config/realtimeConfigService';
import { selectEnabledRewards, selectRewardById as selectConfigRewardById } from '../../../config/realtimeConfigSelectors';
import { calculateRewardPrice } from './discountUtils';

/**
 * Determines whether ad-free entitlement is currently active.
 */
export const isAdFreeActive = (adFreeUntil, targetDate = new Date()) => {
  if (!adFreeUntil) return false;
  const expiryDate = adFreeUntil instanceof Date ? adFreeUntil : new Date(adFreeUntil);
  if (isNaN(expiryDate.getTime())) return false;
  return expiryDate.getTime() > targetDate.getTime();
};

/**
 * Returns the active list of enabled redeemable reward packages from configuration.
 */
export const getRedeemableRewards = () => {
  const config = realtimeConfigService.getConfig();
  return selectEnabledRewards(config);
};

/**
 * Finds a reward package by its ID from active configuration.
 */
export const getRewardById = (rewardId) => {
  if (!rewardId) return null;
  const config = realtimeConfigService.getConfig();
  return selectConfigRewardById(config, rewardId);
};

/**
 * Pure function checking whether a user has enough points to redeem a reward package,
 * taking into account any active discounts.
 */
export const canRedeemReward = (points, rewardOrId, targetDate = new Date()) => {
  const reward = typeof rewardOrId === 'string' ? getRewardById(rewardOrId) : rewardOrId;
  if (!reward) return false;

  const { finalPointsCost } = calculateRewardPrice(reward, targetDate);
  return typeof points === 'number' && points >= finalPointsCost;
};

/**
 * Formats an ISO ad-free expiry timestamp into user-friendly text.
 */
export const formatAdFreeExpiry = (adFreeUntil) => {
  if (!adFreeUntil) return null;
  let parsed;
  try {
    parsed = adFreeUntil instanceof Date ? adFreeUntil : parseISO(adFreeUntil);
  } catch (_e) {
    parsed = new Date(adFreeUntil);
  }
  if (!parsed || isNaN(parsed.getTime())) return null;

  if (isToday(parsed)) {
    return `Until ${format(parsed, 'h:mm a')}`;
  }
  return `Until ${format(parsed, 'MMM d, h:mm a')}`;
};

/**
 * Calculates remaining active ad-free minutes.
 */
export const getAdFreeRemainingMinutes = (adFreeUntil, targetDate = new Date()) => {
  if (!isAdFreeActive(adFreeUntil, targetDate)) return 0;
  const expiryDate = adFreeUntil instanceof Date ? adFreeUntil : new Date(adFreeUntil);
  const diffMs = expiryDate.getTime() - targetDate.getTime();
  return Math.max(0, Math.ceil(diffMs / (60 * 1000)));
};

export default {
  isAdFreeActive,
  getRedeemableRewards,
  getRewardById,
  canRedeemReward,
  formatAdFreeExpiry,
  getAdFreeRemainingMinutes,
};

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

/**
 * Formats a duration in minutes into user-friendly text (supporting hours and days).
 *
 * Styles:
 * - 'short' (default): "30 min", "1 hr", "1 hr 30 min", "6 hrs", "1 day", "1 day 12 hrs", "2 days"
 * - 'long': "30 minutes", "1 hour", "1 hour 30 minutes", "6 hours", "1 day", "1 day 12 hours", "2 days"
 * - 'descriptor': "30-minute", "1-hour", "1-hour 30-minute", "6-hour", "1-day", "2-day"
 * - 'badge': "30m", "1h", "1h 30m", "6h", "1d", "1d 12h"
 */
export const formatAdFreeDuration = (totalMinutesInput, { style = 'short' } = {}) => {
  const totalMinutes = Math.max(0, Math.round(Number(totalMinutesInput) || 0));
  if (totalMinutes === 0) {
    if (style === 'long') return '0 minutes';
    if (style === 'descriptor') return '0-minute';
    if (style === 'badge') return '0m';
    return '0 min';
  }

  const days = Math.floor(totalMinutes / 1440);
  const remAfterDays = totalMinutes % 1440;
  const hours = Math.floor(remAfterDays / 60);
  const mins = remAfterDays % 60;

  if (style === 'badge') {
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 && days === 0) parts.push(`${mins}m`);
    return parts.join(' ') || `${mins}m`;
  }

  if (style === 'descriptor') {
    const parts = [];
    if (days > 0) parts.push(`${days}-day`);
    if (hours > 0) parts.push(`${hours}-hour`);
    if (mins > 0) parts.push(`${mins}-minute`);
    return parts.join(' ');
  }

  if (style === 'long') {
    const parts = [];
    if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (mins > 0) parts.push(`${mins} minute${mins === 1 ? '' : 's'}`);
    return parts.join(' ');
  }

  // default: 'short'
  const parts = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? '' : 's'}`);
  if (mins > 0) parts.push(`${mins} min`);
  return parts.join(' ');
};

/**
 * Formats remaining ad-free duration into user-friendly text.
 * e.g., "30 min remaining", "1 hr remaining", "1 hr 30 min remaining", "6 hrs remaining", "1 day remaining", "1 day 6 hrs remaining"
 */
export const formatAdFreeRemainingTime = (adFreeUntil, targetDate = new Date()) => {
  if (!isAdFreeActive(adFreeUntil, targetDate)) return null;
  const expiryDate = adFreeUntil instanceof Date ? adFreeUntil : new Date(adFreeUntil);
  const diffMs = expiryDate.getTime() - targetDate.getTime();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  if (totalMinutes < 1) {
    return '< 1 min remaining';
  }

  const days = Math.floor(totalMinutes / 1440);
  const remAfterDays = totalMinutes % 1440;
  const hours = Math.floor(remAfterDays / 60);
  const mins = remAfterDays % 60;

  if (days > 0) {
    const parts = [`${days} day${days === 1 ? '' : 's'}`];
    if (hours > 0) {
      parts.push(`${hours} hr${hours === 1 ? '' : 's'}`);
    } else if (mins > 0) {
      parts.push(`${mins} min`);
    }
    return `${parts.join(' ')} remaining`;
  }

  if (hours === 0) {
    return `${mins} min remaining`;
  }
  if (mins === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'} remaining`;
  }
  return `${hours} hr${hours === 1 ? '' : 's'} ${mins} min remaining`;
};

export default {
  isAdFreeActive,
  getRedeemableRewards,
  getRewardById,
  canRedeemReward,
  formatAdFreeExpiry,
  getAdFreeRemainingMinutes,
  formatAdFreeDuration,
  formatAdFreeRemainingTime,
};

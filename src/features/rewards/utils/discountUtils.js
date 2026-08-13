/**
 * Calculates current price and active discount metadata for a reward package.
 * Supports embedded item discount or rewards.discounts.items[rewardId] mapping.
 * Enforces price floor invariant: finalPointsCost >= 1.
 *
 * @param {Object} reward - Reward package configuration object
 * @param {Date|string} targetDate - Reference calculation date
 * @param {Object} discountsConfig - Optional rewards.discounts config section
 * @returns {Object} Calculated price breakdown
 */
export const calculateRewardPrice = (reward, targetDate = new Date(), discountsConfig = null) => {
  if (!reward || typeof reward.pointsCost !== 'number') {
    return {
      basePointsCost: 0,
      discountAmount: 0,
      finalPointsCost: 0,
      discountActive: false,
      discountLabel: '',
    };
  }

  const basePointsCost = reward.pointsCost;
  const now = targetDate instanceof Date ? targetDate : new Date(targetDate);

  // Check embedded discount vs discountsConfig.items[reward.id]
  let discount = reward.discount;
  if (discountsConfig && discountsConfig.enabled && discountsConfig.items) {
    const itemDiscount = discountsConfig.items[reward.id];
    if (itemDiscount) {
      discount = itemDiscount;
    }
  }

  if (!discount || discount.enabled === false || typeof discount.value !== 'number' || discount.value <= 0) {
    return {
      basePointsCost,
      discountAmount: 0,
      finalPointsCost: basePointsCost,
      discountActive: false,
      discountLabel: '',
    };
  }

  // Check discount date window if present
  if (discount.startsAt && new Date(discount.startsAt).getTime() > now.getTime()) {
    return { basePointsCost, discountAmount: 0, finalPointsCost: basePointsCost, discountActive: false, discountLabel: '' };
  }
  if (discount.endsAt && new Date(discount.endsAt).getTime() < now.getTime()) {
    return { basePointsCost, discountAmount: 0, finalPointsCost: basePointsCost, discountActive: false, discountLabel: '' };
  }

  let discountAmount = 0;
  let discountLabel = discount.label || '';

  if (discount.type === 'percentage') {
    discountAmount = Math.round((basePointsCost * discount.value) / 100);
    if (!discountLabel) discountLabel = `${discount.value}% OFF`;
  } else if (discount.type === 'fixed') {
    discountAmount = Math.min(discount.value, basePointsCost - 1);
    if (!discountLabel) discountLabel = `${discountAmount} Points OFF`;
  }

  // Floor invariant: price cannot fall below 1 point
  const finalPointsCost = Math.max(1, basePointsCost - discountAmount);

  return {
    basePointsCost,
    discountAmount,
    finalPointsCost,
    discountActive: discountAmount > 0,
    discountLabel,
    discountType: discount.type,
    discountValue: discount.value,
  };
};

export default {
  calculateRewardPrice,
};

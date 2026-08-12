/**
 * Calculates current price and active discount metadata for a reward package.
 * Enforces price floor invariant: finalPointsCost >= 1.
 *
 * @param {Object} reward - Reward package configuration object
 * @param {Date|string} targetDate - Reference calculation date
 * @returns {Object} Calculated price breakdown
 */
export const calculateRewardPrice = (reward, targetDate = new Date()) => {
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
  const discount = reward.discount;
  const now = targetDate instanceof Date ? targetDate : new Date(targetDate);

  if (!discount || !discount.enabled || typeof discount.value !== 'number' || discount.value <= 0) {
    return {
      basePointsCost,
      discountAmount: 0,
      finalPointsCost: basePointsCost,
      discountActive: false,
      discountLabel: '',
    };
  }

  // Check discount date window
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

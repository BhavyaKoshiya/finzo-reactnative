/**
 * Schema validator for Finzo Realtime Configuration.
 * Validates payload structure, types, string lengths, ranges, and supported schema version.
 */
export const SUPPORTED_CONFIG_VERSION = 1;

const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
const isNonEmptyString = (val, maxLen = 200) =>
  typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
const isPositiveInteger = (val) => typeof val === 'number' && Number.isInteger(val) && val > 0;
const isBoolean = (val) => typeof val === 'boolean';

export const validateRealtimeConfig = (config) => {
  const errors = [];

  if (!isObject(config)) {
    return { valid: false, errors: ['Config payload must be a valid JSON object'] };
  }

  // 1. Version Check
  if (config.version !== SUPPORTED_CONFIG_VERSION) {
    errors.push(`Unsupported config version: ${config.version}. Expected version ${SUPPORTED_CONFIG_VERSION}`);
    return { valid: false, errors };
  }

  // 2. Feature Flags Validation
  if (config.featureFlags !== undefined && !isObject(config.featureFlags)) {
    errors.push('featureFlags must be an object');
  }

  // 3. Rewards Section Validation
  if (!isObject(config.rewards)) {
    errors.push('rewards field must be an object');
  } else {
    // 3a. Daily Check-In Validation
    const dci = config.rewards.dailyCheckIn;
    if (!isObject(dci)) {
      errors.push('rewards.dailyCheckIn must be an object');
    } else {
      if (!isBoolean(dci.enabled)) errors.push('dailyCheckIn.enabled must be a boolean');
      if (!isPositiveInteger(dci.cycleLength) || dci.cycleLength > 365) {
        errors.push('dailyCheckIn.cycleLength must be an integer between 1 and 365');
      }
      if (!isPositiveInteger(dci.maxReward)) {
        errors.push('dailyCheckIn.maxReward must be a positive integer');
      }
      if (!isBoolean(dci.repeatLastReward)) {
        errors.push('dailyCheckIn.repeatLastReward must be a boolean');
      }

      // rewardSchedule validation
      if (!isObject(dci.rewardSchedule)) {
        errors.push('dailyCheckIn.rewardSchedule must be an object mapping day numbers to points');
      } else {
        const scheduleKeys = Object.keys(dci.rewardSchedule);
        if (!scheduleKeys.includes('1')) {
          errors.push('dailyCheckIn.rewardSchedule must contain Day 1 reward');
        }
        scheduleKeys.forEach((key) => {
          const points = dci.rewardSchedule[key];
          if (typeof points !== 'number' || points <= 0) {
            errors.push(`dailyCheckIn.rewardSchedule Day ${key} must have positive points value`);
          }
        });
      }

      // UI Config validation
      if (!isObject(dci.ui)) {
        errors.push('dailyCheckIn.ui must be an object');
      } else {
        const ui = dci.ui;
        if (!isNonEmptyString(ui.title, 80)) errors.push('ui.title must be a string (1-80 chars)');
        if (!isNonEmptyString(ui.subtitle, 200)) errors.push('ui.subtitle must be a string (1-200 chars)');
        if (!isNonEmptyString(ui.claimButtonText, 60)) errors.push('ui.claimButtonText must be a string (1-60 chars)');
        if (!isNonEmptyString(ui.claimedButtonText, 60)) errors.push('ui.claimedButtonText must be a string (1-60 chars)');

        ['showProgress', 'showNextReward', 'showStreak', 'showRewardHistory'].forEach((flag) => {
          if (ui[flag] !== undefined && !isBoolean(ui[flag])) {
            errors.push(`ui.${flag} must be a boolean`);
          }
        });
      }
    }

    // 3b. Redeemable Rewards Catalog Validation
    const redeemable = config.rewards.redeemable;
    if (!isObject(redeemable)) {
      errors.push('rewards.redeemable must be an object');
    } else {
      Object.keys(redeemable).forEach((key) => {
        const pkg = redeemable[key];
        if (!isObject(pkg)) {
          errors.push(`rewards.redeemable.${key} must be an object`);
          return;
        }

        if (!isNonEmptyString(pkg.title, 80)) errors.push(`redeemable.${key}.title is invalid`);
        if (!isNonEmptyString(pkg.description, 200)) errors.push(`redeemable.${key}.description is invalid`);
        if (!isPositiveInteger(pkg.pointsCost)) errors.push(`redeemable.${key}.pointsCost must be positive integer`);
        if (!isPositiveInteger(pkg.durationMinutes)) errors.push(`redeemable.${key}.durationMinutes must be positive integer`);

        // Discount validation
        if (pkg.discount !== undefined && isObject(pkg.discount)) {
          const disc = pkg.discount;
          if (disc.enabled && !['percentage', 'fixed'].includes(disc.type)) {
            errors.push(`redeemable.${key}.discount.type must be 'percentage' or 'fixed'`);
          }
          if (disc.enabled && (typeof disc.value !== 'number' || disc.value < 0)) {
            errors.push(`redeemable.${key}.discount.value must be non-negative number`);
          }
          if (disc.enabled && disc.type === 'percentage' && disc.value > 100) {
            errors.push(`redeemable.${key}.discount.value percentage cannot exceed 100%`);
          }
          if (disc.enabled && disc.type === 'fixed' && disc.value >= pkg.pointsCost) {
            errors.push(`redeemable.${key}.discount.value fixed discount cannot equal or exceed base pointsCost`);
          }
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  SUPPORTED_CONFIG_VERSION,
  validateRealtimeConfig,
};

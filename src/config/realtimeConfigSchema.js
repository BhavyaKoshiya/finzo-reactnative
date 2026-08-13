/**
 * Schema validator for Finzo Realtime Configuration.
 * Validates payload structure, types, string lengths, ranges, and supported schema version.
 */
export const SUPPORTED_CONFIG_VERSION = 1;

const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
const isNonEmptyString = (val, maxLen = 200) =>
  typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
const isPositiveInteger = (val) => typeof val === 'number' && Number.isInteger(val) && Number.isFinite(val) && val > 0;
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
      if (dci.enabled !== undefined && !isBoolean(dci.enabled)) {
        errors.push('dailyCheckIn.enabled must be a boolean');
      }

      if (dci.maxReward !== undefined && !isPositiveInteger(dci.maxReward)) {
        errors.push('dailyCheckIn.maxReward must be a positive integer');
      }

      if (dci.resetOnMissedDay !== undefined && !isBoolean(dci.resetOnMissedDay)) {
        errors.push('dailyCheckIn.resetOnMissedDay must be a boolean');
      }

      // Validate all present schedule objects (rewardSchedule and schedule)
      const schedules = [];
      if (dci.rewardSchedule) schedules.push(dci.rewardSchedule);
      if (dci.schedule) schedules.push(dci.schedule);

      if (schedules.length === 0) {
        errors.push('dailyCheckIn.rewardSchedule must be an array or object mapping of points');
      } else {
        schedules.forEach((sch) => {
          if (Array.isArray(sch)) {
            if (sch.length === 0) {
              errors.push('dailyCheckIn.rewardSchedule must not be empty');
            }
            sch.forEach((val, idx) => {
              if (!isPositiveInteger(val)) {
                errors.push(`dailyCheckIn.rewardSchedule item at index ${idx} must be a positive integer`);
              }
            });
          } else if (isObject(sch)) {
            const keys = Object.keys(sch);
            if (keys.length === 0) {
              errors.push('dailyCheckIn.rewardSchedule must not be empty');
            }
            if (!keys.includes('1') && !keys.includes('day1')) {
              errors.push('dailyCheckIn.rewardSchedule must contain Day 1 reward');
            }
            keys.forEach((key) => {
              if (!isPositiveInteger(sch[key])) {
                errors.push(`dailyCheckIn.rewardSchedule day ${key} must be a positive integer`);
              }
            });
          }
        });
      }
    }

    // 3b. Catalog Validation (validate all present catalog objects)
    const catalogs = [];
    if (config.rewards.catalog) catalogs.push(config.rewards.catalog);
    if (config.rewards.redeemable) catalogs.push(config.rewards.redeemable);
    if (config.redemption?.packages) catalogs.push(config.redemption.packages);

    if (catalogs.length === 0) {
      errors.push('rewards.catalog must be an object');
    } else {
      catalogs.forEach((cat) => {
        if (!isObject(cat)) {
          errors.push('rewards.catalog must be an object');
          return;
        }
        Object.keys(cat).forEach((key) => {
          const pkg = cat[key];
          if (!isObject(pkg)) {
            errors.push(`catalog.${key} must be an object`);
            return;
          }

          if (!isNonEmptyString(pkg.title, 80)) errors.push(`catalog.${key}.title is invalid (1-80 chars)`);
          if (!isNonEmptyString(pkg.description, 200)) errors.push(`catalog.${key}.description is invalid (1-200 chars)`);
          if (!isPositiveInteger(pkg.pointsCost)) errors.push(`catalog.${key}.pointsCost must be positive integer >= 1`);
          if (!isPositiveInteger(pkg.durationMinutes)) errors.push(`catalog.${key}.durationMinutes must be positive integer >= 1`);

          // Discount validation
          if (pkg.discount !== undefined && isObject(pkg.discount)) {
            const disc = pkg.discount;
            if (disc.enabled) {
              if (!['percentage', 'fixed'].includes(disc.type)) {
                errors.push(`catalog.${key}.discount.type must be 'percentage' or 'fixed'`);
              }
              if (typeof disc.value !== 'number' || disc.value <= 0 || !Number.isFinite(disc.value)) {
                errors.push(`catalog.${key}.discount.value must be positive number > 0`);
              }
              if (disc.type === 'percentage' && disc.value > 100) {
                errors.push(`catalog.${key}.discount.value percentage cannot exceed 100%`);
              }
              if (disc.type === 'fixed' && disc.value >= pkg.pointsCost) {
                errors.push(`catalog.${key}.discount.value fixed discount cannot equal or exceed base pointsCost`);
              }
            }
          }
        });
      });
    }

    // 3c. Rewarded Ads Config Validation
    if (config.rewards.rewardedAds !== undefined && isObject(config.rewards.rewardedAds)) {
      const ra = config.rewards.rewardedAds;
      if (ra.enabled !== undefined && !isBoolean(ra.enabled)) {
        errors.push('rewardedAds.enabled must be a boolean');
      }
      if (ra.pointsPerAd !== undefined && (typeof ra.pointsPerAd !== 'number' || ra.pointsPerAd < 0 || ra.pointsPerAd > 1000)) {
        errors.push('rewardedAds.pointsPerAd must be an integer (0-1000)');
      }
      if (ra.dailyWatchLimit !== undefined && (typeof ra.dailyWatchLimit !== 'number' || ra.dailyWatchLimit < 0 || ra.dailyWatchLimit > 100)) {
        errors.push('rewardedAds.dailyWatchLimit must be an integer (0-100)');
      }
      if (ra.cooldownMinutes !== undefined && (typeof ra.cooldownMinutes !== 'number' || ra.cooldownMinutes < 0 || ra.cooldownMinutes > 1440)) {
        errors.push('rewardedAds.cooldownMinutes must be an integer (0-1440)');
      }

      if (ra.milestone !== undefined && isObject(ra.milestone)) {
        const ms = ra.milestone;
        if (ms.enabled !== undefined && !isBoolean(ms.enabled)) {
          errors.push('rewardedAds.milestone.enabled must be a boolean');
        }
        if (ms.requiredAds !== undefined && (typeof ms.requiredAds !== 'number' || ms.requiredAds < 1 || ms.requiredAds > 100)) {
          errors.push('rewardedAds.milestone.requiredAds must be integer (1-100)');
        }
        if (ms.adFreeMinutes !== undefined && (typeof ms.adFreeMinutes !== 'number' || ms.adFreeMinutes < 1 || ms.adFreeMinutes > 10080)) {
          errors.push('rewardedAds.milestone.adFreeMinutes must be integer (1-10080)');
        }

        // IMPOSSIBLE CONFIGURATION CHECK
        if (ms.enabled && ra.enabled && typeof ms.requiredAds === 'number' && typeof ra.dailyWatchLimit === 'number' && ms.requiredAds > ra.dailyWatchLimit) {
          errors.push(`rewardedAds.milestone.requiredAds (${ms.requiredAds}) cannot exceed dailyWatchLimit (${ra.dailyWatchLimit})`);
        }
      }
    }

    // 3d. Discounts Validation
    if (config.rewards.discounts !== undefined && isObject(config.rewards.discounts)) {
      const disc = config.rewards.discounts;
      if (disc.enabled !== undefined && !isBoolean(disc.enabled)) {
        errors.push('discounts.enabled must be a boolean');
      }
      if (disc.items !== undefined && !isObject(disc.items)) {
        errors.push('discounts.items must be an object');
      }
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

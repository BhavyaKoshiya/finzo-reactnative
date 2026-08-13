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

      // Validate schedule if present
      if (dci.schedule && isObject(dci.schedule)) {
        const keys = Object.keys(dci.schedule);
        if (keys.length === 0) {
          errors.push('dailyCheckIn.schedule must not be empty');
        }
        if (!keys.includes('day1') && !keys.includes('1')) {
          errors.push('dailyCheckIn.schedule must contain Day 1 reward');
        }
        keys.forEach((key) => {
          if (!isPositiveInteger(dci.schedule[key])) {
            errors.push(`dailyCheckIn.schedule day ${key} must be a positive integer > 0`);
          }
        });
      }

      // Validate rewardSchedule if present
      if (dci.rewardSchedule && isObject(dci.rewardSchedule)) {
        const keys = Object.keys(dci.rewardSchedule);
        if (keys.length === 0) {
          errors.push('dailyCheckIn.rewardSchedule must not be empty');
        }
        if (!keys.includes('1') && !keys.includes('day1')) {
          errors.push('dailyCheckIn.rewardSchedule must contain Day 1 reward');
        }
        keys.forEach((key) => {
          if (!isPositiveInteger(dci.rewardSchedule[key])) {
            errors.push(`dailyCheckIn.rewardSchedule Day ${key} must have positive points value`);
          }
        });
      }

      if (!dci.schedule && !dci.rewardSchedule) {
        errors.push('dailyCheckIn schedule/rewardSchedule must be an object mapping days to positive points');
      }

      // UI Config validation
      if (dci.ui !== undefined && isObject(dci.ui)) {
        const ui = dci.ui;
        if (ui.title !== undefined && !isNonEmptyString(ui.title, 80)) errors.push('ui.title must be a string (1-80 chars)');
        if (ui.subtitle !== undefined && !isNonEmptyString(ui.subtitle, 200)) errors.push('ui.subtitle must be a string (1-200 chars)');
        if (ui.claimButtonText !== undefined && !isNonEmptyString(ui.claimButtonText, 60)) errors.push('ui.claimButtonText must be a string (1-60 chars)');
        if (ui.claimedButtonText !== undefined && !isNonEmptyString(ui.claimedButtonText, 60)) errors.push('ui.claimedButtonText must be a string (1-60 chars)');

        ['showProgress', 'showNextReward', 'showStreak', 'showRewardHistory'].forEach((flag) => {
          if (ui[flag] !== undefined && !isBoolean(ui[flag])) {
            errors.push(`ui.${flag} must be a boolean`);
          }
        });
      }
    }

    // 3b. Redeemable Rewards Catalog Validation
    const redeemable = config.rewards.redeemable || config.redemption?.packages;
    if (redeemable !== undefined && isObject(redeemable)) {
      Object.keys(redeemable).forEach((key) => {
        const pkg = redeemable[key];
        if (!isObject(pkg)) {
          errors.push(`redeemable.${key} must be an object`);
          return;
        }

        if (!isNonEmptyString(pkg.title, 80)) errors.push(`redeemable.${key}.title is invalid (1-80 chars)`);
        if (!isNonEmptyString(pkg.description, 200)) errors.push(`redeemable.${key}.description is invalid (1-200 chars)`);
        if (!isPositiveInteger(pkg.pointsCost)) errors.push(`redeemable.${key}.pointsCost must be positive integer >= 1`);
        if (!isPositiveInteger(pkg.durationMinutes)) errors.push(`redeemable.${key}.durationMinutes must be positive integer >= 1`);

        // Discount validation
        if (pkg.discount !== undefined && isObject(pkg.discount)) {
          const disc = pkg.discount;
          if (disc.enabled) {
            if (!['percentage', 'fixed'].includes(disc.type)) {
              errors.push(`redeemable.${key}.discount.type must be 'percentage' or 'fixed'`);
            }
            if (typeof disc.value !== 'number' || disc.value <= 0 || !Number.isFinite(disc.value)) {
              errors.push(`redeemable.${key}.discount.value must be positive number > 0`);
            }
            if (disc.type === 'percentage' && disc.value > 100) {
              errors.push(`redeemable.${key}.discount.value percentage cannot exceed 100%`);
            }
            if (disc.type === 'fixed' && disc.value >= pkg.pointsCost) {
              errors.push(`redeemable.${key}.discount.value fixed discount cannot equal or exceed base pointsCost`);
            }
            if (disc.startsAt && disc.endsAt) {
              const start = new Date(disc.startsAt).getTime();
              const end = new Date(disc.endsAt).getTime();
              if (isNaN(start) || isNaN(end) || start >= end) {
                errors.push(`redeemable.${key}.discount startsAt must be before endsAt`);
              }
            }
          }
        }
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

        // IMPOSSIBLE CONFIGURATION CHECK (Section 23 in Phase 16.15 prompt)
        if (ms.enabled && ra.enabled && typeof ms.requiredAds === 'number' && typeof ra.dailyWatchLimit === 'number' && ms.requiredAds > ra.dailyWatchLimit) {
          errors.push(`rewardedAds.milestone.requiredAds (${ms.requiredAds}) cannot exceed dailyWatchLimit (${ra.dailyWatchLimit})`);
        }
      }
    }
  }

  // 4. Ads Section Validation
  if (config.ads !== undefined && isObject(config.ads)) {
    ['enabled', 'rewardedAdsEnabled', 'bannerAdsEnabled', 'interstitialAdsEnabled', 'rewardedEnabled'].forEach((flag) => {
      if (config.ads[flag] !== undefined && !isBoolean(config.ads[flag])) {
        errors.push(`ads.${flag} must be a boolean`);
      }
    });
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

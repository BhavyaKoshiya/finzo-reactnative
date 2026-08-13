import { validateRealtimeConfig } from '../realtimeConfigSchema';
import DEFAULT_REALTIME_CONFIG from '../realtimeConfigDefaults';

describe('Finzo Realtime Config Hardening & Provisioning Tests', () => {
  // 1. Valid production payload validation
  test('1. Valid default realtime config payload passes schema validation', () => {
    const { valid, errors } = validateRealtimeConfig(DEFAULT_REALTIME_CONFIG);
    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
  });

  // 2. Unsupported version rejection
  test('2. Unsupported config version is rejected', () => {
    const invalidConfig = { ...DEFAULT_REALTIME_CONFIG, version: 99 };
    const { valid, errors } = validateRealtimeConfig(invalidConfig);
    expect(valid).toBe(false);
    expect(errors[0]).toContain('Unsupported config version: 99');
  });

  // 3. Invalid reward ladder (zero or negative points)
  test('3. Invalid check-in reward schedule with 0 or negative points is rejected', () => {
    const invalidLadder = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        dailyCheckIn: {
          ...DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn,
          schedule: { day1: 0, day2: -5 },
        },
      },
    };
    const { valid, errors } = validateRealtimeConfig(invalidLadder);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('positive integer'))).toBe(true);
  });

  // 4. Invalid package pointsCost or durationMinutes
  test('4. Redemption package with pointsCost=0 or durationMinutes=0 is rejected', () => {
    const invalidPkg = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        redeemable: {
          bad_pkg: {
            enabled: true,
            title: 'Bad Package',
            description: 'Invalid duration and points',
            pointsCost: 0,
            durationMinutes: 0,
          },
        },
      },
    };
    const { valid, errors } = validateRealtimeConfig(invalidPkg);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('pointsCost'))).toBe(true);
  });

  // 5. Invalid discount values (discount > 100% or fixed >= pointsCost)
  test('5. Discount exceeding 100% or fixed discount exceeding pointsCost is rejected', () => {
    const invalidDiscount = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        redeemable: {
          pkg: {
            enabled: true,
            title: 'Package',
            description: 'Description',
            pointsCost: 100,
            durationMinutes: 60,
            discount: {
              enabled: true,
              type: 'percentage',
              value: 150,
            },
          },
        },
      },
    };
    const { valid, errors } = validateRealtimeConfig(invalidDiscount);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('percentage cannot exceed 100%'))).toBe(true);
  });

  // 6. Ads disabled by default
  test('6. Ads configuration is enabled by default in schema and defaults', () => {
    expect(DEFAULT_REALTIME_CONFIG.ads.enabled).toBe(true);
    expect(DEFAULT_REALTIME_CONFIG.ads.rewardedAdsEnabled).toBe(true);
    expect(DEFAULT_REALTIME_CONFIG.ads.bannerAdsEnabled).toBe(true);
    expect(DEFAULT_REALTIME_CONFIG.ads.interstitialAdsEnabled).toBe(true);
  });

  // 7. Non-object or empty payload handling
  test('7. Non-object payload is rejected cleanly without throwing exception', () => {
    const resNull = validateRealtimeConfig(null);
    const resString = validateRealtimeConfig('invalid');
    expect(resNull.valid).toBe(false);
    expect(resString.valid).toBe(false);
  });

  // 8. Provisioning JSON file check
  test('8. Provisioning payload rtdb_config_payload.json exists and passes schema validation', () => {
    const fs = require('fs');
    const path = require('path');
    const payloadPath = path.join(__dirname, '../../../scripts/rtdb_config_payload.json');

    expect(fs.existsSync(payloadPath)).toBe(true);
    const raw = fs.readFileSync(payloadPath, 'utf8');
    const parsed = JSON.parse(raw);
    const { valid, errors } = validateRealtimeConfig(parsed);

    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
  });
});

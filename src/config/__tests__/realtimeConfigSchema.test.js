import { validateRealtimeConfig, SUPPORTED_CONFIG_VERSION } from '../realtimeConfigSchema';
import { DEFAULT_REALTIME_CONFIG } from '../realtimeConfigDefaults';

describe('realtimeConfigSchema', () => {
  it('should accept valid DEFAULT_REALTIME_CONFIG', () => {
    const result = validateRealtimeConfig(DEFAULT_REALTIME_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject non-object payloads', () => {
    expect(validateRealtimeConfig(null).valid).toBe(false);
    expect(validateRealtimeConfig('string').valid).toBe(false);
  });

  it('should reject unsupported configuration versions', () => {
    const invalidConfig = { ...DEFAULT_REALTIME_CONFIG, version: 99 };
    const result = validateRealtimeConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Unsupported config version: 99');
  });

  it('should reject config with missing Day 1 in rewardSchedule', () => {
    const invalid = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        dailyCheckIn: {
          ...DEFAULT_REALTIME_CONFIG.rewards.dailyCheckIn,
          rewardSchedule: { 2: 10, 3: 15 },
        },
      },
    };
    const result = validateRealtimeConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Day 1'))).toBe(true);
  });

  it('should reject percentage discounts over 100%', () => {
    const invalid = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        redeemable: {
          ad_free_1h: {
            ...DEFAULT_REALTIME_CONFIG.rewards.redeemable.ad_free_1h,
            discount: {
              enabled: true,
              type: 'percentage',
              value: 150,
            },
          },
        },
      },
    };
    const result = validateRealtimeConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('cannot exceed 100%'))).toBe(true);
  });
});

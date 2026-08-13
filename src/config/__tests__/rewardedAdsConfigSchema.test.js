import { validateRealtimeConfig } from '../realtimeConfigSchema';
import { DEFAULT_REALTIME_CONFIG } from '../realtimeConfigDefaults';

describe('Phase 16.15 — Rewarded Ads Configuration Schema & Validation', () => {
  it('validates default config with rewardedAds section', () => {
    const res = validateRealtimeConfig(DEFAULT_REALTIME_CONFIG);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('accepts valid custom rewardedAds configuration', () => {
    const validConfig = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        rewardedAds: {
          enabled: true,
          pointsPerAd: 20,
          dailyWatchLimit: 10,
          cooldownMinutes: 5,
          milestone: {
            enabled: true,
            requiredAds: 5,
            adFreeMinutes: 60,
          },
        },
      },
    };

    const res = validateRealtimeConfig(validConfig);
    expect(res.valid).toBe(true);
  });

  it('rejects negative pointsPerAd, dailyWatchLimit, or cooldownMinutes', () => {
    const invalidConfig = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        rewardedAds: {
          enabled: true,
          pointsPerAd: -5,
          dailyWatchLimit: -1,
          cooldownMinutes: -10,
          milestone: {
            enabled: true,
            requiredAds: 5,
            adFreeMinutes: 30,
          },
        },
      },
    };

    const res = validateRealtimeConfig(invalidConfig);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('rejects impossible configuration when requiredAds > dailyWatchLimit', () => {
    const impossibleConfig = {
      ...DEFAULT_REALTIME_CONFIG,
      rewards: {
        ...DEFAULT_REALTIME_CONFIG.rewards,
        rewardedAds: {
          enabled: true,
          pointsPerAd: 10,
          dailyWatchLimit: 3, // Only 3 ads allowed per day
          cooldownMinutes: 0,
          milestone: {
            enabled: true,
            requiredAds: 5, // Impossible: required 5 ads but max limit is 3
            adFreeMinutes: 30,
          },
        },
      },
    };

    const res = validateRealtimeConfig(impossibleConfig);
    expect(res.valid).toBe(false);
    expect(res.errors.some((err) => err.includes('cannot exceed dailyWatchLimit'))).toBe(true);
  });
});

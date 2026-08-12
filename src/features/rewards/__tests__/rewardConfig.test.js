import { REDEEMABLE_REWARDS, REWARD_TYPES } from '../config/rewardConfig';

describe('rewardConfig', () => {
  it('should define three redeemable ad-free packages', () => {
    expect(REDEEMABLE_REWARDS.length).toBe(3);
  });

  it('should have unique package IDs', () => {
    const ids = REDEEMABLE_REWARDS.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have positive integer costs and positive durations', () => {
    REDEEMABLE_REWARDS.forEach((r) => {
      expect(typeof r.id).toBe('string');
      expect(typeof r.title).toBe('string');
      expect(typeof r.description).toBe('string');
      expect(r.pointsCost).toBeGreaterThan(0);
      expect(Number.isInteger(r.pointsCost)).toBe(true);
      expect(r.durationMinutes).toBeGreaterThan(0);
    });
  });

  it('should define REWARD_TYPES constants', () => {
    expect(REWARD_TYPES.DAILY_CHECKIN).toBe('daily_checkin');
    expect(REWARD_TYPES.REDEMPTION).toBe('reward_redemption');
  });
});

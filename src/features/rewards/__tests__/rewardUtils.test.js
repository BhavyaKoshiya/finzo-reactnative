import {
  isAdFreeActive,
  getRedeemableRewards,
  getRewardById,
  canRedeemReward,
  formatAdFreeExpiry,
  getAdFreeRemainingMinutes,
} from '../utils/rewardUtils';

describe('rewardUtils', () => {
  it('should return false when adFreeUntil is null or undefined', () => {
    expect(isAdFreeActive(null)).toBe(false);
    expect(isAdFreeActive(undefined)).toBe(false);
  });

  it('should return true when adFreeUntil is in the future', () => {
    const now = new Date(2026, 7, 11, 12, 0, 0);
    const future = new Date(2026, 7, 11, 15, 30, 0).toISOString();
    expect(isAdFreeActive(future, now)).toBe(true);
  });

  it('should return false when adFreeUntil is expired', () => {
    const now = new Date(2026, 7, 11, 12, 0, 0);
    const past = new Date(2026, 7, 11, 11, 0, 0).toISOString();
    expect(isAdFreeActive(past, now)).toBe(false);
  });

  it('should fetch redeemable rewards catalog', () => {
    const rewards = getRedeemableRewards();
    expect(rewards.length).toBe(3);
    expect(rewards[0].id).toBe('ad_free_1h');
  });

  it('should get reward by ID', () => {
    const reward = getRewardById('ad_free_6h');
    expect(reward).toBeDefined();
    expect(reward.durationMinutes).toBe(360);
    expect(reward.pointsCost).toBe(150);
  });

  it('should return null for unknown reward ID', () => {
    expect(getRewardById('unknown_id')).toBeNull();
    expect(getRewardById(null)).toBeNull();
  });

  it('should evaluate canRedeemReward correctly', () => {
    const reward1h = getRewardById('ad_free_1h'); // cost 50 pts

    expect(canRedeemReward(200, reward1h)).toBe(true);
    expect(canRedeemReward(50, reward1h)).toBe(true);
    expect(canRedeemReward(49, reward1h)).toBe(false);
    expect(canRedeemReward(0, reward1h)).toBe(false);
    expect(canRedeemReward(200, 'ad_free_1h')).toBe(true);
    expect(canRedeemReward(49, 'ad_free_1h')).toBe(false);
    expect(canRedeemReward(100, 'unknown_id')).toBe(false);
  });

  it('should format ad-free expiry string correctly', () => {
    expect(formatAdFreeExpiry(null)).toBeNull();

    const todayDate = new Date();
    todayDate.setHours(18, 0, 0, 0);
    const formatted = formatAdFreeExpiry(todayDate.toISOString());
    expect(formatted).toContain('Until');

    const futureDate = new Date(2026, 7, 15, 18, 0, 0);
    const formattedFuture = formatAdFreeExpiry(futureDate.toISOString());
    expect(formattedFuture).toContain('Aug 15');
  });

  it('should calculate remaining ad-free minutes correctly', () => {
    const now = new Date(2026, 7, 11, 12, 0, 0);
    const expiry = new Date(2026, 7, 11, 13, 30, 0).toISOString();

    expect(getAdFreeRemainingMinutes(expiry, now)).toBe(90);
    expect(getAdFreeRemainingMinutes(null, now)).toBe(0);
  });
});

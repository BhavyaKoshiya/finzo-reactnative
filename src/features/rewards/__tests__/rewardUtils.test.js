import {
  isAdFreeActive,
  getRedeemableRewards,
  getRewardById,
  canRedeemReward,
  formatAdFreeExpiry,
  getAdFreeRemainingMinutes,
  formatAdFreeDuration,
  formatAdFreeRemainingTime,
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

  describe('formatAdFreeDuration', () => {
    it('formats short style (default)', () => {
      expect(formatAdFreeDuration(30)).toBe('30 min');
      expect(formatAdFreeDuration(60)).toBe('1 hr');
      expect(formatAdFreeDuration(90)).toBe('1 hr 30 min');
      expect(formatAdFreeDuration(120)).toBe('2 hrs');
      expect(formatAdFreeDuration(360)).toBe('6 hrs');
      expect(formatAdFreeDuration(1440)).toBe('1 day');
      expect(formatAdFreeDuration(1500)).toBe('1 day 1 hr');
      expect(formatAdFreeDuration(1530)).toBe('1 day 1 hr 30 min');
      expect(formatAdFreeDuration(2880)).toBe('2 days');
    });

    it('formats long style', () => {
      expect(formatAdFreeDuration(30, { style: 'long' })).toBe('30 minutes');
      expect(formatAdFreeDuration(60, { style: 'long' })).toBe('1 hour');
      expect(formatAdFreeDuration(90, { style: 'long' })).toBe('1 hour 30 minutes');
      expect(formatAdFreeDuration(120, { style: 'long' })).toBe('2 hours');
      expect(formatAdFreeDuration(360, { style: 'long' })).toBe('6 hours');
      expect(formatAdFreeDuration(1440, { style: 'long' })).toBe('1 day');
      expect(formatAdFreeDuration(1500, { style: 'long' })).toBe('1 day 1 hour');
      expect(formatAdFreeDuration(2880, { style: 'long' })).toBe('2 days');
    });

    it('formats descriptor style', () => {
      expect(formatAdFreeDuration(30, { style: 'descriptor' })).toBe('30-minute');
      expect(formatAdFreeDuration(60, { style: 'descriptor' })).toBe('1-hour');
      expect(formatAdFreeDuration(90, { style: 'descriptor' })).toBe('1-hour 30-minute');
      expect(formatAdFreeDuration(360, { style: 'descriptor' })).toBe('6-hour');
      expect(formatAdFreeDuration(1440, { style: 'descriptor' })).toBe('1-day');
      expect(formatAdFreeDuration(2880, { style: 'descriptor' })).toBe('2-day');
    });

    it('formats badge style', () => {
      expect(formatAdFreeDuration(30, { style: 'badge' })).toBe('30m');
      expect(formatAdFreeDuration(60, { style: 'badge' })).toBe('1h');
      expect(formatAdFreeDuration(90, { style: 'badge' })).toBe('1h 30m');
      expect(formatAdFreeDuration(360, { style: 'badge' })).toBe('6h');
      expect(formatAdFreeDuration(1440, { style: 'badge' })).toBe('1d');
      expect(formatAdFreeDuration(1500, { style: 'badge' })).toBe('1d 1h');
      expect(formatAdFreeDuration(2880, { style: 'badge' })).toBe('2d');
    });
  });

  describe('formatAdFreeRemainingTime', () => {
    const now = new Date(2026, 7, 11, 12, 0, 0);

    it('formats minutes, hours, and multi-day countdowns', () => {
      const plus30m = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
      const plus60m = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      const plus90m = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
      const plus360m = new Date(now.getTime() + 360 * 60 * 1000).toISOString();
      const plus1day = new Date(now.getTime() + 1440 * 60 * 1000).toISOString();
      const plus1day6h = new Date(now.getTime() + (1440 + 360) * 60 * 1000).toISOString();
      const plus2days = new Date(now.getTime() + 2880 * 60 * 1000).toISOString();

      expect(formatAdFreeRemainingTime(plus30m, now)).toBe('30 min remaining');
      expect(formatAdFreeRemainingTime(plus60m, now)).toBe('1 hr remaining');
      expect(formatAdFreeRemainingTime(plus90m, now)).toBe('1 hr 30 min remaining');
      expect(formatAdFreeRemainingTime(plus360m, now)).toBe('6 hrs remaining');
      expect(formatAdFreeRemainingTime(plus1day, now)).toBe('1 day remaining');
      expect(formatAdFreeRemainingTime(plus1day6h, now)).toBe('1 day 6 hrs remaining');
      expect(formatAdFreeRemainingTime(plus2days, now)).toBe('2 days remaining');
    });
  });
});

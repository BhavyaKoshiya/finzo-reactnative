import { calculateRewardPrice } from '../utils/discountUtils';

describe('discountUtils - calculateRewardPrice', () => {
  const baseReward = {
    id: 'ad_free_24h',
    pointsCost: 750,
  };

  it('should return base price when no discount is attached', () => {
    const result = calculateRewardPrice(baseReward);
    expect(result.basePointsCost).toBe(750);
    expect(result.finalPointsCost).toBe(750);
    expect(result.discountActive).toBe(false);
  });

  it('should calculate active 20% percentage discount correctly (750 -> 600)', () => {
    const rewardWithDiscount = {
      ...baseReward,
      discount: {
        enabled: true,
        type: 'percentage',
        value: 20,
      },
    };
    const result = calculateRewardPrice(rewardWithDiscount);
    expect(result.basePointsCost).toBe(750);
    expect(result.discountAmount).toBe(150);
    expect(result.finalPointsCost).toBe(600);
    expect(result.discountActive).toBe(true);
    expect(result.discountLabel).toBe('20% OFF');
  });

  it('should calculate active fixed 150 points discount correctly (750 -> 600)', () => {
    const rewardWithDiscount = {
      ...baseReward,
      discount: {
        enabled: true,
        type: 'fixed',
        value: 150,
      },
    };
    const result = calculateRewardPrice(rewardWithDiscount);
    expect(result.finalPointsCost).toBe(600);
    expect(result.discountAmount).toBe(150);
  });

  it('should ignore expired discount windows', () => {
    const rewardExpired = {
      ...baseReward,
      discount: {
        enabled: true,
        type: 'percentage',
        value: 50,
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-02T00:00:00Z',
      },
    };
    const now = new Date('2026-08-12T12:00:00Z');
    const result = calculateRewardPrice(rewardExpired, now);
    expect(result.discountActive).toBe(false);
    expect(result.finalPointsCost).toBe(750);
  });

  it('should enforce price floor invariant: price >= 1', () => {
    const rewardOverDiscount = {
      id: 'cheap_pkg',
      pointsCost: 10,
      discount: {
        enabled: true,
        type: 'fixed',
        value: 100,
      },
    };
    const result = calculateRewardPrice(rewardOverDiscount);
    expect(result.finalPointsCost).toBe(1);
    expect(result.finalPointsCost).toBeGreaterThanOrEqual(1);
  });
});

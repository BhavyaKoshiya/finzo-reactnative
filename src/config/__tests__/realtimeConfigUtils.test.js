import { interpolateRewardCopy } from '../realtimeConfigUtils';

describe('realtimeConfigUtils - interpolateRewardCopy', () => {
  it('should interpolate placeholders correctly', () => {
    const template = 'Claim {points} Points for {count} Day Streak';
    const result = interpolateRewardCopy(template, { points: 17, count: 6 });
    expect(result).toBe('Claim 17 Points for 6 Day Streak');
  });

  it('should leave unfulfilled placeholders intact', () => {
    const template = 'Hello {name}, earn {points} Points';
    const result = interpolateRewardCopy(template, { points: 20 });
    expect(result).toBe('Hello {name}, earn 20 Points');
  });

  it('should handle null/undefined templates safely', () => {
    expect(interpolateRewardCopy(null)).toBe('');
    expect(interpolateRewardCopy(undefined)).toBe('');
    expect(interpolateRewardCopy('Plain copy', null)).toBe('Plain copy');
  });
});

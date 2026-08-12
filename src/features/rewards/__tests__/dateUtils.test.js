import {
  hasCheckedInToday,
  isCheckInConsecutive,
  isCheckInMissed,
  formatRewardDate,
} from '../utils/dateUtils';

describe('dateUtils', () => {
  it('should return false for null/undefined lastCheckInDate', () => {
    expect(hasCheckedInToday(null)).toBe(false);
    expect(isCheckInConsecutive(null)).toBe(false);
    expect(isCheckInMissed(null)).toBe(false);
  });

  it('should detect same calendar day regardless of time of day (23:59 vs 00:01)', () => {
    const morning = new Date(2026, 7, 11, 0, 1, 0); // Aug 11, 2026 00:01
    const night = new Date(2026, 7, 11, 23, 59, 0); // Aug 11, 2026 23:59

    expect(hasCheckedInToday(morning.toISOString(), night)).toBe(true);
    expect(hasCheckedInToday(night.toISOString(), morning)).toBe(true);
  });

  it('should detect consecutive calendar day check-ins (yesterday)', () => {
    const yesterday = new Date(2026, 7, 10, 15, 0, 0); // Aug 10
    const today = new Date(2026, 7, 11, 10, 0, 0); // Aug 11

    expect(isCheckInConsecutive(yesterday.toISOString(), today)).toBe(true);
    expect(isCheckInMissed(yesterday.toISOString(), today)).toBe(false);
  });

  it('should detect missed calendar day check-ins (>1 day gap)', () => {
    const threeDaysAgo = new Date(2026, 7, 8, 10, 0, 0); // Aug 8
    const today = new Date(2026, 7, 11, 10, 0, 0); // Aug 11

    expect(isCheckInConsecutive(threeDaysAgo.toISOString(), today)).toBe(false);
    expect(isCheckInMissed(threeDaysAgo.toISOString(), today)).toBe(true);
  });

  it('should format reward dates correctly', () => {
    const now = new Date();
    expect(formatRewardDate(now.toISOString())).toBe('Today');

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    expect(formatRewardDate(yesterday.toISOString())).toBe('Yesterday');

    const specificDate = new Date(2026, 0, 15);
    expect(formatRewardDate(specificDate.toISOString())).toBe('Jan 15');
  });
});

import { calculateStreakAfterCheckIn } from '../utils/streakUtils';

describe('streakUtils', () => {
  it('should start streak at 1 for first check-in (null lastCheckInDate)', () => {
    const today = new Date(2026, 7, 11);
    expect(calculateStreakAfterCheckIn(null, 0, today)).toBe(1);
  });

  it('should maintain streak if already checked in today', () => {
    const today = new Date(2026, 7, 11, 14, 0);
    const lastCheckIn = new Date(2026, 7, 11, 8, 0).toISOString();
    expect(calculateStreakAfterCheckIn(lastCheckIn, 5, today)).toBe(5);
  });

  it('should increment streak by 1 for consecutive calendar day check-in', () => {
    const today = new Date(2026, 7, 11, 10, 0);
    const yesterday = new Date(2026, 7, 10, 18, 0).toISOString();
    expect(calculateStreakAfterCheckIn(yesterday, 3, today)).toBe(4);
  });

  it('should reset streak to 1 if more than one calendar day was missed', () => {
    const today = new Date(2026, 7, 11, 10, 0);
    const threeDaysAgo = new Date(2026, 7, 8, 10, 0).toISOString();
    expect(calculateStreakAfterCheckIn(threeDaysAgo, 10, today)).toBe(1);
  });
});

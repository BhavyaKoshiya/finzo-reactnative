import {
  getDailyCheckInReward,
  getRewardScheduleDay,
  getNextDailyReward,
  getWeeklyRewardProgress,
  getDailyCheckInCopy,
} from '../utils/dailyCheckInUtils';
import { DEFAULT_REALTIME_CONFIG } from '../../../config/realtimeConfigDefaults';

describe('dailyCheckInUtils', () => {
  const config = DEFAULT_REALTIME_CONFIG;

  it('should map streak counts to schedule days 1..7 correctly', () => {
    expect(getRewardScheduleDay(0, config)).toBe(1); // Day 1
    expect(getRewardScheduleDay(1, config)).toBe(2); // Day 2
    expect(getRewardScheduleDay(2, config)).toBe(3); // Day 3
    expect(getRewardScheduleDay(3, config)).toBe(4); // Day 4
    expect(getRewardScheduleDay(4, config)).toBe(5); // Day 5
    expect(getRewardScheduleDay(5, config)).toBe(6); // Day 6
    expect(getRewardScheduleDay(6, config)).toBe(7); // Day 7
  });

  it('should repeat max Day 7 reward for Day 8+ when repeatLastReward is true', () => {
    expect(getRewardScheduleDay(7, config)).toBe(7);
    expect(getRewardScheduleDay(30, config)).toBe(7);
    expect(getDailyCheckInReward(7, config)).toBe(20);
    expect(getDailyCheckInReward(30, config)).toBe(20);
  });

  it('should calculate reward ladder sequence: 5, 7, 9, 12, 15, 17, 20 points', () => {
    expect(getDailyCheckInReward(0, config)).toBe(5);  // New user claim = 5
    expect(getDailyCheckInReward(1, config)).toBe(7);  // 1-day streak, next claim = 7
    expect(getDailyCheckInReward(2, config)).toBe(9);  // 2-day streak, next claim = 9
    expect(getDailyCheckInReward(3, config)).toBe(12); // 3-day streak, next claim = 12
    expect(getDailyCheckInReward(4, config)).toBe(15); // 4-day streak, next claim = 15
    expect(getDailyCheckInReward(5, config)).toBe(17); // 5-day streak, next claim = 17
    expect(getDailyCheckInReward(6, config)).toBe(20); // 6-day streak, next claim = 20
    expect(getDailyCheckInReward(7, config)).toBe(20); // 7-day streak, next claim = 20
  });

  it('should calculate next check-in reward', () => {
    expect(getNextDailyReward(0, config)).toBe(7);
    expect(getNextDailyReward(4, config)).toBe(17);
    expect(getNextDailyReward(5, config)).toBe(20);
    expect(getNextDailyReward(6, config)).toBe(20);
  });

  it('should generate 7 weekly progress nodes', () => {
    const nodes = getWeeklyRewardProgress(5, false, config);
    expect(nodes.length).toBe(7);
    expect(nodes[5].isCurrent).toBe(true);
    expect(nodes[5].points).toBe(17);
    expect(nodes[0].isCompleted).toBe(true);
  });

  it('should interpolate UI copy strings', () => {
    const copy = getDailyCheckInCopy(5, false, config); // 5-day streak so far, today is Day 6 claim = 17 pts
    expect(copy.streakBadge).toBe('5 Day Streak');
    expect(copy.claimButtonText).toBe('Claim 17 Points');
  });
});

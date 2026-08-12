import { hasCheckedInToday, isCheckInConsecutive } from './dateUtils';

/**
 * Calculates updated streak count based on last check-in date and current date.
 * - First check-in: 1
 * - Consecutive day: currentStreak + 1
 * - Same day: currentStreak
 * - Missed day (>1 day ago): 1
 */
export const calculateStreakAfterCheckIn = (
  lastCheckInDate,
  currentStreak = 0,
  targetDate = new Date()
) => {
  if (!lastCheckInDate) {
    return 1;
  }

  if (hasCheckedInToday(lastCheckInDate, targetDate)) {
    return currentStreak > 0 ? currentStreak : 1;
  }

  if (isCheckInConsecutive(lastCheckInDate, targetDate)) {
    return (currentStreak > 0 ? currentStreak : 0) + 1;
  }

  // Missed more than 1 day
  return 1;
};

export default {
  calculateStreakAfterCheckIn,
};

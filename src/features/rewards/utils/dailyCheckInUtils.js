import { selectDailyCheckInConfig, selectDailyCheckInUIConfig } from '../../../config/realtimeConfigSelectors';
import { interpolateRewardCopy } from '../../../config/realtimeConfigUtils';

/**
 * Calculates the schedule day index (1..cycleLength) based on current streak count.
 * Handles streak rollover and repeatLastReward logic.
 * Streak 0 -> Day 1; Streak 1 -> Day 2; Streak 6 -> Day 7; Streak 7+ -> Day 7 (max).
 */
export const getRewardScheduleDay = (currentStreak = 0, config) => {
  const dci = selectDailyCheckInConfig(config);
  const schedule = dci.rewardSchedule || dci.schedule || [5, 7, 9, 12, 15, 17, 20];
  const cycleLength = Array.isArray(schedule) ? schedule.length : (dci.cycleLength || 7);
  const streak = Math.max(0, currentStreak || 0);

  const dayNumber = streak + 1;
  if (dayNumber <= cycleLength) return dayNumber;

  if (dci.repeatLastReward !== false) {
    return cycleLength;
  }
  return ((dayNumber - 1) % cycleLength) + 1;
};

/**
 * Pure function: calculates exact daily points to award for current check-in.
 */
export const getDailyCheckInReward = (currentStreak = 0, config) => {
  const dci = selectDailyCheckInConfig(config);
  const scheduleDay = getRewardScheduleDay(currentStreak, config);
  const schedule = dci.rewardSchedule || dci.schedule || [5, 7, 9, 12, 15, 17, 20];

  let rewardValue = 5;
  if (Array.isArray(schedule)) {
    const idx = Math.min(Math.max(0, scheduleDay - 1), schedule.length - 1);
    rewardValue = schedule[idx] ?? 5;
  } else if (typeof schedule === 'object' && schedule !== null) {
    rewardValue = schedule[scheduleDay] ?? schedule[`day${scheduleDay}`] ?? schedule[1] ?? 5;
  }

  const maxReward = typeof dci.maxReward === 'number' ? dci.maxReward : 20;
  return Math.min(rewardValue, maxReward);
};

/**
 * Pure function: calculates expected reward points for tomorrow's next check-in.
 */
export const getNextDailyReward = (currentStreak, config) => {
  return getDailyCheckInReward(currentStreak + 1, config);
};

/**
 * Builds array of weekly progression nodes (1..cycleLength) for visual timeline UI.
 * Returns array of objects: { day, points, isCompleted, isCurrent, isUpcoming }.
 */
export const getWeeklyRewardProgress = (currentStreak, hasCheckedInToday, config) => {
  const dci = selectDailyCheckInConfig(config);
  const schedule = dci.rewardSchedule || dci.schedule || [5, 7, 9, 12, 15, 17, 20];
  const cycleLength = Array.isArray(schedule) ? schedule.length : (dci.cycleLength || 7);

  const activeDay = hasCheckedInToday
    ? getRewardScheduleDay(Math.max(0, currentStreak - 1), config)
    : getRewardScheduleDay(currentStreak, config);

  const nodes = [];
  for (let d = 1; d <= cycleLength; d++) {
    let points = 20;
    if (Array.isArray(schedule)) {
      points = schedule[d - 1] ?? 20;
    } else if (typeof schedule === 'object' && schedule !== null) {
      points = schedule[d] ?? schedule[`day${d}`] ?? 20;
    }

    let status = 'upcoming';
    if (hasCheckedInToday) {
      if (d <= activeDay) status = 'completed';
      else status = 'upcoming';
    } else {
      if (d < activeDay) status = 'completed';
      else if (d === activeDay) status = 'current';
      else status = 'upcoming';
    }

    nodes.push({
      day: d,
      points,
      status,
      isCompleted: status === 'completed',
      isCurrent: status === 'current',
      isUpcoming: status === 'upcoming',
    });
  }

  return nodes;
};

/**
 * Resolves interpolated copy strings for Daily Check-In UI.
 */
export const getDailyCheckInCopy = (currentStreak, hasCheckedInToday, config) => {
  const ui = selectDailyCheckInUIConfig(config);
  const todayPoints = getDailyCheckInReward(hasCheckedInToday ? Math.max(0, currentStreak - 1) : currentStreak, config);
  const nextPoints = getNextDailyReward(hasCheckedInToday ? Math.max(0, currentStreak - 1) : currentStreak, config);
  const schedule = selectDailyCheckInConfig(config).rewardSchedule || [5, 7, 9, 12, 15, 17, 20];
  const cycleLength = Array.isArray(schedule) ? schedule.length : (selectDailyCheckInConfig(config).cycleLength || 7);

  const isNewUser = currentStreak === 0 && !hasCheckedInToday;
  const isMaxReward = currentStreak >= cycleLength;

  const interpolatedTitle = isNewUser
    ? (ui.newUserTitle || 'Start Your Streak')
    : interpolateRewardCopy(ui.title || 'Daily Check-In', { count: currentStreak });

  const interpolatedSubtitle = isNewUser
    ? (ui.newUserSubtitle || 'Check in every day to unlock bigger rewards.')
    : isMaxReward
    ? (ui.maxRewardMessage || "You're earning the maximum daily reward!")
    : (ui.subtitle || 'Keep your streak going and earn more Finzo Points.');

  const streakBadge = interpolateRewardCopy(ui.streakTitle || '{count} Day Streak', { count: currentStreak });
  const claimBtn = interpolateRewardCopy(ui.claimButtonText || 'Claim {points} Points', { points: todayPoints });
  const successMsg = interpolateRewardCopy(ui.successMessage || '+{points} Points earned!', { points: todayPoints });

  return {
    title: interpolatedTitle,
    subtitle: interpolatedSubtitle,
    streakBadge,
    todayRewardLabel: ui.todayRewardLabel || "Today's Reward",
    todayPoints,
    nextRewardLabel: ui.nextRewardLabel || 'Next Check-In',
    nextPoints,
    progressTitle: ui.progressTitle || 'Weekly Progress',
    claimButtonText: claimBtn,
    claimedButtonText: ui.claimedButtonText || 'Claimed Today',
    successMessage: successMsg,
    missedStreakMessage: ui.missedStreakMessage || 'Start a new streak today.',
    maxRewardMessage: ui.maxRewardMessage || "You're earning the maximum daily reward!",
    dayLabel: (day) => interpolateRewardCopy(ui.dayLabel || 'Day {day}', { day }),
    showProgress: ui.showProgress !== false,
    showNextReward: ui.showNextReward !== false,
    showStreak: ui.showStreak !== false,
    showRewardHistory: ui.showRewardHistory !== false,
  };
};

export default {
  getRewardScheduleDay,
  getDailyCheckInReward,
  getNextDailyReward,
  getWeeklyRewardProgress,
  getDailyCheckInCopy,
};

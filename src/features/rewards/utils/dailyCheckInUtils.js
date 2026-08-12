import { selectDailyCheckInConfig, selectDailyCheckInUIConfig } from '../../../config/realtimeConfigSelectors';
import { interpolateRewardCopy } from '../../../config/realtimeConfigUtils';

/**
 * Calculates the schedule day index (1..cycleLength) based on current streak count.
 * Handles streak rollover and repeatLastReward logic.
 */
export const getRewardScheduleDay = (currentStreak, config) => {
  const dci = selectDailyCheckInConfig(config);
  const cycleLength = dci.cycleLength || 7;
  const streak = Math.max(0, currentStreak || 0);

  if (streak === 0) return 1;
  if (streak <= cycleLength) return streak;

  if (dci.repeatLastReward) {
    return cycleLength;
  }
  // If not repeating last reward, cycle back through 1..cycleLength
  return ((streak - 1) % cycleLength) + 1;
};

/**
 * Pure function: calculates exact daily points to award for current check-in.
 */
export const getDailyCheckInReward = (currentStreak, config) => {
  const dci = selectDailyCheckInConfig(config);
  const scheduleDay = getRewardScheduleDay(currentStreak, config);
  const schedule = dci.rewardSchedule || {};

  const rewardValue = schedule[scheduleDay] ?? schedule[1] ?? 5;
  return Math.min(rewardValue, dci.maxReward || 20);
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
  const cycleLength = dci.cycleLength || 7;
  const schedule = dci.rewardSchedule || {};

  const activeDay = hasCheckedInToday
    ? getRewardScheduleDay(currentStreak, config)
    : getRewardScheduleDay(currentStreak + 1, config);

  const nodes = [];
  for (let d = 1; d <= cycleLength; d++) {
    const points = schedule[d] ?? dci.maxReward ?? 20;

    let status = 'upcoming';
    if (hasCheckedInToday) {
      if (d < activeDay) status = 'completed';
      else if (d === activeDay) status = 'completed'; // Today's claim completed
      else status = 'upcoming';
    } else {
      if (d < activeDay) status = 'completed';
      else if (d === activeDay) status = 'current'; // Today's target claim
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
  const todayPoints = getDailyCheckInReward(hasCheckedInToday ? Math.max(1, currentStreak) : currentStreak + 1, config);
  const nextPoints = getNextDailyReward(hasCheckedInToday ? currentStreak : currentStreak + 1, config);
  const cycleLength = selectDailyCheckInConfig(config).cycleLength || 7;

  const isNewUser = currentStreak === 0 && !hasCheckedInToday;
  const isMaxReward = currentStreak >= cycleLength;

  const interpolatedTitle = isNewUser
    ? ui.newUserTitle
    : interpolateRewardCopy(ui.title, { count: currentStreak });

  const interpolatedSubtitle = isNewUser
    ? ui.newUserSubtitle
    : isMaxReward
    ? ui.maxRewardMessage
    : ui.subtitle;

  const streakBadge = interpolateRewardCopy(ui.streakTitle, { count: currentStreak });
  const claimBtn = interpolateRewardCopy(ui.claimButtonText, { points: todayPoints });
  const successMsg = interpolateRewardCopy(ui.successMessage, { points: todayPoints });

  return {
    title: interpolatedTitle,
    subtitle: interpolatedSubtitle,
    streakBadge,
    todayRewardLabel: ui.todayRewardLabel,
    todayPoints,
    nextRewardLabel: ui.nextRewardLabel,
    nextPoints,
    progressTitle: ui.progressTitle,
    claimButtonText: claimBtn,
    claimedButtonText: ui.claimedButtonText,
    successMessage: successMsg,
    missedStreakMessage: ui.missedStreakMessage,
    maxRewardMessage: ui.maxRewardMessage,
    dayLabel: (day) => interpolateRewardCopy(ui.dayLabel, { day }),
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

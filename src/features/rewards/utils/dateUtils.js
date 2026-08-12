import {
  isSameDay,
  isToday,
  isYesterday,
  differenceInCalendarDays,
  format,
  parseISO,
} from 'date-fns';

/**
 * Safely parses an ISO date string or Date instance into a Date object.
 */
const toDate = (dateOrString) => {
  if (!dateOrString) return null;
  if (dateOrString instanceof Date) return dateOrString;
  try {
    return parseISO(dateOrString);
  } catch (_err) {
    return new Date(dateOrString);
  }
};

/**
 * Returns true if lastCheckInDate falls on the same calendar day as targetDate (defaults to now).
 */
export const hasCheckedInToday = (lastCheckInDate, targetDate = new Date()) => {
  const parsedLast = toDate(lastCheckInDate);
  if (!parsedLast) return false;
  return isSameDay(parsedLast, targetDate);
};

/**
 * Returns true if the previous check-in was exactly 1 calendar day before targetDate.
 */
export const isCheckInConsecutive = (lastCheckInDate, targetDate = new Date()) => {
  const parsedLast = toDate(lastCheckInDate);
  if (!parsedLast) return false;
  return differenceInCalendarDays(targetDate, parsedLast) === 1;
};

/**
 * Returns true if more than 1 calendar day has elapsed since lastCheckInDate.
 */
export const isCheckInMissed = (lastCheckInDate, targetDate = new Date()) => {
  const parsedLast = toDate(lastCheckInDate);
  if (!parsedLast) return false;
  return differenceInCalendarDays(targetDate, parsedLast) > 1;
};

/**
 * Formats a reward transaction date for display (e.g., 'Today', 'Yesterday', 'Aug 11').
 */
export const formatRewardDate = (isoString) => {
  const parsed = toDate(isoString);
  if (!parsed || isNaN(parsed.getTime())) return '';

  if (isToday(parsed)) return 'Today';
  if (isYesterday(parsed)) return 'Yesterday';
  return format(parsed, 'MMM d');
};

export default {
  hasCheckedInToday,
  isCheckInConsecutive,
  isCheckInMissed,
  formatRewardDate,
};

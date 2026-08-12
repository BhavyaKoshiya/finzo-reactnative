import {
  parseISO,
  differenceInCalendarDays,
  format,
  isValid,
  startOfDay,
} from 'date-fns';

/**
 * Calculates next EMI status based on target date vs reference date.
 * @param {string|Date} nextEmiDate
 * @param {Date} [referenceDate=new Date()]
 * @returns {Object} { nextEmiDate, daysUntilPayment, isDueToday, isPastDue, isUpcoming, formattedDate }
 */
export const getNextEmiInfo = (nextEmiDate, referenceDate = new Date()) => {
  if (!nextEmiDate) {
    return {
      nextEmiDate: null,
      daysUntilPayment: 0,
      isDueToday: false,
      isPastDue: false,
      isUpcoming: false,
      formattedDate: 'N/A',
    };
  }

  const targetDate = typeof nextEmiDate === 'string' ? parseISO(nextEmiDate) : nextEmiDate;
  if (!isValid(targetDate)) {
    return {
      nextEmiDate: null,
      daysUntilPayment: 0,
      isDueToday: false,
      isPastDue: false,
      isUpcoming: false,
      formattedDate: 'Invalid date',
    };
  }

  const refStart = startOfDay(referenceDate);
  const targetStart = startOfDay(targetDate);
  const daysUntilPayment = differenceInCalendarDays(targetStart, refStart);

  const isDueToday = daysUntilPayment === 0;
  const isPastDue = daysUntilPayment < 0;
  const isUpcoming = daysUntilPayment > 0;

  let formattedDate = '';
  try {
    formattedDate = format(targetDate, 'dd MMM yyyy');
  } catch (e) {
    formattedDate = String(nextEmiDate);
  }

  return {
    nextEmiDate: targetDate.toISOString().split('T')[0],
    daysUntilPayment,
    isDueToday,
    isPastDue,
    isUpcoming,
    formattedDate,
  };
};

/**
 * Formats ISO date string to localized display string.
 * @param {string} dateString
 * @param {string} [pattern='dd MMM yyyy']
 * @returns {string}
 */
export const formatLoanDate = (dateString, pattern = 'dd MMM yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(d) ? format(d, pattern) : String(dateString);
  } catch (e) {
    return String(dateString);
  }
};

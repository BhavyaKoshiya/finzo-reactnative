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
export const parseLocalDateStr = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  const clean = String(dateString).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const parsed = parseISO(dateString);
  return isValid(parsed) ? parsed : null;
};

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

  const targetDate = parseLocalDateStr(nextEmiDate);
  if (!targetDate || !isValid(targetDate)) {
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

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');

  return {
    nextEmiDate: `${y}-${m}-${d}`,
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
    const d = parseLocalDateStr(dateString);
    return d && isValid(d) ? format(d, pattern) : String(dateString);
  } catch (e) {
    return String(dateString);
  }
};

import { format, addMonths as fnsAddMonths, differenceInMonths, isValid, parseISO } from 'date-fns';

export const formatDisplayDate = (date, pattern = 'dd MMM yyyy') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!d || !isValid(d)) return '';
  return format(d, pattern);
};

export const formatShortDate = (date) => {
  return formatDisplayDate(date, 'dd/MM/yyyy');
};

export const addMonths = (date, months) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!d || !isValid(d)) return new Date();
  return fnsAddMonths(d, months);
};

export const calculateDateDifference = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  if (!start || !end || !isValid(start) || !isValid(end)) return 0;
  return differenceInMonths(end, start);
};

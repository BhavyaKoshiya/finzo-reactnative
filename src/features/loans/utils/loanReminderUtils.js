import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

/**
 * Safely constrains a due day to an integer between 1 and 31.
 * @param {number|string} dueDay
 * @returns {number} Normalized day of month (1..31)
 */
export const normalizeDueDay = (dueDay) => {
  const num = parseInt(dueDay, 10);
  if (isNaN(num) || num < 1) return 5;
  return Math.min(31, num);
};

/**
 * Returns the maximum number of days in a given month of a given year.
 * @param {number} year
 * @param {number} monthIndex - 0 for Jan, 1 for Feb, etc.
 * @returns {number} Days in month (e.g. 28, 29, 30, 31)
 */
export const getLastDayOfMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

/**
 * Safely formats a date object as YYYY-MM-DD.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
export const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Gets the exact due date formatted as YYYY-MM-DD for a specific year & monthIndex.
 * @param {number|string} dueDay
 * @param {number} year
 * @param {number} monthIndex - 0..11
 * @returns {string} YYYY-MM-DD
 */
export const getDueDateForMonth = (dueDay, year, monthIndex) => {
  const targetDay = normalizeDueDay(dueDay);
  const maxDays = getLastDayOfMonth(year, monthIndex);
  const finalDay = Math.min(targetDay, maxDays);
  const d = new Date(year, monthIndex, finalDay);
  return formatDateISO(d);
};

/**
 * Calculates the next upcoming payment due date for a loan based on its due day.
 * @param {number|string} dueDay - Target day of month (1..31)
 * @param {Date|string} [relativeDate=new Date()] - Reference date
 * @returns {string} Next due date as YYYY-MM-DD
 */
export const calculateNextDueDate = (dueDay, relativeDate = new Date()) => {
  const refDate = relativeDate instanceof Date ? relativeDate : new Date(relativeDate);
  const validRefDate = isNaN(refDate.getTime()) ? new Date() : refDate;

  const currentYear = validRefDate.getFullYear();
  const currentMonth = validRefDate.getMonth();
  const currentDay = validRefDate.getDate();

  const targetDay = normalizeDueDay(dueDay);
  const maxDayCurrentMonth = getLastDayOfMonth(currentYear, currentMonth);
  const effectiveTargetCurrentMonth = Math.min(targetDay, maxDayCurrentMonth);

  let dueYear = currentYear;
  let dueMonth = currentMonth;

  if (currentDay > effectiveTargetCurrentMonth) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }

  return getDueDateForMonth(targetDay, dueYear, dueMonth);
};

/**
 * Authoritative helper to get a loan's next upcoming payment date.
 * Prioritizes loan.nextPaymentDate if explicitly set, otherwise calculates from dueDay.
 * @param {Object} loan Profile object
 * @param {Date|string} [relativeDate=new Date()]
 * @returns {string} YYYY-MM-DD
 */
export const getNextLoanPaymentDate = (loan, relativeDate = new Date()) => {
  if (!loan) return calculateNextDueDate(5, relativeDate);

  if (loan.nextPaymentDate && typeof loan.nextPaymentDate === 'string') {
    const customDate = new Date(loan.nextPaymentDate);
    if (!isNaN(customDate.getTime())) {
      return loan.nextPaymentDate.split('T')[0];
    }
  }

  return calculateNextDueDate(loan.dueDay || 5, relativeDate);
};

/**
 * Generates a deterministic payment period key (e.g., 'loan123_2026-09').
 * @param {string} loanId
 * @param {string|Date} dateOrPeriod
 * @returns {string} Period key
 */
export const getPaymentPeriodKey = (loanId, dateOrPeriod) => {
  const safeId = String(loanId || 'loan');
  if (!dateOrPeriod) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `${safeId}_${period}`;
  }

  if (typeof dateOrPeriod === 'string' && /^\d{4}-\d{2}/.test(dateOrPeriod)) {
    const period = dateOrPeriod.substring(0, 7);
    return `${safeId}_${period}`;
  }

  const d = dateOrPeriod instanceof Date ? dateOrPeriod : new Date(dateOrPeriod);
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${safeId}_${period}`;
};

/**
 * Determines whether a scheduled EMI payment has been satisfied for a given month period.
 * Standalone prepayments do NOT satisfy a scheduled EMI.
 * @param {Object} loan Profile object
 * @param {Array} payments List of payment records
 * @param {string} periodKey Period key (e.g. 'loan123_2026-09') or date string
 * @returns {boolean} True if a matching regular EMI exists for that period
 */
export const isPaymentPeriodSatisfied = (loan, payments = [], periodKey) => {
  if (!loan || !Array.isArray(payments)) return false;

  const targetLoanId = loan.id;
  const parts = String(periodKey || '').split('_');
  const targetPeriod = parts[parts.length - 1];

  const loanPayments = payments.filter((p) => p.loanId === targetLoanId);

  return loanPayments.some((p) => {
    // Must be regular EMI type
    const isEmiType = p.paymentType === PAYMENT_TYPES.REGULAR_EMI || p.paymentType === 'regular_emi' || p.paymentType === 'emi';
    if (!isEmiType) return false;

    const paymentDateStr = (p.paymentDate || p.dueDate || '').substring(0, 7);
    return paymentDateStr === targetPeriod;
  });
};

/**
 * Calculates current payment status for a loan (upcoming, due_today, overdue, paid, paid_off).
 * @param {Object} loan Profile object
 * @param {Array} [payments=[]] Payments list
 * @param {Date|string} [relativeDate=new Date()] Reference date
 * @returns {{ status: 'upcoming'|'due_today'|'overdue'|'paid'|'paid_off', isCurrentPeriodPaid: boolean, daysOverdue: number, daysRemaining: number, nextDueDate: string, periodKey: string }}
 */
export const getPaymentStatus = (loan, payments = [], relativeDate = new Date()) => {
  if (!loan) {
    return {
      status: 'upcoming',
      isCurrentPeriodPaid: false,
      daysOverdue: 0,
      daysRemaining: 0,
      nextDueDate: formatDateISO(new Date()),
      periodKey: 'loan_none',
    };
  }

  // Paid-off / Archived loans
  if (loan.status === 'archived' || Number(loan.currentOutstandingPrincipal) <= 0) {
    return {
      status: 'paid_off',
      isCurrentPeriodPaid: true,
      daysOverdue: 0,
      daysRemaining: 0,
      nextDueDate: '',
      periodKey: getPaymentPeriodKey(loan.id, relativeDate),
    };
  }

  const refDate = relativeDate instanceof Date ? relativeDate : new Date(relativeDate);
  const todayStr = formatDateISO(refDate);
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();

  // 1. Evaluate current month's scheduled due date
  const currentMonthDueDate = getDueDateForMonth(loan.dueDay || 5, refYear, refMonth);
  const currentPeriodKey = getPaymentPeriodKey(loan.id, currentMonthDueDate);
  const isCurrentSatisfied = isPaymentPeriodSatisfied(loan, payments, currentPeriodKey);

  const todayTime = new Date(todayStr).getTime();
  const currentDueTime = new Date(currentMonthDueDate).getTime();

  if (!isCurrentSatisfied) {
    if (todayTime > currentDueTime) {
      // Due date for current month has passed and is unpaid -> OVERDUE
      const diffMs = todayTime - currentDueTime;
      const daysOverdue = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return {
        status: 'overdue',
        isCurrentPeriodPaid: false,
        daysOverdue,
        daysRemaining: 0,
        nextDueDate: currentMonthDueDate,
        periodKey: currentPeriodKey,
      };
    } else if (todayTime === currentDueTime) {
      // Due date is TODAY
      return {
        status: 'due_today',
        isCurrentPeriodPaid: false,
        daysOverdue: 0,
        daysRemaining: 0,
        nextDueDate: currentMonthDueDate,
        periodKey: currentPeriodKey,
      };
    } else {
      // Due date is in future of current month -> UPCOMING
      const diffMs = currentDueTime - todayTime;
      const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        isCurrentPeriodPaid: false,
        daysOverdue: 0,
        daysRemaining,
        nextDueDate: currentMonthDueDate,
        periodKey: currentPeriodKey,
      };
    }
  }

  // 2. Current month is satisfied -> check next month's due date
  let nextMonthYear = refYear;
  let nextMonth = refMonth + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextMonthYear += 1;
  }
  const nextMonthDueDate = getDueDateForMonth(loan.dueDay || 5, nextMonthYear, nextMonth);
  const nextPeriodKey = getPaymentPeriodKey(loan.id, nextMonthDueDate);
  const isNextSatisfied = isPaymentPeriodSatisfied(loan, payments, nextPeriodKey);

  if (isNextSatisfied) {
    return {
      status: 'paid',
      isCurrentPeriodPaid: true,
      daysOverdue: 0,
      daysRemaining: 0,
      nextDueDate: currentMonthDueDate,
      periodKey: currentPeriodKey,
    };
  }

  const nextDueTime = new Date(nextMonthDueDate).getTime();
  const diffMs = nextDueTime - todayTime;
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    status: 'upcoming',
    isCurrentPeriodPaid: true,
    daysOverdue: 0,
    daysRemaining,
    nextDueDate: nextMonthDueDate,
    periodKey: nextPeriodKey,
  };
};

/**
 * Computes exact reminder Date object based on due date, lead days, and time.
 * @param {string} dueDateStr - YYYY-MM-DD
 * @param {number} [reminderDaysBefore=3]
 * @param {string} [reminderTimeStr='09:00'] - HH:mm
 * @returns {Date} Scheduled Date object
 */
export const getReminderDate = (dueDateStr, reminderDaysBefore = 3, reminderTimeStr = '09:00') => {
  const [year, month, day] = dueDateStr.split('-').map((v) => parseInt(v, 10));
  const [hours, minutes] = (reminderTimeStr || '09:00').split(':').map((v) => parseInt(v, 10));

  const targetDate = new Date(year, month - 1, day, hours || 9, minutes || 0, 0);
  targetDate.setDate(targetDate.getDate() - (Number(reminderDaysBefore) || 0));

  return targetDate;
};

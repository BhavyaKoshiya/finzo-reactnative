import { formatCurrency } from '../../../utils/financeFormatters';

/**
 * Utility functions for classifying and summarizing changes to a loan profile.
 */

export const CHANGE_CATEGORIES = {
  COSMETIC: 'cosmetic',
  MATERIAL: 'material',
  REMINDER: 'reminder',
};

const FIELD_LABELS = {
  name: 'Loan Name',
  loanType: 'Loan Type',
  lenderName: 'Lender Name',
  originalPrincipal: 'Original Principal',
  annualInterestRate: 'Interest Rate',
  emiAmount: 'Monthly EMI',
  originalTenure: 'Original Tenure',
  remainingTenure: 'Remaining Tenure',
  loanStartDate: 'Loan Start Date',
  nextEmiDate: 'Next EMI Date',
  processingFee: 'Processing Fee',
  notes: 'Notes / Reference',
  isPrimary: 'Primary Loan Flag',
  dueDay: 'Due Day of Month',
  remindersEnabled: 'Reminders Enabled',
  reminderDaysBefore: 'Reminder Advance Days',
  reminderTime: 'Reminder Notification Time',
};

/**
 * Formats raw value into user-friendly string for change summary display.
 */
export const formatFieldValue = (fieldKey, value) => {
  if (value === null || value === undefined || value === '') {
    return 'Not specified';
  }

  switch (fieldKey) {
    case 'originalPrincipal':
    case 'emiAmount':
    case 'processingFee':
      return formatCurrency(value);
    case 'annualInterestRate':
      return `${Number(value).toFixed(2)}%`;
    case 'isPrimary':
    case 'remindersEnabled':
      return value ? 'Yes' : 'No';
    case 'originalTenure':
    case 'remainingTenure':
      if (typeof value === 'object') {
        return `${value.value} ${value.unit || 'months'}`;
      }
      return String(value);
    case 'dueDay':
      return `Day ${value} of month`;
    case 'reminderDaysBefore':
      return `${value} day(s) before`;
    default:
      return String(value);
  }
};

/**
 * Calculates raw diff object comparing existing profile with updated values.
 */
export const getLoanProfileChanges = (oldProfile = {}, newValues = {}) => {
  if (!oldProfile || !newValues) return [];

  const changes = [];

  const checkField = (key, category, compareFn) => {
    const oldVal = oldProfile[key];
    const newVal = newValues[key];

    let hasChanged = false;
    if (compareFn) {
      hasChanged = compareFn(oldVal, newVal);
    } else {
      hasChanged = String(oldVal ?? '') !== String(newVal ?? '');
    }

    if (hasChanged) {
      changes.push({
        fieldKey: key,
        fieldLabel: FIELD_LABELS[key] || key,
        oldValue: oldVal,
        newValue: newVal,
        formattedOldValue: formatFieldValue(key, oldVal),
        formattedNewValue: formatFieldValue(key, newVal),
        category,
      });
    }
  };

  // Cosmetic / Display fields
  checkField('name', CHANGE_CATEGORIES.COSMETIC);
  checkField('lenderName', CHANGE_CATEGORIES.COSMETIC);
  checkField('notes', CHANGE_CATEGORIES.COSMETIC);
  checkField('processingFee', CHANGE_CATEGORIES.COSMETIC);
  checkField('isPrimary', CHANGE_CATEGORIES.COSMETIC);

  // Material financial & schedule terms
  checkField('annualInterestRate', CHANGE_CATEGORIES.MATERIAL, (o, n) => Number(o || 0) !== Number(n || 0));
  checkField('emiAmount', CHANGE_CATEGORIES.MATERIAL, (o, n) => Number(o || 0) !== Number(n || 0));
  checkField('originalPrincipal', CHANGE_CATEGORIES.MATERIAL, (o, n) => Number(o || 0) !== Number(n || 0));
  checkField('loanStartDate', CHANGE_CATEGORIES.MATERIAL);
  checkField('loanType', CHANGE_CATEGORIES.MATERIAL);

  // Tenure compare
  checkField('originalTenure', CHANGE_CATEGORIES.MATERIAL, (o, n) => {
    const oVal = typeof o === 'object' ? `${o.value}_${o.unit}` : String(o || '');
    const nVal = typeof n === 'object' ? `${n.value}_${n.unit}` : String(n || '');
    return oVal !== nVal;
  });

  // Reminder fields
  checkField('dueDay', CHANGE_CATEGORIES.REMINDER, (o, n) => Number(o || 0) !== Number(n || 0));
  checkField('remindersEnabled', CHANGE_CATEGORIES.REMINDER, (o, n) => Boolean(o) !== Boolean(n));
  checkField('reminderDaysBefore', CHANGE_CATEGORIES.REMINDER, (o, n) => Number(o || 0) !== Number(n || 0));
  checkField('reminderTime', CHANGE_CATEGORIES.REMINDER);

  return changes;
};

/**
 * Classifies changes list into categorized groups.
 */
export const classifyLoanProfileChanges = (changes = []) => {
  const cosmetic = changes.filter((c) => c.category === CHANGE_CATEGORIES.COSMETIC);
  const material = changes.filter((c) => c.category === CHANGE_CATEGORIES.MATERIAL);
  const reminder = changes.filter((c) => c.category === CHANGE_CATEGORIES.REMINDER);

  return {
    hasChanges: changes.length > 0,
    hasCosmeticChanges: cosmetic.length > 0,
    hasMaterialChanges: material.length > 0,
    hasReminderChanges: reminder.length > 0,
    cosmetic,
    material,
    reminder,
    all: changes,
  };
};

/**
 * Determines whether saving requires explicit user confirmation dialog.
 */
export const requiresMaterialChangeConfirmation = (changes = [], payments = []) => {
  const classified = classifyLoanProfileChanges(changes);
  // Show confirmation if there are material financial changes AND historical payments exist
  return classified.hasMaterialChanges && Array.isArray(payments) && payments.length > 0;
};

/**
 * Formats a clean change summary list for review modal.
 */
export const buildLoanChangeSummary = (changes = []) => {
  return changes.map((c) => ({
    key: c.fieldKey,
    label: c.fieldLabel,
    from: c.formattedOldValue,
    to: c.formattedNewValue,
    category: c.category,
    isMaterial: c.category === CHANGE_CATEGORIES.MATERIAL,
  }));
};

import { updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import { createLoanProfile } from '../types/loanProfileTypes';
import { validateLoanProfileInput } from '../utils/loanProfileValidation';
import {
  getLoanProfileChanges,
  classifyLoanProfileChanges,
  requiresMaterialChangeConfirmation,
  buildLoanChangeSummary,
} from '../utils/loanProfileChangeUtils';
import loanReminderService from './loanReminderService';

/**
 * Central service for applying validated, safe, atomic updates to loan profiles.
 */
export const updateLoanProfileService = ({
  existingProfile,
  formPayload,
  payments = [],
  globalRemindersEnabled = true,
  allLoans = [],
  dispatch,
}) => {
  if (!existingProfile || !existingProfile.id) {
    throw new Error('Existing loan profile is required for update.');
  }

  // 1. Validate Form Input
  const validation = validateLoanProfileInput(formPayload);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // 2. Compute and Classify Changes
  const changes = getLoanProfileChanges(existingProfile, formPayload);
  const classified = classifyLoanProfileChanges(changes);

  if (!classified.hasChanges) {
    return {
      success: true,
      noChanges: true,
      updatedRecord: existingProfile,
    };
  }

  // 3. Determine ledgerVersion Behavior
  // Increment ledgerVersion ONLY if material financial or tenure terms have changed
  const currentLedgerVersion = Number(existingProfile.ledgerVersion || 1);
  const newLedgerVersion = classified.hasMaterialChanges ? currentLedgerVersion + 1 : currentLedgerVersion;

  // 4. Construct Protected Record
  // Protect current balance fields from accidental edit mutation
  const updatedRecord = createLoanProfile({
    ...existingProfile,
    ...formPayload,
    // Explicitly preserve ledger balance anchors
    currentOutstandingPrincipal: existingProfile.currentOutstandingPrincipal,
    userConfirmedBalance: existingProfile.userConfirmedBalance,
    balanceSource: existingProfile.balanceSource,
    lastBalanceConfirmationDate: existingProfile.lastBalanceConfirmationDate,
    ledgerVersion: newLedgerVersion,
    updatedAt: new Date().toISOString(),
  });

  // 5. Dispatch Atomic Redux Update
  dispatch(updateLoanProfile(updatedRecord));

  // 6. Reconcile Reminders if reminder or schedule fields changed
  if (classified.hasReminderChanges || classified.hasMaterialChanges) {
    const updatedLoansList = allLoans.map((l) => (l.id === updatedRecord.id ? updatedRecord : l));
    loanReminderService.reconcileLoanReminders({
      loans: updatedLoansList,
      payments,
      globalEnabled: globalRemindersEnabled,
    });
  }

  return {
    success: true,
    changes,
    classified,
    requiresConfirmation: requiresMaterialChangeConfirmation(changes, payments),
    changeSummary: buildLoanChangeSummary(changes),
    updatedRecord,
  };
};

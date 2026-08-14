/**
 * Redux Persist Migration Manifest & State Normalization Infrastructure
 *
 * Provides safe migration path across schema versions without resetting or wiping user data.
 * Protects against malformed, null, or corrupted persisted state during app hydration.
 */

export const PERSIST_VERSION = 1;

/**
 * Normalizes any persisted state to ensure all expected slice keys,
 * collections, arrays, and primitives exist with safe defaults.
 *
 * @param {Object} state - Raw rehydrated Redux state
 * @returns {Object} Clean, normalized state
 */
export const normalizePersistedState = (state = {}) => {
  if (!state || typeof state !== 'object') {
    return {};
  }

  const cleanState = { ...state };

  // 1. Settings Slice Normalization
  cleanState.settings = {
    themeMode: 'system',
    currency: 'INR',
    locale: 'en-IN',
    loanRemindersEnabled: true,
    ...(cleanState.settings || {}),
  };

  // 2. Loan Profiles Slice Normalization
  const rawProfiles = cleanState.loanProfiles?.profiles;
  cleanState.loanProfiles = {
    schemaVersion: 1,
    profiles: Array.isArray(rawProfiles)
      ? rawProfiles
          .filter((p) => p && typeof p === 'object' && p.id)
          .map((p) => ({
            ...p,
            status: p.status || 'active',
            isPrimary: Boolean(p.isPrimary),
            ledgerVersion: Number(p.ledgerVersion) || 1,
            currentOutstandingPrincipal: Number(p.currentOutstandingPrincipal) || 0,
            originalPrincipal: Number(p.originalPrincipal) || 0,
            interestRate: Number(p.interestRate) || 0,
            emiAmount: Number(p.emiAmount) || 0,
          }))
      : [],
    ...(cleanState.loanProfiles || {}),
  };
  // Ensure profiles array is clean
  if (!Array.isArray(cleanState.loanProfiles.profiles)) {
    cleanState.loanProfiles.profiles = [];
  }

  // 3. Loan Payments Slice Normalization
  const rawPayments = cleanState.loanPayments?.payments;
  cleanState.loanPayments = {
    schemaVersion: 1,
    payments: Array.isArray(rawPayments)
      ? rawPayments.filter((p) => p && typeof p === 'object' && p.id && p.loanId)
      : [],
    ...(cleanState.loanPayments || {}),
  };
  if (!Array.isArray(cleanState.loanPayments.payments)) {
    cleanState.loanPayments.payments = [];
  }

  // 4. Loan Goals Slice Normalization
  const rawGoals = cleanState.loanGoals?.goals;
  cleanState.loanGoals = {
    goals: Array.isArray(rawGoals)
      ? rawGoals.filter((g) => g && typeof g === 'object' && g.id && g.loanId)
      : [],
    ...(cleanState.loanGoals || {}),
  };
  if (!Array.isArray(cleanState.loanGoals.goals)) {
    cleanState.loanGoals.goals = [];
  }

  // 5. Loan Notes Slice Normalization
  const rawNotes = cleanState.loanNotes?.notes;
  cleanState.loanNotes = {
    notes: Array.isArray(rawNotes)
      ? rawNotes.filter((n) => n && typeof n === 'object' && n.id && n.loanId)
      : [],
    ...(cleanState.loanNotes || {}),
  };
  if (!Array.isArray(cleanState.loanNotes.notes)) {
    cleanState.loanNotes.notes = [];
  }

  // 6. Loan Private Details Slice Normalization
  const rawDetails = cleanState.loanPrivateDetails?.detailsByLoanId;
  cleanState.loanPrivateDetails = {
    detailsByLoanId: rawDetails && typeof rawDetails === 'object' && !Array.isArray(rawDetails)
      ? rawDetails
      : {},
    ...(cleanState.loanPrivateDetails || {}),
  };
  if (!cleanState.loanPrivateDetails.detailsByLoanId || typeof cleanState.loanPrivateDetails.detailsByLoanId !== 'object') {
    cleanState.loanPrivateDetails.detailsByLoanId = {};
  }

  // 7. Rewards Slice Normalization
  const rawRewards = cleanState.rewards && typeof cleanState.rewards === 'object' ? cleanState.rewards : {};
  const safePoints = Number(rawRewards.points);
  const safeStreak = Number(rawRewards.currentStreak);
  const safeLongest = Number(rawRewards.longestStreak);
  const safeCheckIns = Number(rawRewards.totalCheckIns);
  const safeAdsCount = Number(rawRewards.rewardedAdsWatchedToday);

  cleanState.rewards = {
    ...rawRewards,
    points: !isNaN(safePoints) ? safePoints : 0,
    currentStreak: !isNaN(safeStreak) ? safeStreak : 0,
    longestStreak: !isNaN(safeLongest) ? safeLongest : 0,
    lastCheckInDate: typeof rawRewards.lastCheckInDate === 'string' ? rawRewards.lastCheckInDate : null,
    totalCheckIns: !isNaN(safeCheckIns) ? safeCheckIns : 0,
    adFreeUntil: typeof rawRewards.adFreeUntil === 'string' ? rawRewards.adFreeUntil : null,
    rewardHistory: Array.isArray(rawRewards.rewardHistory) ? rawRewards.rewardHistory : [],
    rewardedAdsWatchedToday: !isNaN(safeAdsCount) ? safeAdsCount : 0,
    rewardedAdsWatchDate: typeof rawRewards.rewardedAdsWatchDate === 'string' ? rawRewards.rewardedAdsWatchDate : null,
    rewardedAdMilestoneClaimedDate: typeof rawRewards.rewardedAdMilestoneClaimedDate === 'string' ? rawRewards.rewardedAdMilestoneClaimedDate : null,
    lastRewardedAdCompletedAt: typeof rawRewards.lastRewardedAdCompletedAt === 'string' ? rawRewards.lastRewardedAdCompletedAt : null,
    schemaVersion: 1,
  };

  // 8. Saved Calculations Slice Normalization
  const rawSaved = cleanState.savedCalculations?.savedCalculations;
  cleanState.savedCalculations = {
    schemaVersion: 1,
    savedCalculations: Array.isArray(rawSaved)
      ? rawSaved.filter((c) => c && typeof c === 'object' && c.id)
      : [],
    ...(cleanState.savedCalculations || {}),
  };
  if (!Array.isArray(cleanState.savedCalculations.savedCalculations)) {
    cleanState.savedCalculations.savedCalculations = [];
  }

  return cleanState;
};

/**
 * Migration manifest object for redux-persist createMigrate.
 */
export const migrations = {
  0: (state) => {
    // Migration from unversioned/initial state -> Version 0
    return normalizePersistedState(state);
  },
  1: (state) => {
    // Version 1: Baseline robust normalization across all slices
    return normalizePersistedState(state);
  },
};

export default {
  PERSIST_VERSION,
  normalizePersistedState,
  migrations,
};

import { createSlice, createSelector } from '@reduxjs/toolkit';
import { isValidLoanProfile } from '../../features/loans/types/loanProfileTypes';

const initialState = {
  profiles: [],
  schemaVersion: 1,
};

const loanProfilesSlice = createSlice({
  name: 'loanProfiles',
  initialState,
  reducers: {
    addLoanProfile: (state, action) => {
      const newProfile = action.payload;
      if (!newProfile || !newProfile.id) return;

      const isFirstLoan = state.profiles.filter((p) => p.status === 'active').length === 0;
      const shouldBePrimary = newProfile.isPrimary || isFirstLoan;

      if (shouldBePrimary) {
        state.profiles.forEach((p) => {
          p.isPrimary = false;
        });
      }

      state.profiles.push({
        ...newProfile,
        isPrimary: shouldBePrimary,
      });
    },

    updateLoanProfile: (state, action) => {
      const updated = action.payload;
      if (!updated || !updated.id) return;

      const index = state.profiles.findIndex((p) => p.id === updated.id);
      if (index === -1) return;

      const wasPrimary = state.profiles[index].isPrimary;
      const isNowPrimary = Boolean(updated.isPrimary);

      if (isNowPrimary && !wasPrimary) {
        state.profiles.forEach((p) => {
          p.isPrimary = false;
        });
      }

      state.profiles[index] = {
        ...state.profiles[index],
        ...updated,
        isPrimary: isNowPrimary || (wasPrimary && !state.profiles.some((p) => p.id !== updated.id && p.isPrimary)),
        updatedAt: new Date().toISOString(),
      };
    },

    deleteLoanProfile: (state, action) => {
      const idToDelete = action.payload;
      const target = state.profiles.find((p) => p.id === idToDelete);
      if (!target) return;

      const wasPrimary = target.isPrimary;
      state.profiles = state.profiles.filter((p) => p.id !== idToDelete);

      if (wasPrimary && state.profiles.length > 0) {
        const firstActive = state.profiles.find((p) => p.status === 'active') || state.profiles[0];
        if (firstActive) {
          firstActive.isPrimary = true;
        }
      }
    },

    archiveLoanProfile: (state, action) => {
      const { id, archive = true } = typeof action.payload === 'object' ? action.payload : { id: action.payload, archive: true };
      const target = state.profiles.find((p) => p.id === id);
      if (!target) return;

      const newStatus = archive ? 'archived' : 'active';
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();

      if (archive && target.isPrimary) {
        target.isPrimary = false;
        const firstActive = state.profiles.find((p) => p.id !== id && p.status === 'active');
        if (firstActive) {
          firstActive.isPrimary = true;
        }
      }
    },

    setPrimaryLoan: (state, action) => {
      const targetId = action.payload;
      state.profiles.forEach((p) => {
        p.isPrimary = p.id === targetId && p.status === 'active';
      });
    },
  },
});

export const {
  addLoanProfile,
  updateLoanProfile,
  deleteLoanProfile,
  archiveLoanProfile,
  setPrimaryLoan,
} = loanProfilesSlice.actions;

// Base Input Selectors
const selectRawProfiles = (state) => state?.loanProfiles?.profiles;

export const selectLoanProfiles = createSelector(
  [selectRawProfiles],
  (profiles) => (Array.isArray(profiles) ? profiles : []).filter(isValidLoanProfile)
);

export const selectActiveLoanProfiles = createSelector(
  [selectLoanProfiles],
  (profiles) => profiles.filter((p) => p.status === 'active')
);

export const selectArchivedLoanProfiles = createSelector(
  [selectLoanProfiles],
  (profiles) => profiles.filter((p) => p.status === 'archived')
);

export const selectPrimaryLoan = createSelector(
  [selectActiveLoanProfiles],
  (activeProfiles) => activeProfiles.find((p) => p.isPrimary) || activeProfiles[0] || null
);

export const selectLoanProfileById = (state, id) => {
  const profiles = selectLoanProfiles(state);
  return profiles.find((p) => p.id === id) || null;
};

export const selectLoanCount = createSelector(
  [selectLoanProfiles],
  (profiles) => profiles.length
);

export const selectActiveLoanCount = createSelector(
  [selectActiveLoanProfiles],
  (activeProfiles) => activeProfiles.length
);

export const selectTotalOutstanding = createSelector(
  [selectActiveLoanProfiles],
  (activeProfiles) => activeProfiles.reduce((sum, p) => sum + (Number(p.currentOutstandingPrincipal) || 0), 0)
);

export const selectTotalMonthlyEMI = createSelector(
  [selectActiveLoanProfiles],
  (activeProfiles) => activeProfiles.reduce((sum, p) => sum + (Number(p.emiAmount) || 0), 0)
);

export default loanProfilesSlice.reducer;

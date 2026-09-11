import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  revisions: [],
};

const loanRateRevisionsSlice = createSlice({
  name: 'loanRateRevisions',
  initialState,
  reducers: {
    addRateRevision: (state, action) => {
      const newRevision = action.payload;
      if (!newRevision || !newRevision.loanId) return;
      // No artificial limit cap — revisions are naturally infrequent (e.g. 2-4 per year)
      state.revisions.unshift(newRevision);
    },

    updateRateRevision: (state, action) => {
      const { id, updates } = action.payload || {};
      if (!id || !updates) return;

      const index = state.revisions.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.revisions[index] = {
          ...state.revisions[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteRateRevision: (state, action) => {
      const revisionId = action.payload;
      state.revisions = state.revisions.filter((r) => r.id !== revisionId);
    },

    deleteRevisionsForLoan: (state, action) => {
      const loanId = action.payload;
      state.revisions = state.revisions.filter((r) => r.loanId !== loanId);
    },
  },
});

export const {
  addRateRevision,
  updateRateRevision,
  deleteRateRevision,
  deleteRevisionsForLoan,
} = loanRateRevisionsSlice.actions;

// Selectors
export const selectAllRateRevisions = (state) => state.loanRateRevisions?.revisions || [];

export const selectRateRevisionsByLoanId = createSelector(
  [selectAllRateRevisions, (state, loanId) => loanId],
  (revisions, loanId) =>
    revisions
      .filter((r) => r.loanId === loanId)
      .sort((a, b) => new Date(b.effectiveDate || 0) - new Date(a.effectiveDate || 0))
);

export const selectLatestRateRevision = createSelector(
  [selectRateRevisionsByLoanId],
  (revisions) => revisions[0] || null
);

export const selectRateRevisionById = createSelector(
  [selectAllRateRevisions, (state, revisionId) => revisionId],
  (revisions, revisionId) => revisions.find((r) => r.id === revisionId) || null
);

export default loanRateRevisionsSlice.reducer;

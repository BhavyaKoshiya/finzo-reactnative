import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  detailsByLoanId: {}, // { [loanId]: detailsObject }
};

const loanPrivateDetailsSlice = createSlice({
  name: 'loanPrivateDetails',
  initialState,
  reducers: {
    setLoanPrivateDetails: (state, action) => {
      const details = action.payload;
      if (!details || !details.loanId) return;

      state.detailsByLoanId[details.loanId] = {
        ...(state.detailsByLoanId[details.loanId] || {}),
        ...details,
        updatedAt: new Date().toISOString(),
      };
    },

    clearLoanPrivateDetails: (state, action) => {
      const loanId = action.payload;
      if (loanId && state.detailsByLoanId[loanId]) {
        delete state.detailsByLoanId[loanId];
      }
    },

    deletePrivateDetailsForLoan: (state, action) => {
      const loanId = action.payload;
      if (loanId && state.detailsByLoanId[loanId]) {
        delete state.detailsByLoanId[loanId];
      }
    },
  },
});

export const {
  setLoanPrivateDetails,
  clearLoanPrivateDetails,
  deletePrivateDetailsForLoan,
} = loanPrivateDetailsSlice.actions;

// Aliases for consistent naming across screens and services
export const deleteLoanPrivateDetails = deletePrivateDetailsForLoan;

// Selectors with defensive fallbacks against malformed state
export const selectAllPrivateDetails = (state) =>
  state.loanPrivateDetails?.detailsByLoanId || {};

export const selectPrivateDetailsByLoanId = createSelector(
  [selectAllPrivateDetails, (state, loanId) => loanId],
  (detailsMap, loanId) => (detailsMap && typeof detailsMap === 'object' ? detailsMap[loanId] || null : null)
);

export default loanPrivateDetailsSlice.reducer;

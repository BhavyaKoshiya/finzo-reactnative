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

// Selectors
export const selectAllPrivateDetails = (state) => state.loanPrivateDetails?.detailsByLoanId || {};

export const selectPrivateDetailsByLoanId = createSelector(
  [selectAllPrivateDetails, (state, loanId) => loanId],
  (detailsMap, loanId) => detailsMap[loanId] || null
);

export default loanPrivateDetailsSlice.reducer;

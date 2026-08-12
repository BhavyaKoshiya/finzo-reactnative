import { createSlice, createSelector } from '@reduxjs/toolkit';
import { isValidLoanPayment } from '../../features/loans/types/loanPaymentTypes';
import { recalculateLoanBalanceFromPayments } from '../../features/loans/utils/paymentBalanceUtils';
import { updateLoanProfile } from './loanProfilesSlice';

const initialState = {
  payments: [],
  schemaVersion: 1,
};

const loanPaymentsSlice = createSlice({
  name: 'loanPayments',
  initialState,
  reducers: {
    addPayment: (state, action) => {
      const payment = action.payload;
      if (!payment || !payment.id || !payment.loanId) return;

      state.payments.unshift({
        ...payment,
        createdAt: payment.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },

    updatePayment: (state, action) => {
      const updated = action.payload;
      if (!updated || !updated.id) return;

      const index = state.payments.findIndex((p) => p.id === updated.id);
      if (index === -1) return;

      state.payments[index] = {
        ...state.payments[index],
        ...updated,
        updatedAt: new Date().toISOString(),
      };
    },

    deletePayment: (state, action) => {
      const idToDelete = action.payload;
      state.payments = state.payments.filter((p) => p.id !== idToDelete);
    },

    deletePaymentsForLoan: (state, action) => {
      const loanId = action.payload;
      if (!loanId) return;
      state.payments = state.payments.filter((p) => p.loanId !== loanId);
    },

    updateLoanPaymentsForLoan: (state, action) => {
      const { loanId, payments } = action.payload || {};
      if (!loanId || !Array.isArray(payments)) return;

      const otherPayments = state.payments.filter((p) => p.loanId !== loanId);
      state.payments = [...otherPayments, ...payments];
    },
  },
});

export const {
  addPayment,
  updatePayment,
  deletePayment,
  deletePaymentsForLoan,
  updateLoanPaymentsForLoan,
} = loanPaymentsSlice.actions;

/**
 * Thunk action to delete a payment and recalculate the loan's current estimated balance and remaining payment timeline.
 */
export const deleteLoanPaymentWithRecalculation = ({ paymentId, loan }) => (dispatch, getState) => {
  if (!paymentId || !loan) return;

  const state = getState();
  const allPayments = state.loanPayments?.payments || [];
  const targetPayment = allPayments.find((p) => p.id === paymentId);
  if (!targetPayment) return;

  const remainingPayments = allPayments.filter((p) => p.id !== paymentId && p.loanId === loan.id);

  // Recalculate remaining payments and final balance
  const { finalEstimatedBalance, updatedPayments } = recalculateLoanBalanceFromPayments({
    loan,
    payments: remainingPayments,
  });

  // 1. Remove target payment
  dispatch(deletePayment(paymentId));

  // 2. Update remaining payment snapshots for this loan
  if (updatedPayments.length > 0) {
    dispatch(updateLoanPaymentsForLoan({ loanId: loan.id, payments: updatedPayments }));
  }

  // 3. Update loan profile's current outstanding balance
  dispatch(
    updateLoanProfile({
      id: loan.id,
      currentOutstandingPrincipal: finalEstimatedBalance,
    })
  );
};

// Base Input Selectors
const selectRawPayments = (state) => state?.loanPayments?.payments;

export const selectLoanPayments = createSelector(
  [selectRawPayments],
  (payments) => (Array.isArray(payments) ? payments : []).filter(isValidLoanPayment)
);

export const selectLoanPaymentById = (state, id) => {
  const payments = selectLoanPayments(state);
  return payments.find((p) => p.id === id) || null;
};

export const selectPaymentsForLoan = createSelector(
  [selectLoanPayments, (state, loanId) => loanId],
  (payments, loanId) => {
    if (!loanId) return [];
    return payments
      .filter((p) => p.loanId === loanId)
      .sort((a, b) => {
        const dateDiff = new Date(b.paymentDate) - new Date(a.paymentDate);
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }
);

export const selectLatestPaymentForLoan = createSelector(
  [selectPaymentsForLoan],
  (loanPayments) => loanPayments[0] || null
);

export const selectTotalPaymentsForLoan = createSelector(
  [selectPaymentsForLoan],
  (loanPayments) => loanPayments.length
);

export const selectTotalPaidForLoan = createSelector(
  [selectPaymentsForLoan],
  (loanPayments) => loanPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
);

export const selectPaymentsByType = createSelector(
  [selectPaymentsForLoan, (state, loanId, type) => type],
  (loanPayments, type) => loanPayments.filter((p) => p.paymentType === type)
);

export const selectPaymentsInDateRange = createSelector(
  [selectPaymentsForLoan, (state, loanId, startDate, endDate) => ({ startDate, endDate })],
  (loanPayments, { startDate, endDate }) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000);
    return loanPayments.filter((p) => {
      const pDate = new Date(p.paymentDate);
      return pDate >= start && pDate <= end;
    });
  }
);

export default loanPaymentsSlice.reducer;

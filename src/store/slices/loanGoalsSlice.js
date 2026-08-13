import { createSlice, createSelector } from '@reduxjs/toolkit';
import { GOAL_STATUS, MAX_ACTIVE_GOALS_PER_LOAN } from '../../features/loans/types/loanGoalTypes';

const initialState = {
  goals: [],
};

const loanGoalsSlice = createSlice({
  name: 'loanGoals',
  initialState,
  reducers: {
    addLoanGoal: (state, action) => {
      const newGoal = action.payload;
      if (!newGoal || !newGoal.loanId) return;

      const activeForLoan = state.goals.filter(
        (g) => g.loanId === newGoal.loanId && g.status === GOAL_STATUS.ACTIVE
      );

      if (activeForLoan.length >= MAX_ACTIVE_GOALS_PER_LOAN) {
        return; // Max 5 active goals per loan guard
      }

      state.goals.unshift(newGoal);
    },

    updateLoanGoal: (state, action) => {
      const { id, updates } = action.payload || {};
      if (!id || !updates) return;

      const index = state.goals.findIndex((g) => g.id === id);
      if (index !== -1) {
        state.goals[index] = {
          ...state.goals[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteLoanGoal: (state, action) => {
      const goalId = action.payload;
      state.goals = state.goals.filter((g) => g.id !== goalId);
    },

    pauseLoanGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find((g) => g.id === goalId);
      if (goal) {
        goal.status = GOAL_STATUS.PAUSED;
        goal.updatedAt = new Date().toISOString();
      }
    },

    resumeLoanGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find((g) => g.id === goalId);
      if (goal) {
        goal.status = GOAL_STATUS.ACTIVE;
        goal.updatedAt = new Date().toISOString();
      }
    },

    completeLoanGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find((g) => g.id === goalId);
      if (goal) {
        goal.status = GOAL_STATUS.COMPLETED;
        goal.updatedAt = new Date().toISOString();
      }
    },

    deleteGoalsForLoan: (state, action) => {
      const loanId = action.payload;
      state.goals = state.goals.filter((g) => g.loanId !== loanId);
    },
  },
});

export const {
  addLoanGoal,
  updateLoanGoal,
  deleteLoanGoal,
  pauseLoanGoal,
  resumeLoanGoal,
  completeLoanGoal,
  deleteGoalsForLoan,
} = loanGoalsSlice.actions;

// Selectors
export const selectAllLoanGoals = (state) => state.loanGoals?.goals || [];

export const selectLoanGoalsByLoanId = createSelector(
  [selectAllLoanGoals, (state, loanId) => loanId],
  (goals, loanId) => goals.filter((g) => g.loanId === loanId)
);

export const selectActiveLoanGoalsByLoanId = createSelector(
  [selectAllLoanGoals, (state, loanId) => loanId],
  (goals, loanId) => goals.filter((g) => g.loanId === loanId && g.status === GOAL_STATUS.ACTIVE)
);

export const selectCompletedLoanGoalsByLoanId = createSelector(
  [selectAllLoanGoals, (state, loanId) => loanId],
  (goals, loanId) => goals.filter((g) => g.loanId === loanId && g.status === GOAL_STATUS.COMPLETED)
);

export const selectLoanGoalById = createSelector(
  [selectAllLoanGoals, (state, goalId) => goalId],
  (goals, goalId) => goals.find((g) => g.id === goalId)
);

export default loanGoalsSlice.reducer;

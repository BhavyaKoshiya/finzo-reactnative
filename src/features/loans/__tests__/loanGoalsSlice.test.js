import loanGoalsReducer, {
  addLoanGoal,
  updateLoanGoal,
  deleteLoanGoal,
  pauseLoanGoal,
  resumeLoanGoal,
  completeLoanGoal,
  deleteGoalsForLoan,
} from '../../../store/slices/loanGoalsSlice';
import { GOAL_TYPES, GOAL_STATUS } from '../types/loanGoalTypes';

describe('loanGoalsSlice Redux Reducer & Actions', () => {
  const initialState = { goals: [] };

  const sampleGoal1 = {
    id: 'g1',
    loanId: 'loan_1',
    type: GOAL_TYPES.EXTRA_MONTHLY_PAYMENT,
    title: 'Extra ₹5K',
    status: GOAL_STATUS.ACTIVE,
  };

  const sampleGoal2 = {
    id: 'g2',
    loanId: 'loan_1',
    type: GOAL_TYPES.PREPAYMENT_TARGET,
    title: 'Prepay ₹1L',
    status: GOAL_STATUS.ACTIVE,
  };

  const loanBGoal = {
    id: 'gb1',
    loanId: 'loan_2',
    type: GOAL_TYPES.EXTRA_MONTHLY_PAYMENT,
    title: 'Loan B Goal',
    status: GOAL_STATUS.ACTIVE,
  };

  it('adds a new loan goal', () => {
    const nextState = loanGoalsReducer(initialState, addLoanGoal(sampleGoal1));
    expect(nextState.goals.length).toBe(1);
    expect(nextState.goals[0].id).toBe('g1');
  });

  it('enforces maximum 5 active goals per loan limit', () => {
    let state = initialState;
    for (let i = 1; i <= 5; i++) {
      state = loanGoalsReducer(
        state,
        addLoanGoal({
          id: `g_active_${i}`,
          loanId: 'loan_1',
          status: GOAL_STATUS.ACTIVE,
        })
      );
    }
    expect(state.goals.length).toBe(5);

    // Attempting to add 6th active goal must be rejected
    const state6 = loanGoalsReducer(
      state,
      addLoanGoal({
        id: 'g_active_6',
        loanId: 'loan_1',
        status: GOAL_STATUS.ACTIVE,
      })
    );
    expect(state6.goals.length).toBe(5);
  });

  it('pauses and resumes a loan goal', () => {
    let state = loanGoalsReducer(initialState, addLoanGoal(sampleGoal1));
    expect(state.goals[0].status).toBe(GOAL_STATUS.ACTIVE);

    state = loanGoalsReducer(state, pauseLoanGoal('g1'));
    expect(state.goals[0].status).toBe(GOAL_STATUS.PAUSED);

    state = loanGoalsReducer(state, resumeLoanGoal('g1'));
    expect(state.goals[0].status).toBe(GOAL_STATUS.ACTIVE);
  });

  it('marks a loan goal as completed', () => {
    let state = loanGoalsReducer(initialState, addLoanGoal(sampleGoal1));
    state = loanGoalsReducer(state, completeLoanGoal('g1'));
    expect(state.goals[0].status).toBe(GOAL_STATUS.COMPLETED);
  });

  it('cascade deletes goals for a specific loan when loan is deleted', () => {
    let state = loanGoalsReducer(initialState, addLoanGoal(sampleGoal1));
    state = loanGoalsReducer(state, addLoanGoal(sampleGoal2));
    state = loanGoalsReducer(state, addLoanGoal(loanBGoal));

    expect(state.goals.length).toBe(3);

    state = loanGoalsReducer(state, deleteGoalsForLoan('loan_1'));
    expect(state.goals.length).toBe(1);
    expect(state.goals[0].loanId).toBe('loan_2');
  });
});

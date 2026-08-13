import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import savedCalculationsReducer from './slices/savedCalculationsSlice';
import rewardsReducer from './slices/rewardsSlice';
import loanProfilesReducer from './slices/loanProfilesSlice';
import loanPaymentsReducer from './slices/loanPaymentsSlice';
import loanGoalsReducer from './slices/loanGoalsSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  savedCalculations: savedCalculationsReducer,
  rewards: rewardsReducer,
  loanProfiles: loanProfilesReducer,
  loanPayments: loanPaymentsReducer,
  loanGoals: loanGoalsReducer,
});

export default rootReducer;

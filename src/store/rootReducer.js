import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import savedCalculationsReducer from './slices/savedCalculationsSlice';
import rewardsReducer from './slices/rewardsSlice';
import loanProfilesReducer from './slices/loanProfilesSlice';
import loanPaymentsReducer from './slices/loanPaymentsSlice';
import loanGoalsReducer from './slices/loanGoalsSlice';
import loanPrivateDetailsReducer from './slices/loanPrivateDetailsSlice';
import loanNotesReducer from './slices/loanNotesSlice';
import loanRateRevisionsReducer from './slices/loanRateRevisionsSlice';
import connectivityReducer from './slices/connectivitySlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  savedCalculations: savedCalculationsReducer,
  rewards: rewardsReducer,
  loanProfiles: loanProfilesReducer,
  loanPayments: loanPaymentsReducer,
  loanGoals: loanGoalsReducer,
  loanPrivateDetails: loanPrivateDetailsReducer,
  loanNotes: loanNotesReducer,
  loanRateRevisions: loanRateRevisionsReducer,
  connectivity: connectivityReducer,
});

export default rootReducer;


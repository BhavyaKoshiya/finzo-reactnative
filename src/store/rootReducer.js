import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import savedCalculationsReducer from './slices/savedCalculationsSlice';
import rewardsReducer from './slices/rewardsSlice';
import loanProfilesReducer from './slices/loanProfilesSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  savedCalculations: savedCalculationsReducer,
  rewards: rewardsReducer,
  loanProfiles: loanProfilesReducer,
});

export default rootReducer;

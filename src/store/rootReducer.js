import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import savedCalculationsReducer from './slices/savedCalculationsSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  savedCalculations: savedCalculationsReducer,
});

export default rootReducer;

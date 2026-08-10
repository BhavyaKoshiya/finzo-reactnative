import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
});

export default rootReducer;

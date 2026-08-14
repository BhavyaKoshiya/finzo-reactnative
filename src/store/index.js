import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './rootReducer';
import { migrations, PERSIST_VERSION } from './migrations';

const persistConfig = {
  key: 'finzo_root',
  version: PERSIST_VERSION,
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: false }),
  whitelist: [
    'settings',
    'savedCalculations',
    'rewards',
    'loanProfiles',
    'loanPayments',
    'loanGoals',
    'loanPrivateDetails',
    'loanNotes',
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default {
  store,
  persistor,
};

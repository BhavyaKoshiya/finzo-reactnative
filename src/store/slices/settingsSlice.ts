import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type AppThemeMode = 'system' | 'light' | 'dark';

export interface SettingsState {
  themeMode: AppThemeMode;
  currency: string;
  locale: string;
}

const initialState: SettingsState = {
  themeMode: 'system',
  currency: 'INR',
  locale: 'en-IN',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<AppThemeMode>) => {
      state.themeMode = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const { setThemeMode, setCurrency, setLocale, resetSettings } =
  settingsSlice.actions;

export const selectSettings = (state: RootState): SettingsState =>
  state.settings;
export const selectThemeMode = (state: RootState): AppThemeMode =>
  state.settings.themeMode;
export const selectCurrency = (state: RootState): string =>
  state.settings.currency;
export const selectLocale = (state: RootState): string => state.settings.locale;

export default settingsSlice.reducer;

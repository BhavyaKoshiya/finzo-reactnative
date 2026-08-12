import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  themeMode: 'system',
  currency: 'INR',
  locale: 'en-IN',
  loanRemindersEnabled: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
    setLoanRemindersEnabled: (state, action) => {
      state.loanRemindersEnabled = Boolean(action.payload);
    },
    resetSettings: () => initialState,
  },
});

export const { setThemeMode, setCurrency, setLocale, setLoanRemindersEnabled, resetSettings } =
  settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeMode = (state) => state.settings.themeMode;
export const selectCurrency = (state) => state.settings.currency;
export const selectLocale = (state) => state.settings.locale;
export const selectLoanRemindersEnabled = (state) => state.settings?.loanRemindersEnabled ?? true;

export default settingsSlice.reducer;

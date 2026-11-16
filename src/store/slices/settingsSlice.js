import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  themeMode: 'system',
  currency: 'INR',
  /** False only on a fresh install, until the currency is detected on first launch */
  currencySetupDone: false,
  /** The one-time "Amounts shown in …" card on Home */
  currencyNoticeDismissed: false,
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
    /** First-launch detection result; never overrides an existing setup */
    applyDetectedCurrency: (state, action) => {
      if (state.currencySetupDone) return;
      state.currency = action.payload;
      state.currencySetupDone = true;
    },
    /** The user picked a currency, which also answers the Home card */
    setCurrency: (state, action) => {
      state.currency = action.payload;
      state.currencySetupDone = true;
      state.currencyNoticeDismissed = true;
    },
    dismissCurrencyNotice: (state) => {
      state.currencyNoticeDismissed = true;
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
    setLoanRemindersEnabled: (state, action) => {
      state.loanRemindersEnabled = Boolean(action.payload);
    },
    // Keeps the currency: existing loans were entered in it, and re-running
    // first-launch detection could switch it under them
    resetSettings: (state) => ({
      ...initialState,
      currency: state.currency,
      currencySetupDone: true,
      currencyNoticeDismissed: true,
    }),
  },
});

export const {
  setThemeMode,
  applyDetectedCurrency,
  setCurrency,
  dismissCurrencyNotice,
  setLocale,
  setLoanRemindersEnabled,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeMode = (state) => state.settings.themeMode;
export const selectCurrency = (state) => state.settings?.currency || 'INR';
export const selectCurrencySetupDone = (state) => state.settings?.currencySetupDone !== false;
export const selectCurrencyNoticeDismissed = (state) => state.settings?.currencyNoticeDismissed !== false;
export const selectLocale = (state) => state.settings.locale;
export const selectLoanRemindersEnabled = (state) => state.settings?.loanRemindersEnabled ?? true;

export default settingsSlice.reducer;

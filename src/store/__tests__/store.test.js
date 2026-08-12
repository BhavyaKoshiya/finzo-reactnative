import settingsReducer, {
  setThemeMode,
  setCurrency,
  setLocale,
  setLoanRemindersEnabled,
  resetSettings,
  selectThemeMode,
  selectCurrency,
  selectLocale,
  selectLoanRemindersEnabled,
} from '../slices/settingsSlice';
import rootReducer from '../rootReducer';

describe('settingsSlice', () => {
  const initialState = {
    themeMode: 'system',
    currency: 'INR',
    locale: 'en-IN',
    loanRemindersEnabled: true,
  };

  it('should return initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState,
    );
  });

  it('should handle setThemeMode', () => {
    const actual = settingsReducer(initialState, setThemeMode('dark'));
    expect(actual.themeMode).toEqual('dark');
  });

  it('should handle setCurrency', () => {
    const actual = settingsReducer(initialState, setCurrency('USD'));
    expect(actual.currency).toEqual('USD');
  });

  it('should handle setLocale', () => {
    const actual = settingsReducer(initialState, setLocale('en-US'));
    expect(actual.locale).toEqual('en-US');
  });

  it('should handle setLoanRemindersEnabled', () => {
    const actual = settingsReducer(initialState, setLoanRemindersEnabled(false));
    expect(actual.loanRemindersEnabled).toEqual(false);
  });

  it('should handle resetSettings', () => {
    const modifiedState = {
      themeMode: 'dark',
      currency: 'USD',
      locale: 'en-US',
      loanRemindersEnabled: false,
    };
    const actual = settingsReducer(modifiedState, resetSettings());
    expect(actual).toEqual(initialState);
  });

  it('selectors should return correct values', () => {
    const rootState = {
      settings: {
        themeMode: 'light',
        currency: 'INR',
        locale: 'en-IN',
        loanRemindersEnabled: true,
      },
    };
    expect(selectThemeMode(rootState)).toEqual('light');
    expect(selectCurrency(rootState)).toEqual('INR');
    expect(selectLocale(rootState)).toEqual('en-IN');
    expect(selectLoanRemindersEnabled(rootState)).toEqual(true);
  });
});

describe('rootReducer', () => {
  it('should combine settings slice', () => {
    const state = rootReducer(undefined, { type: 'unknown' });
    expect(state).toHaveProperty('settings');
    expect(state.settings.currency).toBe('INR');
  });
});

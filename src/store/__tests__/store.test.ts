import settingsReducer, {
  setThemeMode,
  setCurrency,
  setLocale,
  resetSettings,
  selectThemeMode,
  selectCurrency,
  selectLocale,
} from '../slices/settingsSlice';
import rootReducer from '../rootReducer';

describe('settingsSlice', () => {
  const initialState = {
    themeMode: 'system' as const,
    currency: 'INR',
    locale: 'en-IN',
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

  it('should handle resetSettings', () => {
    const modifiedState = {
      themeMode: 'dark' as const,
      currency: 'USD',
      locale: 'en-US',
    };
    const actual = settingsReducer(modifiedState, resetSettings());
    expect(actual).toEqual(initialState);
  });

  it('selectors should return correct values', () => {
    const rootState = {
      settings: {
        themeMode: 'light' as const,
        currency: 'INR',
        locale: 'en-IN',
      },
    };
    expect(selectThemeMode(rootState as any)).toEqual('light');
    expect(selectCurrency(rootState as any)).toEqual('INR');
    expect(selectLocale(rootState as any)).toEqual('en-IN');
  });
});

describe('rootReducer', () => {
  it('should combine settings slice', () => {
    const state = rootReducer(undefined, { type: 'unknown' });
    expect(state).toHaveProperty('settings');
    expect(state.settings.currency).toBe('INR');
  });
});

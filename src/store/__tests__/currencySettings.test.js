import settingsReducer, {
  applyDetectedCurrency,
  setCurrency,
  dismissCurrencyNotice,
  selectCurrencySetupDone,
  selectCurrencyNoticeDismissed,
} from '../slices/settingsSlice';
import { migrations, PERSIST_VERSION } from '../migrations';

const freshInstall = settingsReducer(undefined, { type: 'init' });

describe('currency settings', () => {
  test('a fresh install starts unconfigured, with the notice card pending', () => {
    expect(freshInstall.currencySetupDone).toBe(false);
    expect(freshInstall.currencyNoticeDismissed).toBe(false);
  });

  test('detection applies once and never overrides an existing setup', () => {
    const detected = settingsReducer(freshInstall, applyDetectedCurrency('AED'));
    expect(detected.currency).toBe('AED');
    expect(detected.currencySetupDone).toBe(true);
    expect(detected.currencyNoticeDismissed).toBe(false);

    const again = settingsReducer(detected, applyDetectedCurrency('USD'));
    expect(again.currency).toBe('AED');
  });

  test('choosing a currency also answers the notice card', () => {
    const chosen = settingsReducer(freshInstall, setCurrency('GBP'));
    expect(chosen).toMatchObject({ currency: 'GBP', currencySetupDone: true, currencyNoticeDismissed: true });
  });

  test('dismissing the card keeps the currency', () => {
    const dismissed = settingsReducer(settingsReducer(freshInstall, applyDetectedCurrency('USD')), dismissCurrencyNotice());
    expect(dismissed).toMatchObject({ currency: 'USD', currencyNoticeDismissed: true });
  });

  test('selectors treat missing fields (older persisted state) as set up', () => {
    const legacy = { settings: { currency: 'INR' } };
    expect(selectCurrencySetupDone(legacy)).toBe(true);
    expect(selectCurrencyNoticeDismissed(legacy)).toBe(true);
  });
});

describe('persist migration to multi-currency', () => {
  test('installs from before multi-currency keep INR and skip detection and the card', () => {
    expect(PERSIST_VERSION).toBe(3);
    const upgraded = migrations[3]({ settings: { themeMode: 'dark', currency: 'INR' }, _persist: { version: 2 } });
    expect(upgraded.settings).toMatchObject({
      themeMode: 'dark',
      currency: 'INR',
      currencySetupDone: true,
      currencyNoticeDismissed: true,
    });
  });
});

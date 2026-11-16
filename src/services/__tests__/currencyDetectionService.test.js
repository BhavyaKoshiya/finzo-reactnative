import { resolveCountry, resolveCurrency } from '../currencyDetectionService';

describe('first-launch currency detection', () => {
  test('India is detected from the time zone even with an English (US) phone', () => {
    expect(resolveCurrency({ timeZone: 'Asia/Kolkata', localeRegion: 'US' })).toBe('INR');
    expect(resolveCurrency({ timeZone: 'Asia/Calcutta', localeRegion: 'US' })).toBe('INR');
  });

  test('Gulf time zones map to their currencies', () => {
    expect(resolveCurrency({ timeZone: 'Asia/Dubai', localeRegion: 'IN' })).toBe('AED');
    expect(resolveCurrency({ timeZone: 'Asia/Riyadh' })).toBe('SAR');
  });

  test('ambiguous time zones fall through to the SIM, then the network country', () => {
    expect(resolveCurrency({ timeZone: 'America/Toronto', simCountry: 'ca', localeRegion: 'US' })).toBe('CAD');
    expect(resolveCurrency({ timeZone: 'America/New_York', simCountry: '', networkCountry: 'us' })).toBe('USD');
    expect(resolveCurrency({ timeZone: 'Europe/Berlin', simCountry: 'de' })).toBe('EUR');
  });

  test('language region is the last signal', () => {
    expect(resolveCurrency({ timeZone: 'Etc/UTC', localeRegion: 'GB' })).toBe('GBP');
    expect(resolveCountry({ timeZone: 'Australia/Sydney' })).toBe('AU');
  });

  test('unknown or unsupported countries fall back to USD', () => {
    expect(resolveCurrency({})).toBe('USD');
    expect(resolveCurrency({ simCountry: 'jp' })).toBe('USD');
    expect(resolveCurrency({ simCountry: 'not-a-country' })).toBe('USD');
  });
});

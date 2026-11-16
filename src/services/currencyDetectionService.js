import { NativeModules } from 'react-native';
import { FALLBACK_CURRENCY } from '../calculations/core/currency';

/**
 * Picks the currency for a fresh install, once, on first launch.
 *
 * Signals, strongest first:
 * 1. Time zone — set automatically from the mobile network, so a phone in India reports
 *    Asia/Kolkata even when its language is English (United States).
 * 2. SIM country, then mobile network country (Android, no permission needed).
 * 3. Region of the phone's language setting.
 * Unknown countries fall back to USD. Nothing here leaves the device.
 */

/** Time zones that identify one country unambiguously. */
const TIME_ZONE_COUNTRIES = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Muscat': 'OM',
  'Asia/Bahrain': 'BH',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Kathmandu': 'NP',
  'Asia/Katmandu': 'NP',
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Colombo': 'LK',
  'Europe/London': 'GB',
  'Africa/Johannesburg': 'ZA',
  'Pacific/Auckland': 'NZ',
};

const EURO_COUNTRIES = [
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV',
  'MT', 'NL', 'PT', 'SI', 'SK',
];

const COUNTRY_CURRENCIES = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  OM: 'OMR',
  BH: 'BHD',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  SG: 'SGD',
  MY: 'MYR',
  ZA: 'ZAR',
  NP: 'NPR',
  BD: 'BDT',
  PK: 'PKR',
  LK: 'LKR',
  ...EURO_COUNTRIES.reduce((map, country) => ({ ...map, [country]: 'EUR' }), {}),
};

const toCountryCode = (value) => {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(code) ? code : null;
};

const countryFromTimeZone = (timeZone) => {
  if (typeof timeZone !== 'string') return null;
  if (TIME_ZONE_COUNTRIES[timeZone]) return TIME_ZONE_COUNTRIES[timeZone];
  return timeZone.startsWith('Australia/') ? 'AU' : null;
};

/**
 * @param {{ timeZone?: string, simCountry?: string, networkCountry?: string, localeRegion?: string }} signals
 * @returns {string|null} ISO 3166 country code, or null when no signal identifies one
 */
export const resolveCountry = ({ timeZone, simCountry, networkCountry, localeRegion } = {}) =>
  countryFromTimeZone(timeZone) ||
  toCountryCode(simCountry) ||
  toCountryCode(networkCountry) ||
  toCountryCode(localeRegion);

/**
 * @param {Object} signals - see resolveCountry
 * @returns {string} ISO 4217 currency code
 */
export const resolveCurrency = (signals) => COUNTRY_CURRENCIES[resolveCountry(signals)] || FALLBACK_CURRENCY;

/** Reads the detection signals from the device; any of them may be missing. */
export const readDeviceSignals = () => {
  const signals = {};

  try {
    const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
    signals.timeZone = timeZone;
    signals.localeRegion = /-([A-Za-z]{2})(?:-|$)/.exec(locale || '')?.[1];
  } catch (_err) {
    // Intl unavailable: rely on the other signals
  }

  try {
    const deviceRegion = NativeModules.DeviceRegion;
    const constants = deviceRegion?.getConstants?.() ?? deviceRegion ?? {};
    signals.simCountry = constants.simCountry;
    signals.networkCountry = constants.networkCountry;
  } catch (_err) {
    // Native module unavailable (e.g. iOS): rely on the other signals
  }

  return signals;
};

/** @returns {string} The currency for this device */
export const detectDeviceCurrency = () => resolveCurrency(readDeviceSignals());

export default {
  resolveCountry,
  resolveCurrency,
  readDeviceSignals,
  detectDeviceCurrency,
};

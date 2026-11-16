import {
  formatMoney,
  formatMoneyCompact,
  getCurrencyMeta,
  CURRENCIES,
} from '../currency';

describe('formatMoney across currencies', () => {
  test('INR keeps Indian grouping', () => {
    expect(formatMoney(1000000, { currency: 'INR' })).toBe('₹10,00,000');
    expect(formatMoney(1234.5, { currency: 'INR' })).toBe('₹1,234.50');
  });

  test('other currencies use international grouping and their symbol', () => {
    expect(formatMoney(1000000, { currency: 'USD' })).toBe('$1,000,000');
    expect(formatMoney(1234.5, { currency: 'GBP' })).toBe('£1,234.50');
    expect(formatMoney(250000, { currency: 'AED' })).toBe('AED 250,000');
    expect(formatMoney(99.99, { currency: 'EUR' })).toBe('€99.99');
  });

  test('negative amounts and amounts without symbol', () => {
    expect(formatMoney(-1500, { currency: 'USD' })).toBe('-$1,500');
    expect(formatMoney(1500000, { currency: 'USD', includeSymbol: false })).toBe('1,500,000');
    expect(formatMoney(-0.001, { currency: 'USD' })).toBe('$0');
  });

  test('unknown or missing currency falls back to INR', () => {
    expect(formatMoney(1000, { currency: 'XYZ' })).toBe('₹1,000');
    expect(formatMoney(1000)).toBe('₹1,000');
    expect(getCurrencyMeta(undefined).code).toBe('INR');
  });
});

describe('formatMoneyCompact across currencies', () => {
  test('lakh notation for INR', () => {
    expect(formatMoneyCompact(1500000, 'INR')).toBe('₹15 L');
    expect(formatMoneyCompact(25000000, 'INR')).toBe('₹2.5 Cr');
  });

  test('K / M / B for other currencies', () => {
    expect(formatMoneyCompact(25000, 'USD')).toBe('$25 K');
    expect(formatMoneyCompact(1500000, 'USD')).toBe('$1.5 M');
    expect(formatMoneyCompact(2000000000, 'EUR')).toBe('€2 B');
    expect(formatMoneyCompact(999, 'GBP')).toBe('£999');
  });
});

test('currency codes are unique', () => {
  const codes = CURRENCIES.map((c) => c.code);
  expect(new Set(codes).size).toBe(codes.length);
});

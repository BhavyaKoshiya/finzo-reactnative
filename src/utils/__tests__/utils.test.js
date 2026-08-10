import { formatDisplayDate, formatShortDate, addMonths, calculateDateDifference } from '../dateUtils';
import { formatINR, parseINRInput, formatPercentage } from '../numberUtils';

describe('dateUtils', () => {
  it('formats display date correctly', () => {
    const d = new Date(2026, 7, 10);
    expect(formatDisplayDate(d, 'yyyy-MM-dd')).toBe('2026-08-10');
  });

  it('formats short date correctly', () => {
    const d = new Date(2026, 7, 10);
    expect(formatShortDate(d)).toBe('10/08/2026');
  });

  it('adds months correctly', () => {
    const d = new Date(2026, 0, 15);
    const added = addMonths(d, 6);
    expect(added.getMonth()).toBe(6);
  });

  it('calculates date difference correctly', () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 11, 1);
    expect(calculateDateDifference(start, end)).toBe(11);
  });
});

describe('numberUtils', () => {
  it('formats INR correctly in Lakhs notation', () => {
    expect(formatINR(1000000, true)).toBe('₹10,00,000');
    expect(formatINR(50000, false)).toBe('50,000');
  });

  it('parses raw input strings correctly', () => {
    expect(parseINRInput('₹10,00,000')).toBe('1000000');
    expect(parseINRInput('12.5.4')).toBe('12.54');
  });

  it('formats percentage correctly', () => {
    expect(formatPercentage(8.5, 1)).toBe('8.5%');
  });
});

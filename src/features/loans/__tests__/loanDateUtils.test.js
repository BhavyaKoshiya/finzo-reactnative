import { getNextEmiInfo } from '../utils/loanDateUtils';

describe('Loan Date Utilities', () => {
  const refDate = new Date('2026-08-15T10:00:00Z');

  test('21. Calculates future EMI correctly', () => {
    const info = getNextEmiInfo('2026-08-20', refDate);
    expect(info.isUpcoming).toBe(true);
    expect(info.isDueToday).toBe(false);
    expect(info.isPastDue).toBe(false);
    expect(info.daysUntilPayment).toBe(5);
  });

  test('22. Identifies EMI due today', () => {
    const info = getNextEmiInfo('2026-08-15', refDate);
    expect(info.isDueToday).toBe(true);
    expect(info.isUpcoming).toBe(false);
    expect(info.isPastDue).toBe(false);
    expect(info.daysUntilPayment).toBe(0);
  });

  test('23. Identifies past due EMI', () => {
    const info = getNextEmiInfo('2026-08-10', refDate);
    expect(info.isPastDue).toBe(true);
    expect(info.isDueToday).toBe(false);
    expect(info.isUpcoming).toBe(false);
    expect(info.daysUntilPayment).toBe(-5);
  });

  test('24. Returns exact days until EMI payment', () => {
    const info = getNextEmiInfo('2026-08-25', refDate);
    expect(info.daysUntilPayment).toBe(10);
  });
});

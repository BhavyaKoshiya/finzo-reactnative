import { calculateRD } from '../index';

describe('RD Calculation Engine', () => {
  it('should calculate correct RD returns with quarterly compounding (Reference: ₹5,000/mo @ 7% for 12 months)', () => {
    const result = calculateRD(5000, 7, 12);
    expect(result.success).toBe(true);
    expect(result.data.totalDeposited).toBe(60000);
    expect(result.data.maturityAmount).toBeCloseTo(62310.66, 1);
    expect(result.data.interestEarned).toBeCloseTo(2310.66, 1);
  });

  it('should handle zero interest rate', () => {
    const result = calculateRD(2000, 0, 6);
    expect(result.success).toBe(true);
    expect(result.data.totalDeposited).toBe(12000);
    expect(result.data.maturityAmount).toBe(12000);
    expect(result.data.interestEarned).toBe(0);
  });
});

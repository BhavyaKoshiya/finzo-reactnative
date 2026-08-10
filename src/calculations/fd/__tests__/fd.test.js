import { calculateFD } from '../index';

describe('FD Calculation Engine', () => {
  it('should calculate correct FD returns with quarterly compounding (Reference: ₹1 Lakh @ 7.5% for 5 years)', () => {
    const result = calculateFD(100000, 7.5, 5, 'quarterly');
    expect(result.success).toBe(true);
    expect(result.data.principal).toBe(100000);
    expect(result.data.maturityAmount).toBeCloseTo(144994.8, 1);
    expect(result.data.interestEarned).toBeCloseTo(44994.8, 1);
  });

  it('should support monthly and yearly compounding frequencies', () => {
    const resMonthly = calculateFD(100000, 6, 1, 'monthly');
    expect(resMonthly.success).toBe(true);
    expect(resMonthly.data.maturityAmount).toBeCloseTo(106167.78, 1);

    const resYearly = calculateFD(100000, 6, 1, 'yearly');
    expect(resYearly.success).toBe(true);
    expect(resYearly.data.maturityAmount).toBe(106000);
  });

  it('should handle zero interest rate', () => {
    const result = calculateFD(50000, 0, 3, 'quarterly');
    expect(result.success).toBe(true);
    expect(result.data.maturityAmount).toBe(50000);
    expect(result.data.interestEarned).toBe(0);
  });
});

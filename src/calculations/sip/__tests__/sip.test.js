import { calculateSIP } from '../index';

describe('SIP Calculation Engine', () => {
  it('should calculate correct SIP returns for standard investment (Reference: ₹10,000/mo @ 12% for 10 years)', () => {
    const result = calculateSIP(10000, 12, 120);
    expect(result.success).toBe(true);
    expect(result.data.totalInvested).toBe(1200000);
    expect(result.data.maturityAmount).toBeCloseTo(2323391, 0);
    expect(result.data.estimatedReturns).toBeCloseTo(1123391, 0);
  });

  it('should handle zero expected return rate (0% p.a.)', () => {
    const result = calculateSIP(5000, 0, 12);
    expect(result.success).toBe(true);
    expect(result.data.totalInvested).toBe(60000);
    expect(result.data.maturityAmount).toBe(60000);
    expect(result.data.estimatedReturns).toBe(0);
  });

  it('should reject invalid or negative inputs', () => {
    const resNeg = calculateSIP(-5000, 12, 12);
    expect(resNeg.success).toBe(false);
    expect(resNeg.errors[0].code).toBe('MUST_BE_POSITIVE');
  });
});

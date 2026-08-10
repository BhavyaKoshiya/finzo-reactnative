import { calculateSimpleInterest, calculateCompoundInterest } from '../index';

describe('Interest Calculation Engine', () => {
  describe('Simple Interest', () => {
    it('should calculate simple interest correctly (Reference: ₹1 Lakh @ 8% for 3 years)', () => {
      const result = calculateSimpleInterest(100000, 8, 3);
      expect(result.success).toBe(true);
      expect(result.data.principal).toBe(100000);
      expect(result.data.interest).toBe(24000);
      expect(result.data.totalAmount).toBe(124000);
    });

    it('should handle fractional tenure years', () => {
      const result = calculateSimpleInterest(100000, 10, 1.5);
      expect(result.success).toBe(true);
      expect(result.data.interest).toBe(15000);
    });
  });

  describe('Compound Interest', () => {
    it('should calculate compound interest correctly (Reference: ₹1 Lakh @ 8% for 3 years yearly)', () => {
      const result = calculateCompoundInterest(100000, 8, 3, 'yearly');
      expect(result.success).toBe(true);
      expect(result.data.interestEarned).toBeCloseTo(25971.2, 1);
      expect(result.data.maturityAmount).toBeCloseTo(125971.2, 1);
    });
  });
});

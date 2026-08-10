import { calculateCAGR, calculateROI } from '../index';

describe('Investment Metrics Calculation Engine', () => {
  describe('CAGR', () => {
    it('should calculate CAGR for positive growth (Reference: ₹1L -> ₹2L over 5 years)', () => {
      const result = calculateCAGR(100000, 200000, 5);
      expect(result.success).toBe(true);
      expect(result.data.cagr).toBeCloseTo(14.87, 1);
      expect(result.data.absoluteGain).toBe(100000);
    });

    it('should calculate CAGR for negative growth (decline)', () => {
      const result = calculateCAGR(100000, 50000, 5);
      expect(result.success).toBe(true);
      expect(result.data.cagr).toBeCloseTo(-12.94, 1);
    });

    it('should reject invalid initial value (<= 0)', () => {
      const result = calculateCAGR(0, 100000, 5);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('MUST_BE_POSITIVE');
    });
  });

  describe('ROI', () => {
    it('should calculate ROI for profitable investment (Reference: ₹1L -> ₹1.5L)', () => {
      const result = calculateROI(100000, 150000);
      expect(result.success).toBe(true);
      expect(result.data.roi).toBe(50);
      expect(result.data.netProfit).toBe(50000);
      expect(result.data.isProfit).toBe(true);
    });

    it('should calculate ROI for negative return (loss)', () => {
      const result = calculateROI(100000, 70000);
      expect(result.success).toBe(true);
      expect(result.data.roi).toBe(-30);
      expect(result.data.netProfit).toBe(-30000);
      expect(result.data.isProfit).toBe(false);
    });
  });
});

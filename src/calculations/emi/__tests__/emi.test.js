import { calculateEMI, calculateAmortization } from '../index';

describe('EMI & Amortization Calculation Engine', () => {
  describe('calculateEMI', () => {
    it('should calculate correct EMI for standard loan (Reference: 25 Lakhs @ 8.5% for 20 years)', () => {
      const result = calculateEMI(2500000, 8.5, 240);
      expect(result.success).toBe(true);
      expect(result.data.monthlyEMI).toBeCloseTo(21695.58, 1);
      expect(result.data.totalPayment).toBeCloseTo(5206939.4, 1);
      expect(result.data.totalInterest).toBeCloseTo(2706939.4, 1);
    });

    it('should handle zero interest rate (0% p.a.) without division by zero', () => {
      const result = calculateEMI(1200000, 0, 12);
      expect(result.success).toBe(true);
      expect(result.data.monthlyEMI).toBe(100000);
      expect(result.data.totalPayment).toBe(1200000);
      expect(result.data.totalInterest).toBe(0);
    });

    it('should accept string input values with formatting', () => {
      const result = calculateEMI('₹10,00,000', '10.5', '120');
      expect(result.success).toBe(true);
      expect(result.data.monthlyEMI).toBeCloseTo(13493.5, 1);
    });

    it('should reject negative principal or interest rate', () => {
      const resNegP = calculateEMI(-100000, 8.5, 12);
      expect(resNegP.success).toBe(false);
      expect(resNegP.errors[0].code).toBe('MUST_BE_POSITIVE');

      const resNegR = calculateEMI(100000, -5, 12);
      expect(resNegR.success).toBe(false);
      expect(resNegR.errors[0].code).toBe('MUST_BE_NON_NEGATIVE');
    });

    it('should reject invalid or missing inputs', () => {
      const resInvalid = calculateEMI('invalid', 8.5, 12);
      expect(resInvalid.success).toBe(false);
      expect(resInvalid.errors[0].code).toBe('INVALID_NUMBER');
    });
  });

  describe('calculateAmortization', () => {
    it('should generate complete monthly schedule with zero final closing balance', () => {
      const result = calculateAmortization(100000, 10, 12);
      expect(result.success).toBe(true);
      expect(result.data.schedule).toHaveLength(12);

      const firstMonth = result.data.schedule[0];
      expect(firstMonth.month).toBe(1);
      expect(firstMonth.openingBalance).toBe(100000);
      expect(firstMonth.interestComponent).toBeCloseTo(833.33, 1);

      const lastMonth = result.data.schedule[11];
      expect(lastMonth.month).toBe(12);
      expect(lastMonth.closingBalance).toBe(0);
    });
  });
});

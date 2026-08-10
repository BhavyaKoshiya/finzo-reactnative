import { percentageOf, percentageChange, percentageDifference } from '../index';

describe('Percentage Utilities Engine', () => {
  describe('percentageOf', () => {
    it('should calculate percentage of a value correctly (Reference: 15% of 200 = 30)', () => {
      const result = percentageOf(200, 15);
      expect(result.success).toBe(true);
      expect(result.data.result).toBe(30);
    });
  });

  describe('percentageChange', () => {
    it('should calculate percentage increase and decrease', () => {
      const inc = percentageChange(100, 150);
      expect(inc.success).toBe(true);
      expect(inc.data.percentageChange).toBe(50);
      expect(inc.data.isIncrease).toBe(true);

      const dec = percentageChange(100, 75);
      expect(dec.success).toBe(true);
      expect(dec.data.percentageChange).toBe(-25);
      expect(dec.data.isIncrease).toBe(false);
    });
  });

  describe('percentageDifference', () => {
    it('should calculate percentage difference between two numbers', () => {
      const result = percentageDifference(100, 150);
      expect(result.success).toBe(true);
      expect(result.data.percentageDifference).toBeCloseTo(40, 1);
    });
  });
});

import { formatINR, formatINRCompact, parseINR } from '../currency';

describe('INR Currency Formatting Utilities', () => {
  describe('formatINR', () => {
    it('should format numbers according to Indian numbering system', () => {
      expect(formatINR(1000)).toContain('1,000');
      expect(formatINR(100000)).toContain('1,00,000');
      expect(formatINR(1000000)).toContain('10,00,000');
      expect(formatINR(10000000)).toContain('1,00,00,000');
    });

    it('should format without symbol if specified', () => {
      const res = formatINR(100000, { includeSymbol: false });
      expect(res).toBe('1,00,000');
    });

    it('should handle zero and invalid inputs gracefully', () => {
      expect(formatINR(0)).toContain('0');
      expect(formatINR(null)).toContain('0');
      expect(formatINR('invalid')).toContain('0');
    });
  });

  describe('formatINRCompact', () => {
    it('should format in compact Lakhs (L) and Crores (Cr) notation', () => {
      expect(formatINRCompact(50000)).toBe('₹50 K');
      expect(formatINRCompact(100000)).toBe('₹1 L');
      expect(formatINRCompact(2500000)).toBe('₹25 L');
      expect(formatINRCompact(15000000)).toBe('₹1.5 Cr');
    });
  });

  describe('parseINR', () => {
    it('should parse formatted INR string back to canonical number', () => {
      expect(parseINR('₹10,00,000')).toBe(1000000);
      expect(parseINR('1,000.50')).toBe(1000.5);
    });
  });
});

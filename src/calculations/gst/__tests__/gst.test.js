import { calculateGST } from '../index';

describe('GST Calculation Engine', () => {
  it('should calculate GST in Exclusive mode (Reference: ₹10,000 @ 18%)', () => {
    const result = calculateGST(10000, 18, 'exclusive');
    expect(result.success).toBe(true);
    expect(result.data.baseAmount).toBe(10000);
    expect(result.data.gstAmount).toBe(1800);
    expect(result.data.totalAmount).toBe(11800);
  });

  it('should calculate GST in Inclusive mode (Reference: ₹11,800 @ 18%)', () => {
    const result = calculateGST(11800, 18, 'inclusive');
    expect(result.success).toBe(true);
    expect(result.data.totalAmount).toBe(11800);
    expect(result.data.baseAmount).toBeCloseTo(10000, 1);
    expect(result.data.gstAmount).toBeCloseTo(1800, 1);
  });

  it('should handle zero GST rate', () => {
    const result = calculateGST(5000, 0, 'exclusive');
    expect(result.success).toBe(true);
    expect(result.data.gstAmount).toBe(0);
    expect(result.data.totalAmount).toBe(5000);
  });
});

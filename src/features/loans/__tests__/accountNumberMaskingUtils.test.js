import { maskAccountReference } from '../utils/accountNumberMaskingUtils';

describe('accountNumberMaskingUtils', () => {
  it('masks long account numbers displaying last 4 digits by default', () => {
    expect(maskAccountReference('1234567890')).toBe('XXXX7890');
    expect(maskAccountReference('HDFC987654321')).toBe('XXXX4321');
  });

  it('handles short strings gracefully', () => {
    expect(maskAccountReference('123')).toBe('123');
    expect(maskAccountReference('1234')).toBe('1234');
    expect(maskAccountReference('')).toBe('');
    expect(maskAccountReference(null)).toBe('');
  });
});

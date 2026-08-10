import { toDecimal, isDecimalValue, decimalToNumber, decimalToString, Decimal } from '../decimal';

describe('Core Decimal Abstraction', () => {
  it('should parse numbers and strings to Decimal instances', () => {
    expect(toDecimal(100)).toBeInstanceOf(Decimal);
    expect(toDecimal('1000')).toEqual(new Decimal(1000));
    expect(toDecimal('1,00,000')).toEqual(new Decimal(100000));
    expect(toDecimal(null)).toEqual(new Decimal(0));
    expect(toDecimal(undefined)).toEqual(new Decimal(0));
    expect(toDecimal('')).toEqual(new Decimal(0));
  });

  it('should accurately validate decimal values', () => {
    expect(isDecimalValue(100)).toBe(true);
    expect(isDecimalValue('1000.50')).toBe(true);
    expect(isDecimalValue('1,00,000')).toBe(true);
    expect(isDecimalValue(0)).toBe(true);
    expect(isDecimalValue('')).toBe(false);
    expect(isDecimalValue(null)).toBe(false);
    expect(isDecimalValue('invalid')).toBe(false);
    expect(isDecimalValue(NaN)).toBe(false);
  });

  it('should convert Decimal to number and string', () => {
    const d = new Decimal('123.456');
    expect(decimalToNumber(d)).toBe(123.456);
    expect(decimalToString(d)).toBe('123.456');
  });

  it('should perform precise arithmetic without JS floating point artifacts', () => {
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    expect(a.plus(b).toString()).toBe('0.3');
  });
});

import { searchCalculators } from '../calculatorSearch';
import { CALCULATOR_REGISTRY } from '../../registry/calculatorRegistry';
import { CALCULATOR_IDS } from '../../registry/calculatorIds';

describe('calculatorSearch pure utility', () => {
  test('should return all calculators when query is empty or whitespace', () => {
    const resultsEmpty = searchCalculators('');
    expect(resultsEmpty).toHaveLength(CALCULATOR_REGISTRY.length);

    const resultsSpaces = searchCalculators('   ');
    expect(resultsSpaces).toHaveLength(CALCULATOR_REGISTRY.length);
  });

  test('should perform case-insensitive and trimmed query search', () => {
    const results = searchCalculators('  HOME LOAN  ');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(CALCULATOR_IDS.HOME_LOAN_EMI);
  });

  test('should prioritize exact and prefix matches first', () => {
    const results = searchCalculators('sip');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(CALCULATOR_IDS.SIP);
  });

  test('should match keywords correctly for emi', () => {
    const results = searchCalculators('emi');
    expect(results.length).toBe(5); // Home, Personal, Car, Education, Business EMI loans
    results.forEach((calc) => {
      expect(calc.name).toContain('EMI');
    });
  });

  test('should match description terms like property or maturity', () => {
    const propertyResults = searchCalculators('property');
    expect(propertyResults.length).toBeGreaterThan(0);
    expect(propertyResults[0].id).toBe(CALCULATOR_IDS.HOME_LOAN_EMI);

    const maturityResults = searchCalculators('maturity');
    expect(maturityResults.length).toBeGreaterThan(0);
  });

  test('should filter by category when categoryFilter parameter is provided', () => {
    const loanResults = searchCalculators('loan', CALCULATOR_REGISTRY, 'loans');
    expect(loanResults.length).toBe(5);
    loanResults.forEach((item) => {
      expect(item.category).toBe('loans');
    });

    const everydayResults = searchCalculators('', CALCULATOR_REGISTRY, 'everyday');
    expect(everydayResults.length).toBe(3);
  });

  test('should return empty array for non-matching queries', () => {
    const results = searchCalculators('xyz123nonexistent');
    expect(results).toHaveLength(0);
  });
});

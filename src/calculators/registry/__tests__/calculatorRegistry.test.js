import {
  CALCULATOR_IDS,
  CATEGORY_IDS,
  CALCULATOR_REGISTRY,
  CALCULATOR_STATUS,
  getCalculatorById,
  getAvailableCalculators,
  getComingSoonCalculators,
  getCalculatorsByCategory,
  getCalculatorCategories,
  getPopularCalculators,
  validateRegistry,
} from '../../index';

describe('Calculator Registry Architecture', () => {
  describe('Registry Integrity & Validation', () => {
    test('validateRegistry() should return isValid true with zero errors', () => {
      const validation = validateRegistry();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('all calculator IDs should be unique', () => {
      const ids = CALCULATOR_REGISTRY.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('all calculators should have non-empty name and description', () => {
      CALCULATOR_REGISTRY.forEach((calc) => {
        expect(calc.name).toBeTruthy();
        expect(calc.description).toBeTruthy();
        expect(calc.category).toBeTruthy();
      });
    });

    test('available calculators must have valid routes', () => {
      const available = getAvailableCalculators();
      expect(available.length).toBeGreaterThan(0);
      available.forEach((calc) => {
        expect(calc.status).toBe(CALCULATOR_STATUS.AVAILABLE);
        expect(calc.route).toBeTruthy();
      });
    });

    test('coming-soon calculators must have status comingSoon', () => {
      const comingSoon = getComingSoonCalculators();
      expect(comingSoon.length).toBeGreaterThan(0);
      comingSoon.forEach((calc) => {
        expect(calc.status).toBe(CALCULATOR_STATUS.COMING_SOON);
      });
    });
  });

  describe('Registry API Helpers', () => {
    test('getCalculatorById should return the correct calculator object', () => {
      const emi = getCalculatorById(CALCULATOR_IDS.EMI);
      expect(emi).toBeDefined();
      expect(emi.id).toBe(CALCULATOR_IDS.EMI);
      expect(emi.name).toBe('Home Loan EMI');
      expect(emi.status).toBe(CALCULATOR_STATUS.AVAILABLE);
    });

    test('getCalculatorById should return null for unknown ID', () => {
      const unknown = getCalculatorById('non-existent-id');
      expect(unknown).toBeNull();
    });

    test('getCalculatorsByCategory should filter calculators correctly', () => {
      const loanCalcs = getCalculatorsByCategory(CATEGORY_IDS.LOANS);
      expect(loanCalcs.length).toBeGreaterThan(0);
      loanCalcs.forEach((calc) => {
        expect(calc.category).toBe(CATEGORY_IDS.LOANS);
      });

      const investmentCalcs = getCalculatorsByCategory(CATEGORY_IDS.INVESTMENTS);
      expect(investmentCalcs.length).toBeGreaterThan(0);
      investmentCalcs.forEach((calc) => {
        expect(calc.category).toBe(CATEGORY_IDS.INVESTMENTS);
      });
    });

    test('getCalculatorCategories should return all categories with counts and items', () => {
      const categories = getCalculatorCategories();
      expect(categories).toHaveLength(4);

      categories.forEach((cat) => {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.calculators).toBeInstanceOf(Array);
        expect(cat.count).toBe(cat.calculators.length);
      });
    });

    test('getPopularCalculators should return only popular flagged items', () => {
      const popular = getPopularCalculators();
      expect(popular.length).toBeGreaterThan(0);
      popular.forEach((calc) => {
        expect(calc.popular).toBe(true);
      });
    });
  });
});

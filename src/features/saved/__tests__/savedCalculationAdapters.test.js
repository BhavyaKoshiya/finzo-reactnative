import { createCalculationSnapshot } from '../types/savedTypes';
import { getSavedCalculationPrimaryResult } from '../utils/savedCalculationAdapters';
import { restoreSavedCalculationInputs } from '../utils/calculationRestoreAdapters';

describe('Saved Calculation Feature Adapters & Types', () => {
  describe('createCalculationSnapshot', () => {
    test('should create valid serializable snapshot with default title', () => {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'home-loan-emi',
        inputs: { loanAmount: '1000000', interestRate: '8.5', tenureValue: '5', tenureUnit: 'years' },
        result: { monthlyEMI: 20517, totalPayment: 1231020 },
      });

      expect(snapshot.id).toMatch(/^calc_/);
      expect(snapshot.calculatorId).toBe('home-loan-emi');
      expect(snapshot.title).toBe('Home Loan EMI');
      expect(snapshot.schemaVersion).toBe(1);
      expect(snapshot.isFavorite).toBe(false);
      expect(snapshot.savedAt).toBeTruthy();
    });

    test('should preserve custom title when supplied', () => {
      const snapshot = createCalculationSnapshot({
        calculatorId: 'sip',
        title: 'Retirement SIP Goal',
        inputs: { monthlyInvestment: '10000' },
        result: { maturityAmount: 2323391 },
      });

      expect(snapshot.title).toBe('Retirement SIP Goal');
    });
  });

  describe('getSavedCalculationPrimaryResult', () => {
    test('should format EMI loan primary result correctly', () => {
      const item = {
        calculatorId: 'home-loan-emi',
        result: { monthlyEMI: 20517 },
      };
      const res = getSavedCalculationPrimaryResult(item);
      expect(res.primaryValue).toContain('₹20,517');
      expect(res.primaryLabel).toBe('Monthly EMI');
    });

    test('should format SIP primary result correctly', () => {
      const item = {
        calculatorId: 'sip',
        result: { maturityAmount: 2323391 },
      };
      const res = getSavedCalculationPrimaryResult(item);
      expect(res.primaryValue).toContain('est. value');
      expect(res.primaryLabel).toBe('Estimated Value');
    });

    test('should format GST primary result correctly', () => {
      const item = {
        calculatorId: 'gst',
        result: { totalAmount: 118000, gstAmount: 18000 },
      };
      const res = getSavedCalculationPrimaryResult(item);
      expect(res.primaryValue).toContain('₹1,18,000');
      expect(res.primaryLabel).toContain('GST');
    });

    test('should format Percentage Change primary result correctly', () => {
      const item = {
        calculatorId: 'percentage',
        result: { mode: 'percentage-change', percentageChange: 25, isIncrease: true },
      };
      const res = getSavedCalculationPrimaryResult(item);
      expect(res.primaryValue).toBe('25.00% increase');
    });
  });

  describe('restoreSavedCalculationInputs', () => {
    test('should extract restored inputs with editingSavedCalculationId', () => {
      const item = {
        id: 'calc-999',
        calculatorId: 'fd',
        title: 'My 5Yr FD',
        inputs: { principal: '100000', annualInterestRate: '7' },
      };

      const restored = restoreSavedCalculationInputs(item);
      expect(restored.editingSavedCalculationId).toBe('calc-999');
      expect(restored.savedTitle).toBe('My 5Yr FD');
      expect(restored.principal).toBe('100000');
    });
  });
});

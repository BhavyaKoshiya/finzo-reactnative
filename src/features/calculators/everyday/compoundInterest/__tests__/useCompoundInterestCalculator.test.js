import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useCompoundInterestCalculator, DEFAULT_COMPOUND_INTEREST_INPUTS } from '../hooks/useCompoundInterestCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useCompoundInterestCalculator();
  return null;
};

describe('useCompoundInterestCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default yearly compounding and compute correct maturity', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.principal).toBe(DEFAULT_COMPOUND_INTEREST_INPUTS.principal);
    expect(hookValues.annualInterestRate).toBe(DEFAULT_COMPOUND_INTEREST_INPUTS.annualInterestRate);
    expect(hookValues.compoundingFrequency).toBe('yearly');
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.maturityAmount).toBeGreaterThan(100000);
  });

  test('should calculate compounding correctly across all frequencies', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    const frequencies = ['monthly', 'quarterly', 'half-yearly', 'yearly'];
    frequencies.forEach((freq) => {
      act(() => {
        hookValues.handleCalculate('100000', '10', '1', 'years', freq);
      });
      expect(hookValues.result.maturityAmount).toBeGreaterThan(100000);
      expect(hookValues.result.compoundingFrequency).toBe(freq);
    });
  });

  test('should handle zero interest rate', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('100000', '0', '5', 'years', 'yearly');
    });

    expect(hookValues.result.maturityAmount).toBe(100000);
    expect(hookValues.result.interestEarned).toBe(0);
  });

  test('handleReset should restore default values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setPrincipal('500000');
    });

    expect(hookValues.principal).toBe('500000');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.principal).toBe(DEFAULT_COMPOUND_INTEREST_INPUTS.principal);
    expect(hookValues.compoundingFrequency).toBe('yearly');
  });
});

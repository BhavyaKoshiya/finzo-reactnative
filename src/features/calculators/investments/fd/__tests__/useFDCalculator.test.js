import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useFDCalculator, DEFAULT_FD_INPUTS } from '../hooks/useFDCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useFDCalculator();
  return null;
};

describe('useFDCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default FD values and calculate quarterly maturity amount', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.principal).toBe(DEFAULT_FD_INPUTS.principal);
    expect(hookValues.annualInterestRate).toBe(DEFAULT_FD_INPUTS.annualInterestRate);
    expect(hookValues.compoundingFrequency).toBe('quarterly');
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.maturityAmount).toBeGreaterThan(100000);
  });

  test('should compute correct maturity for each compounding frequency', () => {
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
      hookValues.handleCalculate('100000', '0', '5', 'years', 'quarterly');
    });

    expect(hookValues.result.maturityAmount).toBe(100000);
    expect(hookValues.result.interestEarned).toBe(0);
  });

  test('handleReset should restore default FD values', () => {
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

    expect(hookValues.principal).toBe(DEFAULT_FD_INPUTS.principal);
    expect(hookValues.compoundingFrequency).toBe('quarterly');
  });
});

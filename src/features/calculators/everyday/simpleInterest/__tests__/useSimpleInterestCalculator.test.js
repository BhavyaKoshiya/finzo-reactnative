import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useSimpleInterestCalculator, DEFAULT_SIMPLE_INTEREST_INPUTS } from '../hooks/useSimpleInterestCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useSimpleInterestCalculator();
  return null;
};

describe('useSimpleInterestCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default values and calculate simple interest correctly', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.principal).toBe(DEFAULT_SIMPLE_INTEREST_INPUTS.principal);
    expect(hookValues.annualInterestRate).toBe(DEFAULT_SIMPLE_INTEREST_INPUTS.annualInterestRate);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.principal).toBe(100000);
    expect(hookValues.result.interest).toBe(40000); // 100000 * 8% * 5
    expect(hookValues.result.totalAmount).toBe(140000);
  });

  test('should handle fractional year durations in months', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('100000', '12', '6', 'months');
    });

    expect(hookValues.result.interest).toBe(6000); // 100000 * 12% * 0.5
    expect(hookValues.result.totalAmount).toBe(106000);
  });

  test('should handle zero interest rate', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('50000', '0', '3', 'years');
    });

    expect(hookValues.result.interest).toBe(0);
    expect(hookValues.result.totalAmount).toBe(50000);
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

    expect(hookValues.principal).toBe(DEFAULT_SIMPLE_INTEREST_INPUTS.principal);
    expect(hookValues.result.totalAmount).toBe(140000);
  });
});

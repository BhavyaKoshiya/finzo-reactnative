import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useRDCalculator, DEFAULT_RD_INPUTS } from '../hooks/useRDCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useRDCalculator();
  return null;
};

describe('useRDCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default RD values and compute maturity amount', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.monthlyDeposit).toBe(DEFAULT_RD_INPUTS.monthlyDeposit);
    expect(hookValues.annualInterestRate).toBe(DEFAULT_RD_INPUTS.annualInterestRate);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.totalDeposited).toBe(180000);
    expect(hookValues.result.maturityAmount).toBeGreaterThan(180000);
  });

  test('should handle zero interest rate', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('5000', '0', '3', 'years');
    });

    expect(hookValues.result.totalDeposited).toBe(180000);
    expect(hookValues.result.maturityAmount).toBe(180000);
    expect(hookValues.result.interestEarned).toBe(0);
  });

  test('handleReset should restore default RD values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setMonthlyDeposit('20000');
    });

    expect(hookValues.monthlyDeposit).toBe('20000');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.monthlyDeposit).toBe(DEFAULT_RD_INPUTS.monthlyDeposit);
    expect(hookValues.result.totalDeposited).toBe(180000);
  });
});

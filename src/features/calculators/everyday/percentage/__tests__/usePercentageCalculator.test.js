import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { usePercentageCalculator, DEFAULT_PERCENTAGE_INPUTS } from '../hooks/usePercentageCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = usePercentageCalculator();
  return null;
};

describe('usePercentageCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default Percentage Of mode and calculate value', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.mode).toBe(DEFAULT_PERCENTAGE_INPUTS.mode);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.result).toBe(100); // 20% of 500
  });

  test('should calculate Percentage Change increase and decrease correctly', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    // Increase: 100 -> 125 (+25%)
    act(() => {
      hookValues.handleCalculate('percentage-change', '20', '500', '100', '125', '100', '125');
    });

    expect(hookValues.result.percentageChange).toBe(25);
    expect(hookValues.result.isIncrease).toBe(true);

    // Decrease: 125 -> 100 (-20%)
    act(() => {
      hookValues.handleCalculate('percentage-change', '20', '500', '125', '100', '100', '125');
    });

    expect(hookValues.result.percentageChange).toBe(-20);
    expect(hookValues.result.isIncrease).toBe(false);
  });

  test('should handle zero denominator in Percentage Change with clear error', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('percentage-change', '20', '500', '0', '100', '100', '125');
    });

    expect(hookValues.isCalculated).toBe(false);
    expect(hookValues.fieldErrors.oldValue).toBe('Old value cannot be zero for percentage change calculation.');
  });

  test('should calculate Percentage Difference correctly', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('percentage-difference', '20', '500', '100', '125', '100', '125');
    });

    expect(hookValues.result.percentageDifference).toBeCloseTo(22.22, 1);
  });

  test('handleReset should restore default values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setPercentage('50');
    });

    expect(hookValues.percentage).toBe('50');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.percentage).toBe(DEFAULT_PERCENTAGE_INPUTS.percentage);
    expect(hookValues.result.result).toBe(100);
  });
});

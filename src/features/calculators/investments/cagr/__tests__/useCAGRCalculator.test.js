import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useCAGRCalculator, DEFAULT_CAGR_INPUTS } from '../hooks/useCAGRCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useCAGRCalculator();
  return null;
};

describe('useCAGRCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default CAGR values and calculate percentage', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.beginningValue).toBe(DEFAULT_CAGR_INPUTS.beginningValue);
    expect(hookValues.endingValue).toBe(DEFAULT_CAGR_INPUTS.endingValue);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.cagr).toBeCloseTo(11.84, 1);
  });

  test('should handle negative growth scenarios', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('100000', '50000', '5', 'years');
    });

    expect(hookValues.result.cagr).toBeLessThan(0);
    expect(hookValues.result.absoluteGain).toBe(-50000);
  });

  test('handleReset should restore default CAGR values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setBeginningValue('200000');
    });

    expect(hookValues.beginningValue).toBe('200000');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.beginningValue).toBe(DEFAULT_CAGR_INPUTS.beginningValue);
    expect(hookValues.result.cagr).toBeCloseTo(11.84, 1);
  });
});

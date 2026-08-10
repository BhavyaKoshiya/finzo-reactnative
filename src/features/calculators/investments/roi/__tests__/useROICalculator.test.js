import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useROICalculator, DEFAULT_ROI_INPUTS } from '../hooks/useROICalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useROICalculator();
  return null;
};

describe('useROICalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default ROI values and compute percentage gain', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.initialInvestment).toBe(DEFAULT_ROI_INPUTS.initialInvestment);
    expect(hookValues.finalValue).toBe(DEFAULT_ROI_INPUTS.finalValue);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.roi).toBe(25);
    expect(hookValues.result.netProfit).toBe(25000);
    expect(hookValues.result.isProfit).toBe(true);
  });

  test('should handle negative ROI scenario', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('100000', '80000');
    });

    expect(hookValues.result.roi).toBe(-20);
    expect(hookValues.result.netProfit).toBe(-20000);
    expect(hookValues.result.isProfit).toBe(false);
  });

  test('handleReset should restore default ROI values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setInitialInvestment('500000');
    });

    expect(hookValues.initialInvestment).toBe('500000');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.initialInvestment).toBe(DEFAULT_ROI_INPUTS.initialInvestment);
    expect(hookValues.result.roi).toBe(25);
  });
});

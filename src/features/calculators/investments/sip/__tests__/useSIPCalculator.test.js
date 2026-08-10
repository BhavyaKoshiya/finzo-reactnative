import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useSIPCalculator, DEFAULT_SIP_INPUTS } from '../hooks/useSIPCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useSIPCalculator();
  return null;
};

describe('useSIPCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default SIP values and calculate initial result', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.monthlyInvestment).toBe(DEFAULT_SIP_INPUTS.monthlyInvestment);
    expect(hookValues.annualReturnRate).toBe(DEFAULT_SIP_INPUTS.annualReturnRate);
    expect(hookValues.tenureValue).toBe(DEFAULT_SIP_INPUTS.tenureValue);
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.totalInvested).toBe(1200000);
    expect(hookValues.result.maturityAmount).toBeGreaterThan(1200000);
  });

  test('should handle zero annual return rate', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('10000', '0', '10', 'years');
    });

    expect(hookValues.result.totalInvested).toBe(1200000);
    expect(hookValues.result.maturityAmount).toBe(1200000);
    expect(hookValues.result.estimatedReturns).toBe(0);
  });

  test('should capture validation errors for negative investment', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    let success;
    act(() => {
      success = hookValues.handleCalculate('-5000', '12', '10', 'years');
    });

    expect(success).toBe(false);
    expect(hookValues.fieldErrors.monthlyInvestment).toBeDefined();
  });

  test('handleReset should restore default SIP values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('50000', '15', '20', 'years');
    });

    expect(hookValues.result.totalInvested).toBe(12000000);

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.monthlyInvestment).toBe(DEFAULT_SIP_INPUTS.monthlyInvestment);
    expect(hookValues.result.totalInvested).toBe(1200000);
  });
});

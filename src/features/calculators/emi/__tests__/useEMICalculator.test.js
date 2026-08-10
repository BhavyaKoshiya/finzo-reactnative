import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useEMICalculator, { DEFAULT_EMI_INPUTS } from '../hooks/useEMICalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useEMICalculator();
  return null;
};

describe('useEMICalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  it('should initialize with default inputs and calculate initial result', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.loanAmount).toBe(DEFAULT_EMI_INPUTS.loanAmount);
    expect(hookValues.interestRate).toBe(DEFAULT_EMI_INPUTS.interestRate);
    expect(hookValues.tenureValue).toBe(DEFAULT_EMI_INPUTS.tenureValue);
    expect(hookValues.tenureUnit).toBe(DEFAULT_EMI_INPUTS.tenureUnit);

    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.monthlyEMI).toBeCloseTo(20516.53, 1);
  });

  it('should recalculate when inputs are updated and handleCalculate is called', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setLoanAmount('2000000');
      hookValues.setInterestRate('10');
      hookValues.setTenureValue('15');
      hookValues.setTenureUnit('years');
      hookValues.handleCalculate('2000000', '10', '15', 'years');
    });

    expect(hookValues.result.principal).toBe(2000000);
    expect(hookValues.result.monthlyEMI).toBeCloseTo(21492.07, 1);
  });

  it('should capture validation errors for invalid inputs', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    let success;
    act(() => {
      hookValues.setLoanAmount('-1000');
      success = hookValues.handleCalculate('-1000', '8.5', '5', 'years');
    });

    expect(success).toBe(false);
    expect(hookValues.fieldErrors.principal).toBeDefined();
  });

  it('should reset inputs back to default values on handleReset', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('5000000', '8.5', '5', 'years');
    });

    expect(hookValues.result.principal).toBe(5000000);

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.loanAmount).toBe(DEFAULT_EMI_INPUTS.loanAmount);
    expect(hookValues.result.principal).toBe(1000000);
  });
});

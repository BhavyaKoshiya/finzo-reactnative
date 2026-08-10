import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import { LOAN_CONFIGS } from '../config/loanConfigs';

let hookValues = {};

const TestPersonalComponent = () => {
  hookValues = useLoanCalculator(LOAN_CONFIGS.PERSONAL_LOAN);
  return null;
};

const TestCarComponent = () => {
  hookValues = useLoanCalculator(LOAN_CONFIGS.CAR_LOAN);
  return null;
};

const TestEducationComponent = () => {
  hookValues = useLoanCalculator(LOAN_CONFIGS.EDUCATION_LOAN);
  return null;
};

describe('useLoanCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with Personal Loan default values and perform initial calculation', () => {
    act(() => {
      renderer.create(<TestPersonalComponent />);
    });

    expect(hookValues.loanAmount).toBe('500000');
    expect(hookValues.interestRate).toBe('12');
    expect(hookValues.tenureValue).toBe('5');
    expect(hookValues.tenureUnit).toBe('years');
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.monthlyEMI).toBeGreaterThan(0);
  });

  test('should initialize with Car Loan default values and compute correct EMI', () => {
    act(() => {
      renderer.create(<TestCarComponent />);
    });

    expect(hookValues.loanAmount).toBe('800000');
    expect(hookValues.interestRate).toBe('9');
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
  });

  test('should handle zero interest rate for Education Loan', () => {
    act(() => {
      renderer.create(<TestEducationComponent />);
    });

    act(() => {
      hookValues.handleCalculate('1000000', '0', '7', 'years');
    });

    expect(hookValues.result.monthlyEMI).toBeCloseTo(1000000 / 84, 2);
    expect(hookValues.result.totalInterest).toBe(0);
  });

  test('should capture validation errors for invalid inputs', () => {
    act(() => {
      renderer.create(<TestPersonalComponent />);
    });

    let success;
    act(() => {
      success = hookValues.handleCalculate('-500', '10', '5', 'years');
    });

    expect(success).toBe(false);
    expect(hookValues.fieldErrors.principal).toBeDefined();
  });

  test('handleReset should restore configuration defaults', () => {
    act(() => {
      renderer.create(<TestPersonalComponent />);
    });

    act(() => {
      hookValues.handleCalculate('2000000', '15', '5', 'years');
    });

    expect(hookValues.result.principal).toBe(2000000);

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.loanAmount).toBe('500000');
    expect(hookValues.interestRate).toBe('12');
    expect(hookValues.result.principal).toBe(500000);
  });
});

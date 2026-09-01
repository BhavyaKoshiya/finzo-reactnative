import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useGSTCalculator, DEFAULT_GST_INPUTS } from '../hooks/useGSTCalculator';

let hookValues = {};

const TestComponent = () => {
  hookValues = useGSTCalculator();
  return null;
};

describe('useGSTCalculator Custom Hook', () => {
  beforeEach(() => {
    hookValues = {};
  });

  test('should initialize with default GST exclusive values and calculate correct total', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.amount).toBe(DEFAULT_GST_INPUTS.amount);
    expect(hookValues.gstRate).toBe(DEFAULT_GST_INPUTS.gstRate);
    expect(hookValues.mode).toBe('exclusive');
    expect(hookValues.isCalculated).toBe(true);
    expect(hookValues.result).not.toBeNull();
    expect(hookValues.result.baseAmount).toBe(100000);
    expect(hookValues.result.gstAmount).toBe(18000);
    expect(hookValues.result.totalAmount).toBe(118000);
  });

  test('should calculate correct inclusive GST breakdown', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('118000', '18', 'inclusive');
    });

    expect(hookValues.result.totalAmount).toBe(118000);
    expect(hookValues.result.baseAmount).toBe(100000);
    expect(hookValues.result.gstAmount).toBe(18000);
  });

  test('should handle zero GST rate', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleCalculate('50000', '0', 'exclusive');
    });

    expect(hookValues.result.baseAmount).toBe(50000);
    expect(hookValues.result.gstAmount).toBe(0);
    expect(hookValues.result.totalAmount).toBe(50000);
  });

  test('handleReset should restore default GST values', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setAmount('500000');
    });

    expect(hookValues.amount).toBe('500000');

    act(() => {
      hookValues.handleReset();
    });

    expect(hookValues.amount).toBe(DEFAULT_GST_INPUTS.amount);
    expect(hookValues.result.totalAmount).toBe(118000);
    expect(hookValues.selectedRatePreset).toBe('18');
  });

  test('should handle standard rate preset change correctly', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    expect(hookValues.selectedRatePreset).toBe('18');
    expect(hookValues.gstRate).toBe('18');

    act(() => {
      hookValues.handleRatePresetChange('12');
    });

    expect(hookValues.selectedRatePreset).toBe('12');
    expect(hookValues.gstRate).toBe('12');

    act(() => {
      hookValues.handleCalculate();
    });

    expect(hookValues.result.gstAmount).toBe(12000);
    expect(hookValues.result.totalAmount).toBe(112000);
  });

  test('should set preset to custom when custom rate is entered', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.setGstRate('7.5');
    });

    expect(hookValues.selectedRatePreset).toBe('custom');
    expect(hookValues.gstRate).toBe('7.5');
  });

  test('should update calculation mode via handleModeChange', () => {
    act(() => {
      renderer.create(<TestComponent />);
    });

    act(() => {
      hookValues.handleModeChange('inclusive');
    });

    expect(hookValues.mode).toBe('inclusive');
  });
});

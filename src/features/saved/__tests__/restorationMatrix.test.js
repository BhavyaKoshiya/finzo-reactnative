import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createCalculationSnapshot } from '../types/savedTypes';
import { restoreSavedCalculationInputs } from '../utils/calculationRestoreAdapters';
import { getSavedCalculationPrimaryResult } from '../utils/savedCalculationAdapters';

import { useEMICalculator } from '../../calculators/emi/hooks/useEMICalculator';
import { useLoanCalculator } from '../../calculators/loans/hooks/useLoanCalculator';
import { LOAN_CONFIGS } from '../../calculators/loans/config/loanConfigs';
import { useSIPCalculator } from '../../calculators/investments/sip/hooks/useSIPCalculator';
import { useFDCalculator } from '../../calculators/investments/fd/hooks/useFDCalculator';
import { useRDCalculator } from '../../calculators/investments/rd/hooks/useRDCalculator';
import { useCAGRCalculator } from '../../calculators/investments/cagr/hooks/useCAGRCalculator';
import { useROICalculator } from '../../calculators/investments/roi/hooks/useROICalculator';
import { useGSTCalculator } from '../../calculators/business/gst/hooks/useGSTCalculator';
import { useSimpleInterestCalculator } from '../../calculators/everyday/simpleInterest/hooks/useSimpleInterestCalculator';
import { useCompoundInterestCalculator } from '../../calculators/everyday/compoundInterest/hooks/useCompoundInterestCalculator';
import { usePercentageCalculator } from '../../calculators/everyday/percentage/hooks/usePercentageCalculator';

describe('Saved Calculation Restoration Matrix (All 14 Calculators)', () => {
  let hookOutput = {};

  const TestHookComponent = ({ useHook, hookArgs = [] }) => {
    hookOutput = useHook(...hookArgs);
    return null;
  };

  beforeEach(() => {
    hookOutput = {};
  });

  test('1. Home Loan EMI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'home-loan-emi',
      title: '20Yr Dream Home Loan',
      inputs: { loanAmount: '5000000', interestRate: '8.5', tenureValue: '20', tenureUnit: 'years' },
      result: { monthlyEMI: 43391 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useEMICalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.loanAmount).toBe('5000000');
    expect(hookOutput.interestRate).toBe('8.5');
    expect(hookOutput.tenureValue).toBe('20');
    expect(hookOutput.isCalculated).toBe(true);
    expect(hookOutput.result.monthlyEMI).toBeGreaterThan(0);

    const primary = getSavedCalculationPrimaryResult(snapshot);
    expect(primary.primaryValue).toContain('₹43,391');
  });

  test('2. Personal Loan EMI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'personal-loan-emi',
      title: 'Personal Medical Loan',
      inputs: { loanAmount: '750000', interestRate: '12', tenureValue: '4', tenureUnit: 'years' },
      result: { monthlyEMI: 19754 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(
        <TestHookComponent
          useHook={useLoanCalculator}
          hookArgs={[LOAN_CONFIGS.PERSONAL_LOAN, restoredInputs]}
        />,
      );
    });

    expect(hookOutput.loanAmount).toBe('750000');
    expect(hookOutput.interestRate).toBe('12');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('3. Car Loan EMI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'car-loan-emi',
      inputs: { loanAmount: '800000', interestRate: '9', tenureValue: '5', tenureUnit: 'years' },
      result: { monthlyEMI: 16607 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(
        <TestHookComponent
          useHook={useLoanCalculator}
          hookArgs={[LOAN_CONFIGS.CAR_LOAN, restoredInputs]}
        />,
      );
    });

    expect(hookOutput.loanAmount).toBe('800000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('4. Education Loan EMI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'education-loan-emi',
      inputs: { loanAmount: '1500000', interestRate: '9', tenureValue: '7', tenureUnit: 'years' },
      result: { monthlyEMI: 24134 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(
        <TestHookComponent
          useHook={useLoanCalculator}
          hookArgs={[LOAN_CONFIGS.EDUCATION_LOAN, restoredInputs]}
        />,
      );
    });

    expect(hookOutput.loanAmount).toBe('1500000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('5. Business Loan EMI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'business-loan-emi',
      inputs: { loanAmount: '2000000', interestRate: '11', tenureValue: '5', tenureUnit: 'years' },
      result: { monthlyEMI: 43485 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(
        <TestHookComponent
          useHook={useLoanCalculator}
          hookArgs={[LOAN_CONFIGS.BUSINESS_LOAN, restoredInputs]}
        />,
      );
    });

    expect(hookOutput.loanAmount).toBe('2000000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('6. SIP Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'sip',
      title: 'Retirement Portfolio SIP',
      inputs: { monthlyInvestment: '15000', annualReturnRate: '12', tenureValue: '10', tenureUnit: 'years' },
      result: { maturityAmount: 3485900 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useSIPCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.monthlyInvestment).toBe('15000');
    expect(hookOutput.annualReturnRate).toBe('12');
    expect(hookOutput.isCalculated).toBe(true);

    const primary = getSavedCalculationPrimaryResult(snapshot);
    expect(primary.primaryValue).toContain('est. value');
  });

  test('7. FD Restoration with Compounding Frequency', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'fd',
      inputs: {
        principal: '500000',
        annualInterestRate: '7.25',
        tenureValue: '5',
        tenureUnit: 'years',
        compoundingFrequency: 'quarterly',
      },
      result: { maturityAmount: 715873 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useFDCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.principal).toBe('500000');
    expect(hookOutput.compoundingFrequency).toBe('quarterly');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('8. RD Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'rd',
      inputs: { monthlyDeposit: '10000', annualInterestRate: '7', tenureValue: '5', tenureUnit: 'years' },
      result: { maturityAmount: 717540 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useRDCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.monthlyDeposit).toBe('10000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('9. CAGR Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'cagr',
      inputs: { beginningValue: '100000', endingValue: '200000', tenureValue: '7', tenureUnit: 'years' },
      result: { cagr: 10.41 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useCAGRCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.beginningValue).toBe('100000');
    expect(hookOutput.endingValue).toBe('200000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('10. ROI Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'roi',
      inputs: { initialInvestment: '100000', finalValue: '125000' },
      result: { roi: 25 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useROICalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.initialInvestment).toBe('100000');
    expect(hookOutput.finalValue).toBe('125000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('11. GST Restoration with Inclusive Mode', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'gst',
      inputs: { amount: '100000', gstRate: '18', mode: 'inclusive' },
      result: { totalAmount: 100000, gstAmount: 15254.24, baseAmount: 84745.76 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useGSTCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.amount).toBe('100000');
    expect(hookOutput.mode).toBe('inclusive');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('12. Simple Interest Restoration', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'simple-interest',
      inputs: { principal: '200000', annualInterestRate: '8', tenureValue: '3', tenureUnit: 'years' },
      result: { interest: 48000, totalAmount: 248000 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useSimpleInterestCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.principal).toBe('200000');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('13. Compound Interest Restoration with Monthly Compounding', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'compound-interest',
      inputs: {
        principal: '200000',
        annualInterestRate: '8',
        tenureValue: '5',
        tenureUnit: 'years',
        compoundingFrequency: 'monthly',
      },
      result: { interestEarned: 97969.14, maturityAmount: 297969.14 },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={useCompoundInterestCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.principal).toBe('200000');
    expect(hookOutput.compoundingFrequency).toBe('monthly');
    expect(hookOutput.isCalculated).toBe(true);
  });

  test('14. Percentage Restoration with Percentage Change Mode', () => {
    const snapshot = createCalculationSnapshot({
      calculatorId: 'percentage',
      inputs: {
        mode: 'percentage-change',
        percentage: '20',
        totalValue: '500',
        oldValue: '100000',
        newValue: '125000',
        valA: '100',
        valB: '125',
      },
      result: { mode: 'percentage-change', percentageChange: 25, isIncrease: true },
    });

    const restoredInputs = restoreSavedCalculationInputs(snapshot);
    act(() => {
      renderer.create(<TestHookComponent useHook={usePercentageCalculator} hookArgs={[restoredInputs]} />);
    });

    expect(hookOutput.mode).toBe('percentage-change');
    expect(hookOutput.oldValue).toBe('100000');
    expect(hookOutput.newValue).toBe('125000');
    expect(hookOutput.isCalculated).toBe(true);
  });
});

import { useState, useCallback, useEffect } from 'react';
import { calculateRD } from '../../../../../calculations/rd/calculateRD';
import logger from '../../../../../services/logger';

export const DEFAULT_RD_INPUTS = {
  monthlyDeposit: '3000',
  annualInterestRate: '7.0',
  tenureValue: '5',
  tenureUnit: 'years',
};

export const useRDCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_RD_INPUTS, ...initialInputs };

  const [monthlyDeposit, setMonthlyDepositState] = useState(defaults.monthlyDeposit);
  const [annualInterestRate, setAnnualInterestRateState] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setMonthlyDeposit = (val) => {
    setMonthlyDepositState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setAnnualInterestRate = (val) => {
    setAnnualInterestRateState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setTenureValue = (val) => {
    setTenureValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setTenureUnit = (val) => {
    setTenureUnitState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const compute = useCallback((dep, rate, tValue, tUnit) => {
    let tenureMonths = parseFloat(tValue);
    if (!isNaN(tenureMonths) && tUnit === 'years') {
      tenureMonths = tenureMonths * 12;
    }

    logger.info('RD calculation initiated', { dep, rate, tenureMonths });
    const calculationResult = calculateRD(dep, rate, tenureMonths);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('RD calculation completed', calculationResult.data);
      return true;
    } else {
      const errorsByField = {};
      if (Array.isArray(calculationResult.errors)) {
        calculationResult.errors.forEach((err) => {
          errorsByField[err.field] = err.message;
        });
      }
      setFieldErrors(errorsByField);
      setResult(null);
      setIsCalculated(false);
      setIsResultStale(false);
      logger.warn('RD calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentDep = initialInputs?.monthlyDeposit || defaults.monthlyDeposit;
    const currentRate = initialInputs?.annualInterestRate || defaults.annualInterestRate;
    const currentTVal = initialInputs?.tenureValue || defaults.tenureValue;
    const currentTUnit = initialInputs?.tenureUnit || defaults.tenureUnit;

    setMonthlyDepositState(currentDep);
    setAnnualInterestRateState(currentRate);
    setTenureValueState(currentTVal);
    setTenureUnitState(currentTUnit);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentDep, currentRate, currentTVal, currentTUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.monthlyDeposit,
    initialInputs?.annualInterestRate,
    initialInputs?.tenureValue,
    initialInputs?.tenureUnit,
  ]);

  const handleCalculate = (
    overrideDep = monthlyDeposit,
    overrideRate = annualInterestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideDep, overrideRate, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setMonthlyDepositState(DEFAULT_RD_INPUTS.monthlyDeposit);
    setAnnualInterestRateState(DEFAULT_RD_INPUTS.annualInterestRate);
    setTenureValueState(DEFAULT_RD_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_RD_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_RD_INPUTS.monthlyDeposit,
      DEFAULT_RD_INPUTS.annualInterestRate,
      DEFAULT_RD_INPUTS.tenureValue,
      DEFAULT_RD_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    monthlyDeposit,
    setMonthlyDeposit,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    editingSavedCalculationId,
    savedTitle,
    fieldErrors,
    result,
    isCalculated,
    isResultStale,
    handleCalculate,
    handleReset,
  };
};

export default useRDCalculator;

import { useState, useCallback, useEffect } from 'react';
import { calculateSimpleInterest } from '../../../../../calculations/interest/simpleInterest';
import logger from '../../../../../services/logger';

export const DEFAULT_SIMPLE_INTEREST_INPUTS = {
  principal: '100000',
  annualInterestRate: '8.0',
  tenureValue: '5',
  tenureUnit: 'years',
};

export const useSimpleInterestCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_SIMPLE_INTEREST_INPUTS, ...initialInputs };

  const [principal, setPrincipalState] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRateState] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setPrincipal = (val) => {
    setPrincipalState(val);
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

  const compute = useCallback((p, r, tValue, tUnit) => {
    let tenureYears = parseFloat(tValue);
    if (!isNaN(tenureYears) && tUnit === 'months') {
      tenureYears = tenureYears / 12;
    }

    logger.info('Simple Interest calculation initiated', { p, r, tenureYears });
    const calculationResult = calculateSimpleInterest(p, r, tenureYears);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('Simple Interest calculation completed', calculationResult.data);
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
      logger.warn('Simple Interest calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentP = initialInputs?.principal || defaults.principal;
    const currentR = initialInputs?.annualInterestRate || defaults.annualInterestRate;
    const currentTVal = initialInputs?.tenureValue || defaults.tenureValue;
    const currentTUnit = initialInputs?.tenureUnit || defaults.tenureUnit;

    setPrincipalState(currentP);
    setAnnualInterestRateState(currentR);
    setTenureValueState(currentTVal);
    setTenureUnitState(currentTUnit);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentP, currentR, currentTVal, currentTUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.principal,
    initialInputs?.annualInterestRate,
    initialInputs?.tenureValue,
    initialInputs?.tenureUnit,
  ]);

  const handleCalculate = (
    overrideP = principal,
    overrideR = annualInterestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideP, overrideR, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setPrincipalState(DEFAULT_SIMPLE_INTEREST_INPUTS.principal);
    setAnnualInterestRateState(DEFAULT_SIMPLE_INTEREST_INPUTS.annualInterestRate);
    setTenureValueState(DEFAULT_SIMPLE_INTEREST_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_SIMPLE_INTEREST_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_SIMPLE_INTEREST_INPUTS.principal,
      DEFAULT_SIMPLE_INTEREST_INPUTS.annualInterestRate,
      DEFAULT_SIMPLE_INTEREST_INPUTS.tenureValue,
      DEFAULT_SIMPLE_INTEREST_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    principal,
    setPrincipal,
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

export default useSimpleInterestCalculator;

import { useState, useCallback, useEffect } from 'react';
import { calculateFD } from '../../../../../calculations/fd/calculateFD';
import logger from '../../../../../services/logger';

export const DEFAULT_FD_INPUTS = {
  principal: '100000',
  annualInterestRate: '7.5',
  tenureValue: '5',
  tenureUnit: 'years',
  compoundingFrequency: 'quarterly',
};

export const useFDCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_FD_INPUTS, ...initialInputs };

  const [principal, setPrincipalState] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRateState] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [compoundingFrequency, setCompoundingFrequencyState] = useState(defaults.compoundingFrequency);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs.savedTitle || '');

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

  const setCompoundingFrequency = (val) => {
    setCompoundingFrequencyState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const compute = useCallback((p, r, tValue, tUnit, freq) => {
    let tenureYears = parseFloat(tValue);
    if (!isNaN(tenureYears) && tUnit === 'months') {
      tenureYears = tenureYears / 12;
    }

    logger.info('FD calculation initiated', { p, r, tenureYears, freq });
    const calculationResult = calculateFD(p, r, tenureYears, freq);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('FD calculation completed', calculationResult.data);
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
      logger.warn('FD calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentP = initialInputs?.principal || defaults.principal;
    const currentR = initialInputs?.annualInterestRate || defaults.annualInterestRate;
    const currentTVal = initialInputs?.tenureValue || defaults.tenureValue;
    const currentTUnit = initialInputs?.tenureUnit || defaults.tenureUnit;
    const currentFreq = initialInputs?.compoundingFrequency || defaults.compoundingFrequency;

    setPrincipalState(currentP);
    setAnnualInterestRateState(currentR);
    setTenureValueState(currentTVal);
    setTenureUnitState(currentTUnit);
    setCompoundingFrequencyState(currentFreq);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentP, currentR, currentTVal, currentTUnit, currentFreq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.principal,
    initialInputs?.annualInterestRate,
    initialInputs?.tenureValue,
    initialInputs?.tenureUnit,
    initialInputs?.compoundingFrequency,
  ]);

  const handleCalculate = (
    overrideP = principal,
    overrideR = annualInterestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
    overrideFreq = compoundingFrequency,
  ) => {
    return compute(overrideP, overrideR, overrideTVal, overrideTUnit, overrideFreq);
  };

  const handleReset = useCallback(() => {
    setPrincipalState(DEFAULT_FD_INPUTS.principal);
    setAnnualInterestRateState(DEFAULT_FD_INPUTS.annualInterestRate);
    setTenureValueState(DEFAULT_FD_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_FD_INPUTS.tenureUnit);
    setCompoundingFrequencyState(DEFAULT_FD_INPUTS.compoundingFrequency);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_FD_INPUTS.principal,
      DEFAULT_FD_INPUTS.annualInterestRate,
      DEFAULT_FD_INPUTS.tenureValue,
      DEFAULT_FD_INPUTS.tenureUnit,
      DEFAULT_FD_INPUTS.compoundingFrequency,
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
    compoundingFrequency,
    setCompoundingFrequency,
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

export default useFDCalculator;

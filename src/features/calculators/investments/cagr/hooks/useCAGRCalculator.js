import { useState, useCallback, useEffect } from 'react';
import { calculateCAGR } from '../../../../../calculations/investment/calculateCAGR';
import logger from '../../../../../services/logger';

export const DEFAULT_CAGR_INPUTS = {
  beginningValue: '100000',
  endingValue: '175000',
  tenureValue: '5',
  tenureUnit: 'years',
};

export const useCAGRCalculator = (initialInputs = {}) => {
  const defaults = {
    beginningValue: initialInputs?.beginningValue || DEFAULT_CAGR_INPUTS.beginningValue,
    endingValue: initialInputs?.endingValue || DEFAULT_CAGR_INPUTS.endingValue,
    tenureValue: initialInputs?.tenureValue || DEFAULT_CAGR_INPUTS.tenureValue,
    tenureUnit: initialInputs?.tenureUnit || DEFAULT_CAGR_INPUTS.tenureUnit,
  };

  const [beginningValue, setBeginningValueState] = useState(defaults.beginningValue);
  const [endingValue, setEndingValueState] = useState(defaults.endingValue);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setBeginningValue = (val) => {
    setBeginningValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setEndingValue = (val) => {
    setEndingValueState(val);
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

  const compute = useCallback((bv, ev, tValue, tUnit) => {
    let tenureYears = parseFloat(tValue);
    if (!isNaN(tenureYears) && tUnit === 'months') {
      tenureYears = tenureYears / 12;
    }

    logger.info('CAGR calculation initiated', { bv, ev, tenureYears });
    const calculationResult = calculateCAGR(bv, ev, tenureYears);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('CAGR calculation completed', calculationResult.data);
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
      logger.warn('CAGR calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentBV = initialInputs?.beginningValue || defaults.beginningValue;
    const currentEV = initialInputs?.endingValue || defaults.endingValue;
    const currentTVal = initialInputs?.tenureValue || defaults.tenureValue;
    const currentTUnit = initialInputs?.tenureUnit || defaults.tenureUnit;

    setBeginningValueState(currentBV);
    setEndingValueState(currentEV);
    setTenureValueState(currentTVal);
    setTenureUnitState(currentTUnit);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentBV, currentEV, currentTVal, currentTUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.beginningValue,
    initialInputs?.endingValue,
    initialInputs?.tenureValue,
    initialInputs?.tenureUnit,
  ]);

  const handleCalculate = (
    overrideBV = beginningValue,
    overrideEV = endingValue,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideBV, overrideEV, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setBeginningValueState(DEFAULT_CAGR_INPUTS.beginningValue);
    setEndingValueState(DEFAULT_CAGR_INPUTS.endingValue);
    setTenureValueState(DEFAULT_CAGR_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_CAGR_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_CAGR_INPUTS.beginningValue,
      DEFAULT_CAGR_INPUTS.endingValue,
      DEFAULT_CAGR_INPUTS.tenureValue,
      DEFAULT_CAGR_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    beginningValue,
    setBeginningValue,
    endingValue,
    setEndingValue,
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

export default useCAGRCalculator;

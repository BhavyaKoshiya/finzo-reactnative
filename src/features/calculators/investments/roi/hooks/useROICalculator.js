import { useState, useCallback, useEffect } from 'react';
import { calculateROI } from '../../../../../calculations/investment/calculateROI';
import logger from '../../../../../services/logger';

export const DEFAULT_ROI_INPUTS = {
  initialInvestment: '100000',
  finalValue: '125000',
};

export const useROICalculator = (initialInputs = {}) => {
  const defaults = {
    initialInvestment: initialInputs?.initialInvestment || DEFAULT_ROI_INPUTS.initialInvestment,
    finalValue: initialInputs?.finalValue || DEFAULT_ROI_INPUTS.finalValue,
  };

  const [initialInvestment, setInitialInvestmentState] = useState(defaults.initialInvestment);
  const [finalValue, setFinalValueState] = useState(defaults.finalValue);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setInitialInvestment = (val) => {
    setInitialInvestmentState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setFinalValue = (val) => {
    setFinalValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const compute = useCallback((inv, fVal) => {
    logger.info('ROI calculation initiated', { inv, fVal });
    const calculationResult = calculateROI(inv, fVal);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('ROI calculation completed', calculationResult.data);
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
      logger.warn('ROI calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentInv = initialInputs?.initialInvestment || defaults.initialInvestment;
    const currentFVal = initialInputs?.finalValue || defaults.finalValue;

    setInitialInvestmentState(currentInv);
    setFinalValueState(currentFVal);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentInv, currentFVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.initialInvestment,
    initialInputs?.finalValue,
  ]);

  const handleCalculate = (
    overrideInv = initialInvestment,
    overrideFVal = finalValue,
  ) => {
    return compute(overrideInv, overrideFVal);
  };

  const handleReset = useCallback(() => {
    setInitialInvestmentState(DEFAULT_ROI_INPUTS.initialInvestment);
    setFinalValueState(DEFAULT_ROI_INPUTS.finalValue);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(DEFAULT_ROI_INPUTS.initialInvestment, DEFAULT_ROI_INPUTS.finalValue);
  }, [compute]);

  return {
    initialInvestment,
    setInitialInvestment,
    finalValue,
    setFinalValue,
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

export default useROICalculator;

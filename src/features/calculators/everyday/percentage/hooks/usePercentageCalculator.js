import { useState, useCallback, useEffect } from 'react';
import {
  percentageOf,
  percentageChange,
  percentageDifference,
} from '../../../../../calculations/percentage';
import logger from '../../../../../services/logger';

export const PERCENTAGE_MODE_OPTIONS = [
  { label: 'Percentage Of (X% of Y)', value: 'percentage-of' },
  { label: 'Percentage Change (Old → New)', value: 'percentage-change' },
  { label: 'Percentage Difference (A vs B)', value: 'percentage-difference' },
];

export const DEFAULT_PERCENTAGE_INPUTS = {
  mode: 'percentage-of',
  percentage: '20',
  totalValue: '500',
  oldValue: '100',
  newValue: '125',
  valA: '100',
  valB: '125',
};

export const usePercentageCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_PERCENTAGE_INPUTS, ...initialInputs };

  const [mode, setModeState] = useState(defaults.mode);
  const [percentage, setPercentageState] = useState(defaults.percentage);
  const [totalValue, setTotalValueState] = useState(defaults.totalValue);
  const [oldValue, setOldValueState] = useState(defaults.oldValue);
  const [newValue, setNewValueState] = useState(defaults.newValue);
  const [valA, setValAState] = useState(defaults.valA);
  const [valB, setValBState] = useState(defaults.valB);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setPercentage = (val) => {
    setPercentageState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setTotalValue = (val) => {
    setTotalValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setOldValue = (val) => {
    setOldValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setNewValue = (val) => {
    setNewValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setValA = (val) => {
    setValAState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setValB = (val) => {
    setValBState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const compute = useCallback(
    (currentMode, p, total, oldV, newV, vA, vB) => {
      logger.info('Percentage calculation initiated', { currentMode, p, total, oldV, newV, vA, vB });
      let calculationResult;

      if (currentMode === 'percentage-of') {
        calculationResult = percentageOf(total, p);
      } else if (currentMode === 'percentage-change') {
        calculationResult = percentageChange(oldV, newV);
      } else if (currentMode === 'percentage-difference') {
        calculationResult = percentageDifference(vA, vB);
      }

      if (calculationResult && calculationResult.success) {
        setFieldErrors({});
        setResult({ mode: currentMode, ...calculationResult.data });
        setIsCalculated(true);
        setIsResultStale(false);
        logger.info('Percentage calculation completed', calculationResult.data);
        return true;
      } else {
        const errorsByField = {};
        if (calculationResult && Array.isArray(calculationResult.errors)) {
          calculationResult.errors.forEach((err) => {
            errorsByField[err.field] = err.message;
          });
        }
        setFieldErrors(errorsByField);
        setResult(null);
        setIsCalculated(false);
        setIsResultStale(false);
        logger.warn('Percentage calculation failed validation', errorsByField);
        return false;
      }
    },
    [],
  );

  // Initial calculation on mount
  useEffect(() => {
    compute(
      defaults.mode,
      defaults.percentage,
      defaults.totalValue,
      defaults.oldValue,
      defaults.newValue,
      defaults.valA,
      defaults.valB,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = (newMode) => {
    setModeState(newMode);
    if (isCalculated) setIsResultStale(true);
  };

  const handleCalculate = (
    overrideMode = mode,
    overrideP = percentage,
    overrideTotal = totalValue,
    overrideOld = oldValue,
    overrideNew = newValue,
    overrideVA = valA,
    overrideVB = valB,
  ) => {
    return compute(
      overrideMode,
      overrideP,
      overrideTotal,
      overrideOld,
      overrideNew,
      overrideVA,
      overrideVB,
    );
  };

  const handleReset = useCallback(() => {
    setModeState(DEFAULT_PERCENTAGE_INPUTS.mode);
    setPercentageState(DEFAULT_PERCENTAGE_INPUTS.percentage);
    setTotalValueState(DEFAULT_PERCENTAGE_INPUTS.totalValue);
    setOldValueState(DEFAULT_PERCENTAGE_INPUTS.oldValue);
    setNewValueState(DEFAULT_PERCENTAGE_INPUTS.newValue);
    setValAState(DEFAULT_PERCENTAGE_INPUTS.valA);
    setValBState(DEFAULT_PERCENTAGE_INPUTS.valB);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_PERCENTAGE_INPUTS.mode,
      DEFAULT_PERCENTAGE_INPUTS.percentage,
      DEFAULT_PERCENTAGE_INPUTS.totalValue,
      DEFAULT_PERCENTAGE_INPUTS.oldValue,
      DEFAULT_PERCENTAGE_INPUTS.newValue,
      DEFAULT_PERCENTAGE_INPUTS.valA,
      DEFAULT_PERCENTAGE_INPUTS.valB,
    );
  }, [compute]);

  return {
    mode,
    setMode: setModeState,
    percentage,
    setPercentage,
    totalValue,
    setTotalValue,
    oldValue,
    setOldValue,
    newValue,
    setNewValue,
    valA,
    setValA,
    valB,
    setValB,
    handleModeChange,
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

export default usePercentageCalculator;

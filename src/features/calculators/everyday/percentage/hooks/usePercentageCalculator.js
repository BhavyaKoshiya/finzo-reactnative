import { useState, useCallback, useEffect } from 'react';
import {
  percentageOf,
  percentageChange,
  percentageDifference,
} from '../../../../../calculations/percentage';
import logger from '../../../../../services/logger';

export const PERCENTAGE_MODES = {
  PERCENTAGE_OF: 'percentage-of',
  PERCENTAGE_CHANGE: 'percentage-change',
  PERCENTAGE_DIFFERENCE: 'percentage-difference',
};

export const PERCENTAGE_MODE_OPTIONS = [
  { label: 'Percentage Of (What is X% of Y?)', value: PERCENTAGE_MODES.PERCENTAGE_OF },
  { label: 'Percentage Change (% Increase/Decrease)', value: PERCENTAGE_MODES.PERCENTAGE_CHANGE },
  { label: 'Percentage Difference (|A - B| / Avg)', value: PERCENTAGE_MODES.PERCENTAGE_DIFFERENCE },
];

export const DEFAULT_PERCENTAGE_INPUTS = {
  mode: PERCENTAGE_MODES.PERCENTAGE_OF,
  percentage: '20',
  totalValue: '500',
  oldValue: '1000',
  newValue: '1250',
  valA: '500',
  valB: '600',
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
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setMode = (m) => {
    setModeState(m);
    setFieldErrors({});
    if (isCalculated) setIsResultStale(true);
  };

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

  const compute = useCallback((currentMode, p, total, oldV, newV, vA, vB) => {
    logger.info('Percentage calculation initiated', { currentMode, p, total, oldV, newV, vA, vB });

    let calculationResult;
    if (currentMode === PERCENTAGE_MODES.PERCENTAGE_OF) {
      calculationResult = percentageOf(p, total);
    } else if (currentMode === PERCENTAGE_MODES.PERCENTAGE_CHANGE) {
      calculationResult = percentageChange(oldV, newV);
    } else if (currentMode === PERCENTAGE_MODES.PERCENTAGE_DIFFERENCE) {
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
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentMode = initialInputs?.mode || defaults.mode;
    const currentP = initialInputs?.percentage || defaults.percentage;
    const currentTotal = initialInputs?.totalValue || defaults.totalValue;
    const currentOldV = initialInputs?.oldValue || defaults.oldValue;
    const currentNewV = initialInputs?.newValue || defaults.newValue;
    const currentVA = initialInputs?.valA || defaults.valA;
    const currentVB = initialInputs?.valB || defaults.valB;

    setModeState(currentMode);
    setPercentageState(currentP);
    setTotalValueState(currentTotal);
    setOldValueState(currentOldV);
    setNewValueState(currentNewV);
    setValAState(currentVA);
    setValBState(currentVB);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentMode, currentP, currentTotal, currentOldV, currentNewV, currentVA, currentVB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.mode,
    initialInputs?.percentage,
    initialInputs?.totalValue,
    initialInputs?.oldValue,
    initialInputs?.newValue,
    initialInputs?.valA,
    initialInputs?.valB,
  ]);

  const handleCalculate = (
    overrideMode = mode,
    overrideP = percentage,
    overrideTotal = totalValue,
    overrideOldV = oldValue,
    overrideNewV = newValue,
    overrideVA = valA,
    overrideVB = valB,
  ) => {
    return compute(overrideMode, overrideP, overrideTotal, overrideOldV, overrideNewV, overrideVA, overrideVB);
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
    setMode,
    handleModeChange: setMode,
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

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

  const [mode, setMode] = useState(defaults.mode);
  const [percentage, setPercentage] = useState(defaults.percentage);
  const [totalValue, setTotalValue] = useState(defaults.totalValue);
  const [oldValue, setOldValue] = useState(defaults.oldValue);
  const [newValue, setNewValue] = useState(defaults.newValue);
  const [valA, setValA] = useState(defaults.valA);
  const [valB, setValB] = useState(defaults.valB);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

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
    setMode(newMode);
    setIsCalculated(false);
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
    setMode(defaults.mode);
    setPercentage(defaults.percentage);
    setTotalValue(defaults.totalValue);
    setOldValue(defaults.oldValue);
    setNewValue(defaults.newValue);
    setValA(defaults.valA);
    setValB(defaults.valB);
    setFieldErrors({});
    compute(
      defaults.mode,
      defaults.percentage,
      defaults.totalValue,
      defaults.oldValue,
      defaults.newValue,
      defaults.valA,
      defaults.valB,
    );
  }, [defaults.mode, defaults.percentage, defaults.totalValue, defaults.oldValue, defaults.newValue, defaults.valA, defaults.valB, compute]);

  return {
    mode,
    setMode,
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
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  };
};

export default usePercentageCalculator;

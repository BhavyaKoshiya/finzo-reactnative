import { useState, useCallback, useEffect } from 'react';
import { calculateGST } from '../../../../../calculations/gst/calculateGST';
import logger from '../../../../../services/logger';

export const GST_MODE_OPTIONS = [
  { label: 'Exclusive (Add GST to Amount)', value: 'exclusive' },
  { label: 'Inclusive (Extract GST from Amount)', value: 'inclusive' },
];

export const GST_RATE_PRESETS = ['5', '12', '18', '28'];

export const DEFAULT_GST_INPUTS = {
  amount: '100000',
  gstRate: '18',
  mode: 'exclusive',
};

export const useGSTCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_GST_INPUTS, ...initialInputs };

  const [amount, setAmountState] = useState(defaults.amount);
  const [gstRate, setGstRateState] = useState(defaults.gstRate);
  const [mode, setModeState] = useState(defaults.mode);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setAmount = (val) => {
    setAmountState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setGstRate = (val) => {
    setGstRateState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setMode = (val) => {
    setModeState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const compute = useCallback((amt, rate, m) => {
    logger.info('GST calculation initiated', { amt, rate, m });
    const calculationResult = calculateGST(amt, rate, m);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('GST calculation completed', calculationResult.data);
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
      logger.warn('GST calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentAmt = initialInputs?.amount || defaults.amount;
    const currentRate = initialInputs?.gstRate || defaults.gstRate;
    const currentMode = initialInputs?.mode || defaults.mode;

    setAmountState(currentAmt);
    setGstRateState(currentRate);
    setModeState(currentMode);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentAmt, currentRate, currentMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.amount,
    initialInputs?.gstRate,
    initialInputs?.mode,
  ]);

  const handleCalculate = (
    overrideAmt = amount,
    overrideRate = gstRate,
    overrideMode = mode,
  ) => {
    return compute(overrideAmt, overrideRate, overrideMode);
  };

  const handleReset = useCallback(() => {
    setAmountState(DEFAULT_GST_INPUTS.amount);
    setGstRateState(DEFAULT_GST_INPUTS.gstRate);
    setModeState(DEFAULT_GST_INPUTS.mode);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_GST_INPUTS.amount,
      DEFAULT_GST_INPUTS.gstRate,
      DEFAULT_GST_INPUTS.mode,
    );
  }, [compute]);

  return {
    amount,
    setAmount,
    gstRate,
    setGstRate,
    mode,
    setMode,
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

export default useGSTCalculator;

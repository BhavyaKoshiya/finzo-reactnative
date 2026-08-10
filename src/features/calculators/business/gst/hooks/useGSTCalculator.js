import { useState, useCallback, useEffect } from 'react';
import { calculateGST } from '../../../../../calculations/gst/calculateGST';
import logger from '../../../../../services/logger';

export const GST_MODE_OPTIONS = [
  { label: 'GST Exclusive (Add GST to Base)', value: 'exclusive' },
  { label: 'GST Inclusive (Extract GST from Total)', value: 'inclusive' },
];

export const GST_RATE_PRESETS = [
  { label: '5%', value: '5' },
  { label: '12%', value: '12' },
  { label: '18%', value: '18' },
  { label: '28%', value: '28' },
  { label: 'Custom', value: 'custom' },
];

export const DEFAULT_GST_INPUTS = {
  amount: '100000',
  gstRate: '18',
  mode: 'exclusive',
};

export const useGSTCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_GST_INPUTS, ...initialInputs };

  const [amount, setAmount] = useState(defaults.amount);
  const [gstRate, setGstRate] = useState(defaults.gstRate);
  const [mode, setMode] = useState(defaults.mode);
  const [selectedRatePreset, setSelectedRatePreset] = useState('18');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const compute = useCallback(
    (amt, rate, m) => {
      logger.info('GST calculation initiated', { amt, rate, m });
      const calculationResult = calculateGST(amt, rate, m);

      if (calculationResult.success) {
        setFieldErrors({});
        setResult(calculationResult.data);
        setIsCalculated(true);
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
        logger.warn('GST calculation failed validation', errorsByField);
        return false;
      }
    },
    [],
  );

  // Initial calculation on mount
  useEffect(() => {
    compute(defaults.amount, defaults.gstRate, defaults.mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRatePresetChange = (presetValue) => {
    setSelectedRatePreset(presetValue);
    if (presetValue !== 'custom') {
      setGstRate(presetValue);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsCalculated(false);
  };

  const handleCalculate = (
    overrideAmt = amount,
    overrideRate = gstRate,
    overrideMode = mode,
  ) => {
    return compute(overrideAmt, overrideRate, overrideMode);
  };

  const handleReset = useCallback(() => {
    setAmount(defaults.amount);
    setGstRate(defaults.gstRate);
    setMode(defaults.mode);
    setSelectedRatePreset('18');
    setFieldErrors({});
    compute(defaults.amount, defaults.gstRate, defaults.mode);
  }, [defaults.amount, defaults.gstRate, defaults.mode, compute]);

  return {
    amount,
    setAmount,
    gstRate,
    setGstRate,
    mode,
    setMode,
    selectedRatePreset,
    handleRatePresetChange,
    handleModeChange,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  };
};

export default useGSTCalculator;

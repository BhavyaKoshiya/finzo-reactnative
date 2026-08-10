import { useState, useCallback, useEffect } from 'react';
import { calculateROI } from '../../../../../calculations/investment/calculateROI';
import logger from '../../../../../services/logger';

export const DEFAULT_ROI_INPUTS = {
  initialInvestment: '100000', // ₹1,00,000 cost
  finalValue: '125000', // ₹1,25,000 return
};

export const useROICalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(DEFAULT_ROI_INPUTS.initialInvestment);
  const [finalValue, setFinalValue] = useState(DEFAULT_ROI_INPUTS.finalValue);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculate = useCallback((inv, val) => {
    logger.info('ROI calculation initiated');

    const roiRes = calculateROI(inv, val);
    if (roiRes.success) {
      setFieldErrors({});
      setResult(roiRes.data);
      setIsCalculated(true);
      logger.info('ROI calculation completed');
      return true;
    }

    const errorsObj = {};
    if (roiRes.errors) {
      roiRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
    }
    setFieldErrors(errorsObj);
    return false;
  }, []);

  useEffect(() => {
    calculate(
      DEFAULT_ROI_INPUTS.initialInvestment,
      DEFAULT_ROI_INPUTS.finalValue
    );
  }, [calculate]);

  const handleCalculate = useCallback((customInv, customVal) => {
    const inv = typeof customInv === 'string' || typeof customInv === 'number' ? customInv : initialInvestment;
    const val = typeof customVal === 'string' || typeof customVal === 'number' ? customVal : finalValue;
    return calculate(inv, val);
  }, [calculate, initialInvestment, finalValue]);

  const handleReset = useCallback(() => {
    setInitialInvestment(DEFAULT_ROI_INPUTS.initialInvestment);
    setFinalValue(DEFAULT_ROI_INPUTS.finalValue);
    setFieldErrors({});

    calculate(
      DEFAULT_ROI_INPUTS.initialInvestment,
      DEFAULT_ROI_INPUTS.finalValue
    );
  }, [calculate]);

  return {
    initialInvestment,
    setInitialInvestment,
    finalValue,
    setFinalValue,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  };
};

export default useROICalculator;

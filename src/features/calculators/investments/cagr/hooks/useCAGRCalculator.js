import { useState, useCallback, useEffect } from 'react';
import { calculateCAGR } from '../../../../../calculations/investment/calculateCAGR';
import { normalizeNumberInput } from '../../../../../calculations/core/validation';
import logger from '../../../../../services/logger';

export const DEFAULT_CAGR_INPUTS = {
  beginningValue: '100000', // ₹1,00,000 initial
  endingValue: '175000', // ₹1,75,000 final
  tenureValue: '5', // 5 Years
  tenureUnit: 'years',
};

export const useCAGRCalculator = () => {
  const [beginningValue, setBeginningValue] = useState(DEFAULT_CAGR_INPUTS.beginningValue);
  const [endingValue, setEndingValue] = useState(DEFAULT_CAGR_INPUTS.endingValue);
  const [tenureValue, setTenureValue] = useState(DEFAULT_CAGR_INPUTS.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_CAGR_INPUTS.tenureUnit);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const computeTenureYears = useCallback((val, unit) => {
    const numVal = normalizeNumberInput(val);
    if (numVal === null) return 0;
    return unit === 'months' ? numVal / 12 : numVal;
  }, []);

  const calculate = useCallback((bv, ev, tVal, tUnit) => {
    const tenureYears = computeTenureYears(tVal, tUnit);

    logger.info('CAGR calculation initiated');

    const cagrRes = calculateCAGR(bv, ev, tenureYears);
    if (cagrRes.success) {
      setFieldErrors({});
      setResult(cagrRes.data);
      setIsCalculated(true);
      logger.info('CAGR calculation completed');
      return true;
    }

    const errorsObj = {};
    if (cagrRes.errors) {
      cagrRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
    }
    setFieldErrors(errorsObj);
    return false;
  }, [computeTenureYears]);

  useEffect(() => {
    calculate(
      DEFAULT_CAGR_INPUTS.beginningValue,
      DEFAULT_CAGR_INPUTS.endingValue,
      DEFAULT_CAGR_INPUTS.tenureValue,
      DEFAULT_CAGR_INPUTS.tenureUnit
    );
  }, [calculate]);

  const handleCalculate = useCallback((customBv, customEv, customTenureVal, customTenureUnit) => {
    const bv = typeof customBv === 'string' || typeof customBv === 'number' ? customBv : beginningValue;
    const ev = typeof customEv === 'string' || typeof customEv === 'number' ? customEv : endingValue;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    return calculate(bv, ev, tVal, tUnit);
  }, [calculate, beginningValue, endingValue, tenureValue, tenureUnit]);

  const handleReset = useCallback(() => {
    setBeginningValue(DEFAULT_CAGR_INPUTS.beginningValue);
    setEndingValue(DEFAULT_CAGR_INPUTS.endingValue);
    setTenureValue(DEFAULT_CAGR_INPUTS.tenureValue);
    setTenureUnit(DEFAULT_CAGR_INPUTS.tenureUnit);
    setFieldErrors({});

    calculate(
      DEFAULT_CAGR_INPUTS.beginningValue,
      DEFAULT_CAGR_INPUTS.endingValue,
      DEFAULT_CAGR_INPUTS.tenureValue,
      DEFAULT_CAGR_INPUTS.tenureUnit
    );
  }, [calculate]);

  return {
    beginningValue,
    setBeginningValue,
    endingValue,
    setEndingValue,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  };
};

export default useCAGRCalculator;

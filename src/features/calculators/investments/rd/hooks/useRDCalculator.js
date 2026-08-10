import { useState, useCallback, useEffect } from 'react';
import { calculateRD } from '../../../../../calculations/rd/calculateRD';
import { validateRDInput } from '../../../../../calculations/rd/rdValidation';
import { normalizeNumberInput } from '../../../../../calculations/core/validation';
import logger from '../../../../../services/logger';

export const DEFAULT_RD_INPUTS = {
  monthlyDeposit: '5000', // ₹5,000 / month
  annualInterestRate: '7', // 7% p.a.
  tenureValue: '3', // 3 Years
  tenureUnit: 'years',
};

export const useRDCalculator = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(DEFAULT_RD_INPUTS.monthlyDeposit);
  const [annualInterestRate, setAnnualInterestRate] = useState(DEFAULT_RD_INPUTS.annualInterestRate);
  const [tenureValue, setTenureValue] = useState(DEFAULT_RD_INPUTS.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_RD_INPUTS.tenureUnit);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const computeTenureMonths = useCallback((val, unit) => {
    const numVal = normalizeNumberInput(val);
    if (numVal === null) return 0;
    return unit === 'years' ? Math.round(numVal * 12) : Math.round(numVal);
  }, []);

  const calculate = useCallback((amt, rate, tVal, tUnit) => {
    const tenureMonths = computeTenureMonths(tVal, tUnit);

    const validationRes = validateRDInput(amt, rate, tenureMonths);
    if (validationRes && !validationRes.success) {
      const errorsObj = {};
      validationRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
      return false;
    }

    setFieldErrors({});
    logger.info('RD calculation initiated');

    const rdRes = calculateRD(amt, rate, tenureMonths);
    if (rdRes.success) {
      setResult(rdRes.data);
      setIsCalculated(true);
      logger.info('RD calculation completed');
      return true;
    }

    return false;
  }, [computeTenureMonths]);

  useEffect(() => {
    calculate(
      DEFAULT_RD_INPUTS.monthlyDeposit,
      DEFAULT_RD_INPUTS.annualInterestRate,
      DEFAULT_RD_INPUTS.tenureValue,
      DEFAULT_RD_INPUTS.tenureUnit
    );
  }, [calculate]);

  const handleCalculate = useCallback((customAmt, customRate, customTenureVal, customTenureUnit) => {
    const amt = typeof customAmt === 'string' || typeof customAmt === 'number' ? customAmt : monthlyDeposit;
    const rate = typeof customRate === 'string' || typeof customRate === 'number' ? customRate : annualInterestRate;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    return calculate(amt, rate, tVal, tUnit);
  }, [calculate, monthlyDeposit, annualInterestRate, tenureValue, tenureUnit]);

  const handleReset = useCallback(() => {
    setMonthlyDeposit(DEFAULT_RD_INPUTS.monthlyDeposit);
    setAnnualInterestRate(DEFAULT_RD_INPUTS.annualInterestRate);
    setTenureValue(DEFAULT_RD_INPUTS.tenureValue);
    setTenureUnit(DEFAULT_RD_INPUTS.tenureUnit);
    setFieldErrors({});

    calculate(
      DEFAULT_RD_INPUTS.monthlyDeposit,
      DEFAULT_RD_INPUTS.annualInterestRate,
      DEFAULT_RD_INPUTS.tenureValue,
      DEFAULT_RD_INPUTS.tenureUnit
    );
  }, [calculate]);

  return {
    monthlyDeposit,
    setMonthlyDeposit,
    annualInterestRate,
    setAnnualInterestRate,
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

export default useRDCalculator;

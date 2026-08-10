import { useState, useCallback, useEffect } from 'react';
import { calculateFD } from '../../../../../calculations/fd/calculateFD';
import { validateFDInput } from '../../../../../calculations/fd/fdValidation';
import { normalizeNumberInput } from '../../../../../calculations/core/validation';
import logger from '../../../../../services/logger';

export const DEFAULT_FD_INPUTS = {
  principal: '100000', // ₹1,00,000
  annualInterestRate: '7', // 7% p.a.
  tenureValue: '5', // 5 Years
  tenureUnit: 'years',
  compoundingFrequency: 'quarterly',
};

export const COMPOUNDING_OPTIONS = [
  { label: 'Quarterly (Standard)', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Half-Yearly', value: 'half-yearly' },
  { label: 'Yearly', value: 'yearly' },
];

export const useFDCalculator = () => {
  const [principal, setPrincipal] = useState(DEFAULT_FD_INPUTS.principal);
  const [annualInterestRate, setAnnualInterestRate] = useState(DEFAULT_FD_INPUTS.annualInterestRate);
  const [tenureValue, setTenureValue] = useState(DEFAULT_FD_INPUTS.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_FD_INPUTS.tenureUnit);
  const [compoundingFrequency, setCompoundingFrequency] = useState(DEFAULT_FD_INPUTS.compoundingFrequency);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const computeTenureYears = useCallback((val, unit) => {
    const numVal = normalizeNumberInput(val);
    if (numVal === null) return 0;
    return unit === 'months' ? numVal / 12 : numVal;
  }, []);

  const calculate = useCallback((amt, rate, tVal, tUnit, freq) => {
    const tenureYears = computeTenureYears(tVal, tUnit);

    const validationRes = validateFDInput(amt, rate, tenureYears, freq);
    if (validationRes && !validationRes.success) {
      const errorsObj = {};
      validationRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
      return false;
    }

    setFieldErrors({});
    logger.info('FD calculation initiated');

    const fdRes = calculateFD(amt, rate, tenureYears, freq);
    if (fdRes.success) {
      setResult(fdRes.data);
      setIsCalculated(true);
      logger.info('FD calculation completed');
      return true;
    }

    return false;
  }, [computeTenureYears]);

  useEffect(() => {
    calculate(
      DEFAULT_FD_INPUTS.principal,
      DEFAULT_FD_INPUTS.annualInterestRate,
      DEFAULT_FD_INPUTS.tenureValue,
      DEFAULT_FD_INPUTS.tenureUnit,
      DEFAULT_FD_INPUTS.compoundingFrequency
    );
  }, [calculate]);

  const handleCalculate = useCallback((customAmt, customRate, customTenureVal, customTenureUnit, customFreq) => {
    const amt = typeof customAmt === 'string' || typeof customAmt === 'number' ? customAmt : principal;
    const rate = typeof customRate === 'string' || typeof customRate === 'number' ? customRate : annualInterestRate;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    const freq = typeof customFreq === 'string' ? customFreq : compoundingFrequency;
    return calculate(amt, rate, tVal, tUnit, freq);
  }, [calculate, principal, annualInterestRate, tenureValue, tenureUnit, compoundingFrequency]);

  const handleReset = useCallback(() => {
    setPrincipal(DEFAULT_FD_INPUTS.principal);
    setAnnualInterestRate(DEFAULT_FD_INPUTS.annualInterestRate);
    setTenureValue(DEFAULT_FD_INPUTS.tenureValue);
    setTenureUnit(DEFAULT_FD_INPUTS.tenureUnit);
    setCompoundingFrequency(DEFAULT_FD_INPUTS.compoundingFrequency);
    setFieldErrors({});

    calculate(
      DEFAULT_FD_INPUTS.principal,
      DEFAULT_FD_INPUTS.annualInterestRate,
      DEFAULT_FD_INPUTS.tenureValue,
      DEFAULT_FD_INPUTS.tenureUnit,
      DEFAULT_FD_INPUTS.compoundingFrequency
    );
  }, [calculate]);

  return {
    principal,
    setPrincipal,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    compoundingFrequency,
    setCompoundingFrequency,
    fieldErrors,
    result,
    isCalculated,
    handleCalculate,
    handleReset,
  };
};

export default useFDCalculator;

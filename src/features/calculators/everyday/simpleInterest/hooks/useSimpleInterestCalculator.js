import { useState, useCallback, useEffect } from 'react';
import { calculateSimpleInterest } from '../../../../../calculations/interest/simpleInterest';
import logger from '../../../../../services/logger';

export const DEFAULT_SIMPLE_INTEREST_INPUTS = {
  principal: '100000',
  annualInterestRate: '8',
  tenureValue: '5',
  tenureUnit: 'years',
};

export const useSimpleInterestCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_SIMPLE_INTEREST_INPUTS, ...initialInputs };

  const [principal, setPrincipal] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRate] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValue] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(defaults.tenureUnit);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const compute = useCallback(
    (p, r, tValue, tUnit) => {
      let tenureInYears = parseFloat(tValue);
      if (!isNaN(tenureInYears) && tUnit === 'months') {
        tenureInYears = tenureInYears / 12;
      }

      logger.info('Simple Interest calculation initiated', { p, r, tenureInYears });
      const calculationResult = calculateSimpleInterest(p, r, tenureInYears);

      if (calculationResult.success) {
        setFieldErrors({});
        setResult(calculationResult.data);
        setIsCalculated(true);
        logger.info('Simple Interest calculation completed', calculationResult.data);
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
        logger.warn('Simple Interest calculation failed validation', errorsByField);
        return false;
      }
    },
    [],
  );

  // Initial calculation on mount
  useEffect(() => {
    compute(defaults.principal, defaults.annualInterestRate, defaults.tenureValue, defaults.tenureUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = (
    overrideP = principal,
    overrideR = annualInterestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideP, overrideR, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setPrincipal(defaults.principal);
    setAnnualInterestRate(defaults.annualInterestRate);
    setTenureValue(defaults.tenureValue);
    setTenureUnit(defaults.tenureUnit);
    setFieldErrors({});
    compute(defaults.principal, defaults.annualInterestRate, defaults.tenureValue, defaults.tenureUnit);
  }, [defaults.principal, defaults.annualInterestRate, defaults.tenureValue, defaults.tenureUnit, compute]);

  return {
    principal,
    setPrincipal,
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

export default useSimpleInterestCalculator;

import { useState, useCallback, useEffect } from 'react';
import { calculateCompoundInterest } from '../../../../../calculations/interest/compoundInterest';
import logger from '../../../../../services/logger';

export const COMPOUNDING_FREQUENCY_OPTIONS = [
  { label: 'Yearly', value: 'yearly' },
  { label: 'Half-Yearly', value: 'half-yearly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
];

export const DEFAULT_COMPOUND_INTEREST_INPUTS = {
  principal: '100000',
  annualInterestRate: '8',
  tenureValue: '5',
  tenureUnit: 'years',
  compoundingFrequency: 'yearly',
};

export const useCompoundInterestCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_COMPOUND_INTEREST_INPUTS, ...initialInputs };

  const [principal, setPrincipal] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRate] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValue] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(defaults.tenureUnit);
  const [compoundingFrequency, setCompoundingFrequency] = useState(defaults.compoundingFrequency);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const compute = useCallback(
    (p, r, tValue, tUnit, freq) => {
      let tenureInYears = parseFloat(tValue);
      if (!isNaN(tenureInYears) && tUnit === 'months') {
        tenureInYears = tenureInYears / 12;
      }

      logger.info('Compound Interest calculation initiated', { p, r, tenureInYears, freq });
      const calculationResult = calculateCompoundInterest(p, r, tenureInYears, freq);

      if (calculationResult.success) {
        setFieldErrors({});
        setResult(calculationResult.data);
        setIsCalculated(true);
        logger.info('Compound Interest calculation completed', calculationResult.data);
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
        logger.warn('Compound Interest calculation failed validation', errorsByField);
        return false;
      }
    },
    [],
  );

  // Initial calculation on mount
  useEffect(() => {
    compute(
      defaults.principal,
      defaults.annualInterestRate,
      defaults.tenureValue,
      defaults.tenureUnit,
      defaults.compoundingFrequency,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = (
    overrideP = principal,
    overrideR = annualInterestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
    overrideFreq = compoundingFrequency,
  ) => {
    return compute(overrideP, overrideR, overrideTVal, overrideTUnit, overrideFreq);
  };

  const handleReset = useCallback(() => {
    setPrincipal(defaults.principal);
    setAnnualInterestRate(defaults.annualInterestRate);
    setTenureValue(defaults.tenureValue);
    setTenureUnit(defaults.tenureUnit);
    setCompoundingFrequency(defaults.compoundingFrequency);
    setFieldErrors({});
    compute(
      defaults.principal,
      defaults.annualInterestRate,
      defaults.tenureValue,
      defaults.tenureUnit,
      defaults.compoundingFrequency,
    );
  }, [defaults.principal, defaults.annualInterestRate, defaults.tenureValue, defaults.tenureUnit, defaults.compoundingFrequency, compute]);

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

export default useCompoundInterestCalculator;

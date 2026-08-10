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

  const [principal, setPrincipalState] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRateState] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setPrincipal = (val) => {
    setPrincipalState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setAnnualInterestRate = (val) => {
    setAnnualInterestRateState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setTenureValue = (val) => {
    setTenureValueState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setTenureUnit = (val) => {
    setTenureUnitState(val);
    if (isCalculated) setIsResultStale(true);
  };

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
        setIsResultStale(false);
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
        setIsResultStale(false);
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
    setPrincipalState(DEFAULT_SIMPLE_INTEREST_INPUTS.principal);
    setAnnualInterestRateState(DEFAULT_SIMPLE_INTEREST_INPUTS.annualInterestRate);
    setTenureValueState(DEFAULT_SIMPLE_INTEREST_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_SIMPLE_INTEREST_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_SIMPLE_INTEREST_INPUTS.principal,
      DEFAULT_SIMPLE_INTEREST_INPUTS.annualInterestRate,
      DEFAULT_SIMPLE_INTEREST_INPUTS.tenureValue,
      DEFAULT_SIMPLE_INTEREST_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    principal,
    setPrincipal,
    annualInterestRate,
    setAnnualInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
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

export default useSimpleInterestCalculator;

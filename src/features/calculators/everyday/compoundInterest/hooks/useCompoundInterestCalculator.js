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

  const [principal, setPrincipalState] = useState(defaults.principal);
  const [annualInterestRate, setAnnualInterestRateState] = useState(defaults.annualInterestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [compoundingFrequency, setCompoundingFrequencyState] = useState(defaults.compoundingFrequency);
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

  const setCompoundingFrequency = (val) => {
    setCompoundingFrequencyState(val);
    if (isCalculated) setIsResultStale(true);
  };

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
        setIsResultStale(false);
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
        setIsResultStale(false);
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
    setPrincipalState(DEFAULT_COMPOUND_INTEREST_INPUTS.principal);
    setAnnualInterestRateState(DEFAULT_COMPOUND_INTEREST_INPUTS.annualInterestRate);
    setTenureValueState(DEFAULT_COMPOUND_INTEREST_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_COMPOUND_INTEREST_INPUTS.tenureUnit);
    setCompoundingFrequencyState(DEFAULT_COMPOUND_INTEREST_INPUTS.compoundingFrequency);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_COMPOUND_INTEREST_INPUTS.principal,
      DEFAULT_COMPOUND_INTEREST_INPUTS.annualInterestRate,
      DEFAULT_COMPOUND_INTEREST_INPUTS.tenureValue,
      DEFAULT_COMPOUND_INTEREST_INPUTS.tenureUnit,
      DEFAULT_COMPOUND_INTEREST_INPUTS.compoundingFrequency,
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
    compoundingFrequency,
    setCompoundingFrequency,
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

export default useCompoundInterestCalculator;

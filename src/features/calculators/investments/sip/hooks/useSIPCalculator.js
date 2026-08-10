import { useState, useCallback, useEffect } from 'react';
import { calculateSIP } from '../../../../../calculations/sip/calculateSIP';
import logger from '../../../../../services/logger';

export const DEFAULT_SIP_INPUTS = {
  monthlyInvestment: '10000',
  annualReturnRate: '12',
  tenureValue: '10',
  tenureUnit: 'years',
};

export const useSIPCalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_SIP_INPUTS, ...initialInputs };

  const [monthlyInvestment, setMonthlyInvestmentState] = useState(defaults.monthlyInvestment);
  const [annualReturnRate, setAnnualReturnRateState] = useState(defaults.annualReturnRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setMonthlyInvestment = (val) => {
    setMonthlyInvestmentState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setAnnualReturnRate = (val) => {
    setAnnualReturnRateState(val);
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

  const compute = useCallback((inv, rate, tValue, tUnit) => {
    let tenureMonths = parseFloat(tValue);
    if (!isNaN(tenureMonths) && tUnit === 'years') {
      tenureMonths = tenureMonths * 12;
    }

    logger.info('SIP calculation initiated', { inv, rate, tenureMonths });
    const calculationResult = calculateSIP(inv, rate, tenureMonths);

    if (calculationResult.success) {
      setFieldErrors({});
      setResult(calculationResult.data);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('SIP calculation completed', calculationResult.data);
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
      logger.warn('SIP calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount or when restored inputs change
  useEffect(() => {
    const currentInv = initialInputs?.monthlyInvestment || defaults.monthlyInvestment;
    const currentRate = initialInputs?.annualReturnRate || defaults.annualReturnRate;
    const currentTVal = initialInputs?.tenureValue || defaults.tenureValue;
    const currentTUnit = initialInputs?.tenureUnit || defaults.tenureUnit;

    setMonthlyInvestmentState(currentInv);
    setAnnualReturnRateState(currentRate);
    setTenureValueState(currentTVal);
    setTenureUnitState(currentTUnit);
    setEditingSavedCalculationId(initialInputs?.editingSavedCalculationId || null);
    setSavedTitle(initialInputs?.savedTitle || '');

    compute(currentInv, currentRate, currentTVal, currentTUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialInputs?.editingSavedCalculationId,
    initialInputs?.monthlyInvestment,
    initialInputs?.annualReturnRate,
    initialInputs?.tenureValue,
    initialInputs?.tenureUnit,
  ]);

  const handleCalculate = (
    overrideInv = monthlyInvestment,
    overrideRate = annualReturnRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideInv, overrideRate, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setMonthlyInvestmentState(DEFAULT_SIP_INPUTS.monthlyInvestment);
    setAnnualReturnRateState(DEFAULT_SIP_INPUTS.annualReturnRate);
    setTenureValueState(DEFAULT_SIP_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_SIP_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_SIP_INPUTS.monthlyInvestment,
      DEFAULT_SIP_INPUTS.annualReturnRate,
      DEFAULT_SIP_INPUTS.tenureValue,
      DEFAULT_SIP_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    monthlyInvestment,
    setMonthlyInvestment,
    annualReturnRate,
    setAnnualReturnRate,
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

export default useSIPCalculator;

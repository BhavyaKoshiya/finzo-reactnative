import { useState, useCallback, useEffect } from 'react';
import { calculateEMI, calculateAmortization } from '../../../../calculations/emi';
import logger from '../../../../services/logger';

export const DEFAULT_EMI_INPUTS = {
  loanAmount: '1000000',
  interestRate: '8.5',
  tenureValue: '5',
  tenureUnit: 'years',
};

export const useEMICalculator = (initialInputs = {}) => {
  const defaults = { ...DEFAULT_EMI_INPUTS, ...initialInputs };

  const [loanAmount, setLoanAmountState] = useState(defaults.loanAmount);
  const [interestRate, setInterestRateState] = useState(defaults.interestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs.savedTitle || '');

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isResultStale, setIsResultStale] = useState(false);

  const setLoanAmount = (val) => {
    setLoanAmountState(val);
    if (isCalculated) setIsResultStale(true);
  };

  const setInterestRate = (val) => {
    setInterestRateState(val);
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

  const compute = useCallback((amt, rate, tValue, tUnit) => {
    let tenureMonths = parseFloat(tValue);
    if (!isNaN(tenureMonths) && tUnit === 'years') {
      tenureMonths = tenureMonths * 12;
    }

    logger.info('EMI calculation initiated', { amt, rate, tenureMonths });
    const emiResult = calculateEMI(amt, rate, tenureMonths);

    if (emiResult.success) {
      const scheduleResult = calculateAmortization(amt, rate, tenureMonths);
      setFieldErrors({});
      setResult(emiResult.data);
      setAmortizationSchedule(scheduleResult.success ? scheduleResult.data.schedule : null);
      setIsCalculated(true);
      setIsResultStale(false);
      logger.info('EMI calculation completed', emiResult.data);
      return true;
    } else {
      const errorsByField = {};
      if (Array.isArray(emiResult.errors)) {
        emiResult.errors.forEach((err) => {
          errorsByField[err.field] = err.message;
        });
      }
      setFieldErrors(errorsByField);
      setResult(null);
      setAmortizationSchedule(null);
      setIsCalculated(false);
      setIsResultStale(false);
      logger.warn('EMI calculation failed validation', errorsByField);
      return false;
    }
  }, []);

  // Initial calculation on mount
  useEffect(() => {
    compute(defaults.loanAmount, defaults.interestRate, defaults.tenureValue, defaults.tenureUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = (
    overrideAmt = loanAmount,
    overrideRate = interestRate,
    overrideTVal = tenureValue,
    overrideTUnit = tenureUnit,
  ) => {
    return compute(overrideAmt, overrideRate, overrideTVal, overrideTUnit);
  };

  const handleReset = useCallback(() => {
    setLoanAmountState(DEFAULT_EMI_INPUTS.loanAmount);
    setInterestRateState(DEFAULT_EMI_INPUTS.interestRate);
    setTenureValueState(DEFAULT_EMI_INPUTS.tenureValue);
    setTenureUnitState(DEFAULT_EMI_INPUTS.tenureUnit);
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(
      DEFAULT_EMI_INPUTS.loanAmount,
      DEFAULT_EMI_INPUTS.interestRate,
      DEFAULT_EMI_INPUTS.tenureValue,
      DEFAULT_EMI_INPUTS.tenureUnit,
    );
  }, [compute]);

  return {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    editingSavedCalculationId,
    savedTitle,
    fieldErrors,
    result,
    amortizationSchedule,
    isCalculated,
    isResultStale,
    handleCalculate,
    handleReset,
  };
};

export default useEMICalculator;

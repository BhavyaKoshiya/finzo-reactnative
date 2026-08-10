import { useState, useCallback, useEffect } from 'react';
import { calculateEMI, calculateAmortization } from '../../../../calculations/emi';
import logger from '../../../../services/logger';

export const useLoanCalculator = (loanConfig = {}, initialInputs = {}) => {
  const configDefaults = loanConfig?.defaults || {};
  const defaults = {
    loanAmount: initialInputs?.loanAmount || configDefaults.loanAmount || '1000000',
    interestRate: initialInputs?.interestRate || configDefaults.interestRate || '8.5',
    tenureValue: initialInputs?.tenureValue || configDefaults.tenureValue || '5',
    tenureUnit: initialInputs?.tenureUnit || configDefaults.tenureUnit || 'years',
  };

  const [loanAmount, setLoanAmountState] = useState(defaults.loanAmount);
  const [interestRate, setInterestRateState] = useState(defaults.interestRate);
  const [tenureValue, setTenureValueState] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnitState] = useState(defaults.tenureUnit);
  const [editingSavedCalculationId, setEditingSavedCalculationId] = useState(initialInputs?.editingSavedCalculationId || null);
  const [savedTitle, setSavedTitle] = useState(initialInputs?.savedTitle || '');

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

  const compute = useCallback(
    (amt, rate, tValue, tUnit) => {
      let tenureMonths = parseFloat(tValue);
      if (!isNaN(tenureMonths) && tUnit === 'years') {
        tenureMonths = tenureMonths * 12;
      }

      logger.info(`${loanConfig.title || 'Loan'} calculation initiated`, { amt, rate, tenureMonths });
      const emiResult = calculateEMI(amt, rate, tenureMonths);

      if (emiResult.success) {
        const scheduleResult = calculateAmortization(amt, rate, tenureMonths);
        setFieldErrors({});
        setResult(emiResult.data);
        setAmortizationSchedule(scheduleResult.success ? scheduleResult.data.schedule : null);
        setIsCalculated(true);
        setIsResultStale(false);
        logger.info(`${loanConfig.title || 'Loan'} calculation completed`, emiResult.data);
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
        logger.warn(`${loanConfig.title || 'Loan'} calculation failed validation`, errorsByField);
        return false;
      }
    },
    [loanConfig.title],
  );

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
    const freshDefaults = loanConfig?.defaults || {
      loanAmount: '1000000',
      interestRate: '8.5',
      tenureValue: '5',
      tenureUnit: 'years',
    };
    setLoanAmountState(freshDefaults.loanAmount);
    setInterestRateState(freshDefaults.interestRate);
    setTenureValueState(freshDefaults.tenureValue);
    setTenureUnitState(freshDefaults.tenureUnit || 'years');
    setEditingSavedCalculationId(null);
    setSavedTitle('');
    setFieldErrors({});
    compute(freshDefaults.loanAmount, freshDefaults.interestRate, freshDefaults.tenureValue, freshDefaults.tenureUnit || 'years');
  }, [loanConfig, compute]);

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

export default useLoanCalculator;

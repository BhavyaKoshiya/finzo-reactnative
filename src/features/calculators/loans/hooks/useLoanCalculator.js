import { useState, useCallback, useEffect } from 'react';
import { calculateEMI, calculateAmortization, validateEMIInput } from '../../../../calculations/emi';
import { normalizeNumberInput } from '../../../../calculations/core/validation';
import logger from '../../../../services/logger';

export const useLoanCalculator = (loanConfig) => {
  const defaults = loanConfig?.defaults || {
    loanAmount: '1000000',
    interestRate: '8.5',
    tenureValue: '5',
    tenureUnit: 'years',
  };

  const [loanAmount, setLoanAmount] = useState(defaults.loanAmount);
  const [interestRate, setInterestRate] = useState(defaults.interestRate);
  const [tenureValue, setTenureValue] = useState(defaults.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(defaults.tenureUnit);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isAmortizationExpanded, setIsAmortizationExpanded] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState('monthly'); // 'monthly' | 'yearly'

  const computeTenureMonths = useCallback((val, unit) => {
    const numVal = normalizeNumberInput(val);
    if (numVal === null) return 0;
    return unit === 'years' ? Math.round(numVal * 12) : Math.round(numVal);
  }, []);

  const calculate = useCallback((amount, rate, tVal, tUnit) => {
    const tenureMonths = computeTenureMonths(tVal, tUnit);

    const validationRes = validateEMIInput(amount, rate, tenureMonths);
    if (validationRes && !validationRes.success) {
      const errorsObj = {};
      validationRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
      return false;
    }

    setFieldErrors({});
    logger.info(`${loanConfig?.title || 'Loan'} calculation initiated`);

    const emiRes = calculateEMI(amount, rate, tenureMonths);
    const amortRes = calculateAmortization(amount, rate, tenureMonths);

    if (emiRes.success && amortRes.success) {
      setResult(emiRes.data);
      setAmortizationSchedule(amortRes.data.schedule);
      setIsCalculated(true);
      logger.info(`${loanConfig?.title || 'Loan'} calculation completed`);
      return true;
    }

    return false;
  }, [computeTenureMonths, loanConfig?.title]);

  // Initial calculation on mount or config change
  useEffect(() => {
    setLoanAmount(defaults.loanAmount);
    setInterestRate(defaults.interestRate);
    setTenureValue(defaults.tenureValue);
    setTenureUnit(defaults.tenureUnit);
    calculate(defaults.loanAmount, defaults.interestRate, defaults.tenureValue, defaults.tenureUnit);
  }, [defaults.loanAmount, defaults.interestRate, defaults.tenureValue, defaults.tenureUnit, calculate]);

  const handleCalculate = useCallback((customAmount, customRate, customTenureVal, customTenureUnit) => {
    const amt = typeof customAmount === 'string' || typeof customAmount === 'number' ? customAmount : loanAmount;
    const rate = typeof customRate === 'string' || typeof customRate === 'number' ? customRate : interestRate;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    return calculate(amt, rate, tVal, tUnit);
  }, [calculate, loanAmount, interestRate, tenureValue, tenureUnit]);

  const handleReset = useCallback(() => {
    setLoanAmount(defaults.loanAmount);
    setInterestRate(defaults.interestRate);
    setTenureValue(defaults.tenureValue);
    setTenureUnit(defaults.tenureUnit);
    setFieldErrors({});
    setIsAmortizationExpanded(false);
    setScheduleViewMode('monthly');

    calculate(defaults.loanAmount, defaults.interestRate, defaults.tenureValue, defaults.tenureUnit);
  }, [defaults.loanAmount, defaults.interestRate, defaults.tenureValue, defaults.tenureUnit, calculate]);

  return {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureValue,
    setTenureValue,
    tenureUnit,
    setTenureUnit,
    fieldErrors,
    result,
    amortizationSchedule,
    isCalculated,
    isAmortizationExpanded,
    setIsAmortizationExpanded,
    scheduleViewMode,
    setScheduleViewMode,
    handleCalculate,
    handleReset,
  };
};

export default useLoanCalculator;

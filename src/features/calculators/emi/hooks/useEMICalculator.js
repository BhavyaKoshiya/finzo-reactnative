import { useState, useCallback, useEffect } from 'react';
import { calculateEMI, calculateAmortization, validateEMIInput } from '../../../../calculations/emi';
import { normalizeNumberInput } from '../../../../calculations/core/validation';
import logger from '../../../../services/logger';

export const DEFAULT_EMI_INPUTS = {
  loanAmount: '1000000', // ₹10,00,000
  interestRate: '8.5', // 8.5% p.a.
  tenureValue: '5', // 5 Years
  tenureUnit: 'years', // 'years' | 'months'
};

export const useEMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(DEFAULT_EMI_INPUTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULT_EMI_INPUTS.interestRate);
  const [tenureValue, setTenureValue] = useState(DEFAULT_EMI_INPUTS.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_EMI_INPUTS.tenureUnit);

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
    logger.info('EMI calculation initiated');

    const emiRes = calculateEMI(amount, rate, tenureMonths);
    const amortRes = calculateAmortization(amount, rate, tenureMonths);

    if (emiRes.success && amortRes.success) {
      setResult(emiRes.data);
      setAmortizationSchedule(amortRes.data.schedule);
      setIsCalculated(true);
      logger.info('EMI calculation completed');
      return true;
    }

    return false;
  }, [computeTenureMonths]);

  // Perform initial calculation on mount using default values
  useEffect(() => {
    calculate(
      DEFAULT_EMI_INPUTS.loanAmount,
      DEFAULT_EMI_INPUTS.interestRate,
      DEFAULT_EMI_INPUTS.tenureValue,
      DEFAULT_EMI_INPUTS.tenureUnit
    );
  }, [calculate]);

  const handleCalculate = useCallback((customAmount, customRate, customTenureVal, customTenureUnit) => {
    const amt = typeof customAmount === 'string' || typeof customAmount === 'number' ? customAmount : loanAmount;
    const rate = typeof customRate === 'string' || typeof customRate === 'number' ? customRate : interestRate;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    return calculate(amt, rate, tVal, tUnit);
  }, [calculate, loanAmount, interestRate, tenureValue, tenureUnit]);

  const handleReset = useCallback(() => {
    setLoanAmount(DEFAULT_EMI_INPUTS.loanAmount);
    setInterestRate(DEFAULT_EMI_INPUTS.interestRate);
    setTenureValue(DEFAULT_EMI_INPUTS.tenureValue);
    setTenureUnit(DEFAULT_EMI_INPUTS.tenureUnit);
    setFieldErrors({});
    setIsAmortizationExpanded(false);
    setScheduleViewMode('monthly');

    calculate(
      DEFAULT_EMI_INPUTS.loanAmount,
      DEFAULT_EMI_INPUTS.interestRate,
      DEFAULT_EMI_INPUTS.tenureValue,
      DEFAULT_EMI_INPUTS.tenureUnit
    );
  }, [calculate]);

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

export default useEMICalculator;

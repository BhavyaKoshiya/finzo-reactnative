import { useState, useCallback, useEffect } from 'react';
import { calculateSIP } from '../../../../../calculations/sip/calculateSIP';
import { validateSIPInput } from '../../../../../calculations/sip/sipValidation';
import { normalizeNumberInput } from '../../../../../calculations/core/validation';
import logger from '../../../../../services/logger';

export const DEFAULT_SIP_INPUTS = {
  monthlyInvestment: '10000', // ₹10,000 / month
  annualReturnRate: '12', // 12% p.a. expected return
  tenureValue: '10', // 10 Years
  tenureUnit: 'years',
};

export const useSIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(DEFAULT_SIP_INPUTS.monthlyInvestment);
  const [annualReturnRate, setAnnualReturnRate] = useState(DEFAULT_SIP_INPUTS.annualReturnRate);
  const [tenureValue, setTenureValue] = useState(DEFAULT_SIP_INPUTS.tenureValue);
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_SIP_INPUTS.tenureUnit);

  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const computeTenureMonths = useCallback((val, unit) => {
    const numVal = normalizeNumberInput(val);
    if (numVal === null) return 0;
    return unit === 'years' ? Math.round(numVal * 12) : Math.round(numVal);
  }, []);

  const calculate = useCallback((amount, rate, tVal, tUnit) => {
    const tenureMonths = computeTenureMonths(tVal, tUnit);

    const validationRes = validateSIPInput(amount, rate, tenureMonths);
    if (validationRes && !validationRes.success) {
      const errorsObj = {};
      validationRes.errors.forEach((err) => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
      return false;
    }

    setFieldErrors({});
    logger.info('SIP calculation initiated');

    const sipRes = calculateSIP(amount, rate, tenureMonths);
    if (sipRes.success) {
      setResult(sipRes.data);
      setIsCalculated(true);
      logger.info('SIP calculation completed');
      return true;
    }

    return false;
  }, [computeTenureMonths]);

  useEffect(() => {
    calculate(
      DEFAULT_SIP_INPUTS.monthlyInvestment,
      DEFAULT_SIP_INPUTS.annualReturnRate,
      DEFAULT_SIP_INPUTS.tenureValue,
      DEFAULT_SIP_INPUTS.tenureUnit
    );
  }, [calculate]);

  const handleCalculate = useCallback((customAmount, customRate, customTenureVal, customTenureUnit) => {
    const amt = typeof customAmount === 'string' || typeof customAmount === 'number' ? customAmount : monthlyInvestment;
    const rate = typeof customRate === 'string' || typeof customRate === 'number' ? customRate : annualReturnRate;
    const tVal = typeof customTenureVal === 'string' || typeof customTenureVal === 'number' ? customTenureVal : tenureValue;
    const tUnit = typeof customTenureUnit === 'string' ? customTenureUnit : tenureUnit;
    return calculate(amt, rate, tVal, tUnit);
  }, [calculate, monthlyInvestment, annualReturnRate, tenureValue, tenureUnit]);

  const handleReset = useCallback(() => {
    setMonthlyInvestment(DEFAULT_SIP_INPUTS.monthlyInvestment);
    setAnnualReturnRate(DEFAULT_SIP_INPUTS.annualReturnRate);
    setTenureValue(DEFAULT_SIP_INPUTS.tenureValue);
    setTenureUnit(DEFAULT_SIP_INPUTS.tenureUnit);
    setFieldErrors({});

    calculate(
      DEFAULT_SIP_INPUTS.monthlyInvestment,
      DEFAULT_SIP_INPUTS.annualReturnRate,
      DEFAULT_SIP_INPUTS.tenureValue,
      DEFAULT_SIP_INPUTS.tenureUnit
    );
  }, [calculate]);

  return {
    monthlyInvestment,
    setMonthlyInvestment,
    annualReturnRate,
    setAnnualReturnRate,
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

export default useSIPCalculator;

import { useState, useMemo, useCallback } from 'react';
import { RATE_ADJUSTMENT_STRATEGIES, createRateRevision } from '../types/rateRevisionTypes';
import { applyRateRevision } from '../utils/applyRateRevision';

export const useRateRevisionForm = ({
  loan = null,
  initialValues = {},
} = {}) => {
  const isEditMode = Boolean(initialValues && initialValues.id);

  const currentRate = Number(loan?.annualInterestRate) || 0;
  const currentEmi = Number(loan?.emiAmount) || 0;
  const remainingTenure = loan?.remainingTenure || {};
  const currentRemainingTenureMonths = remainingTenure.unit === 'years'
    ? (Number(remainingTenure.value) || 0) * 12
    : (Number(remainingTenure.value) || 0);
  const currentOutstanding = Number(loan?.currentOutstandingPrincipal) || Number(loan?.originalPrincipal) || 0;

  // Form states
  const [newRate, setNewRate] = useState(
    initialValues?.newRate !== undefined && initialValues?.newRate !== null
      ? String(initialValues.newRate)
      : ''
  );
  const [effectiveDate, setEffectiveDate] = useState(
    initialValues?.effectiveDate || new Date().toISOString().split('T')[0]
  );
  const [adjustmentStrategy, setAdjustmentStrategy] = useState(
    initialValues?.adjustmentStrategy || RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI
  );
  const [showBankOverride, setShowBankOverride] = useState(
    Boolean(initialValues?.exactNewEmi || initialValues?.exactNewTenureMonths)
  );
  const [exactNewEmi, setExactNewEmi] = useState(
    initialValues?.exactNewEmi !== undefined && initialValues?.exactNewEmi !== null
      ? String(initialValues.exactNewEmi)
      : ''
  );
  const [exactNewTenureMonths, setExactNewTenureMonths] = useState(
    initialValues?.exactNewTenureMonths !== undefined && initialValues?.exactNewTenureMonths !== null
      ? String(initialValues.exactNewTenureMonths)
      : ''
  );
  const [note, setNote] = useState(initialValues?.note || '');
  const [errors, setErrors] = useState({});

  // Real-time calculation of revision impact
  const calculationResult = useMemo(() => {
    return applyRateRevision({
      loan,
      newRate,
      strategy: adjustmentStrategy,
      exactNewEmi: showBankOverride && exactNewEmi ? exactNewEmi : null,
      exactNewTenureMonths: showBankOverride && exactNewTenureMonths ? exactNewTenureMonths : null,
    });
  }, [loan, newRate, adjustmentStrategy, showBankOverride, exactNewEmi, exactNewTenureMonths]);

  const parsedNewRate = Number(newRate);
  const rateDelta = !isNaN(parsedNewRate) && parsedNewRate > 0
    ? parsedNewRate - currentRate
    : 0;

  const validate = useCallback(() => {
    const errs = {};

    if (!newRate || isNaN(Number(newRate)) || Number(newRate) <= 0) {
      errs.newRate = 'Please enter a valid interest rate greater than 0%';
    } else if (Number(newRate) > 60) {
      errs.newRate = 'Interest rate cannot exceed 60%';
    }

    if (!effectiveDate || !effectiveDate.trim()) {
      errs.effectiveDate = 'Effective date is required';
    }

    if (adjustmentStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE && calculationResult.isNegativeAmortization) {
      errs.adjustmentStrategy = 'Current EMI cannot cover interest at this rate. Switch to Adjust EMI.';
    }

    if (showBankOverride) {
      if (adjustmentStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI && exactNewEmi) {
        if (isNaN(Number(exactNewEmi)) || Number(exactNewEmi) <= 0) {
          errs.exactNewEmi = 'Bank EMI must be greater than ₹0';
        }
      }
      if (adjustmentStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE && exactNewTenureMonths) {
        if (isNaN(Number(exactNewTenureMonths)) || Number(exactNewTenureMonths) <= 0) {
          errs.exactNewTenureMonths = 'Bank tenure must be greater than 0 months';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [
    newRate,
    effectiveDate,
    adjustmentStrategy,
    calculationResult.isNegativeAmortization,
    showBankOverride,
    exactNewEmi,
    exactNewTenureMonths,
  ]);

  const buildRevisionRecord = useCallback(() => {
    return createRateRevision({
      id: initialValues?.id,
      loanId: loan?.id,
      previousRate: currentRate,
      newRate: Number(newRate),
      effectiveDate,
      adjustmentStrategy,
      calculatedNewEmi: calculationResult.calculatedNewEmi,
      calculatedNewTenureMonths: calculationResult.calculatedNewTenureMonths,
      exactNewEmi: showBankOverride && exactNewEmi ? Number(exactNewEmi) : null,
      exactNewTenureMonths: showBankOverride && exactNewTenureMonths ? Math.round(Number(exactNewTenureMonths)) : null,
      appliedNewEmi: calculationResult.appliedNewEmi,
      appliedNewTenureMonths: calculationResult.appliedNewTenureMonths,
      outstandingAtRevision: currentOutstanding,
      previousEmi: currentEmi,
      previousRemainingTenureMonths: currentRemainingTenureMonths,
      note,
      createdAt: initialValues?.createdAt,
    });
  }, [
    initialValues,
    loan,
    currentRate,
    newRate,
    effectiveDate,
    adjustmentStrategy,
    calculationResult,
    showBankOverride,
    exactNewEmi,
    exactNewTenureMonths,
    currentOutstanding,
    currentEmi,
    currentRemainingTenureMonths,
    note,
  ]);

  return {
    isEditMode,
    currentRate,
    currentEmi,
    currentRemainingTenureMonths,
    currentOutstanding,
    rateDelta,

    // Form fields & setters
    newRate,
    setNewRate,
    effectiveDate,
    setEffectiveDate,
    adjustmentStrategy,
    setAdjustmentStrategy,
    showBankOverride,
    setShowBankOverride,
    exactNewEmi,
    setExactNewEmi,
    exactNewTenureMonths,
    setExactNewTenureMonths,
    note,
    setNote,

    // Calculation & validation
    calculationResult,
    errors,
    setErrors,
    validate,
    buildRevisionRecord,
  };
};

export default useRateRevisionForm;

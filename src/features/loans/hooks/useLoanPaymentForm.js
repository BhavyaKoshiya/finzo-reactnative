import { useState, useCallback, useEffect, useMemo } from 'react';
import { validateLoanPaymentInput } from '../utils/loanPaymentValidation';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';
import { calculateEmiBreakdown } from '../utils/loanBalanceUtils';
import { createPaymentPreview } from '../utils/paymentBalanceUtils';

export const useLoanPaymentForm = ({
  initialValues = {},
  currentLoanOutstanding = 0,
  annualInterestRate = 0,
  setEmiAmount = 0,
  loan = null,
  payments = [],
} = {}) => {
  const isEditMode = Boolean(initialValues && initialValues.id);

  // Normalize initial payment type
  const initialType = initialValues.paymentType || PAYMENT_TYPES.REGULAR_EMI;
  const defaultInitialAmount = initialValues.amount !== undefined && initialValues.amount !== null
    ? initialValues.amount
    : (initialType === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0 ? setEmiAmount : '');

  const [loanId, setLoanId] = useState(initialValues.loanId || loan?.id || '');
  const [paymentType, setPaymentType] = useState(initialType);
  const [useScheduledEmi, setUseScheduledEmi] = useState(
    initialType === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0 && String(defaultInitialAmount) === String(setEmiAmount)
  );
  const [amount, setAmount] = useState(defaultInitialAmount);
  const [paymentDate, setPaymentDate] = useState(initialValues.paymentDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initialValues.dueDate || '');

  // Actual bank statement values (optional)
  const [actualInterest, setActualInterest] = useState(
    initialValues.interestAmount !== undefined && initialValues.interestAmount !== null ? initialValues.interestAmount : ''
  );
  const [actualPrincipal, setActualPrincipal] = useState(
    initialValues.principalAmount !== undefined && initialValues.principalAmount !== null ? initialValues.principalAmount : ''
  );
  const [actualClosingBalance, setActualClosingBalance] = useState(
    initialValues.actualClosingBalance !== undefined && initialValues.actualClosingBalance !== null ? initialValues.actualClosingBalance : ''
  );
  const [isBankConfirmed, setIsBankConfirmed] = useState(
    initialValues.balanceSource === BALANCE_SOURCES.BANK_CONFIRMED
  );

  const [principalAmount, setPrincipalAmount] = useState(initialValues.principalAmount !== undefined && initialValues.principalAmount !== null ? initialValues.principalAmount : '');
  const [interestAmount, setInterestAmount] = useState(initialValues.interestAmount !== undefined && initialValues.interestAmount !== null ? initialValues.interestAmount : '');
  const [feesAmount, setFeesAmount] = useState(initialValues.feesAmount !== undefined && initialValues.feesAmount !== null ? initialValues.feesAmount : '');

  const [balanceUpdated, setBalanceUpdated] = useState(
    initialValues.balanceUpdated !== undefined ? initialValues.balanceUpdated : true
  );

  const [outstandingBefore, setOutstandingBefore] = useState(
    initialValues.outstandingBefore !== undefined && initialValues.outstandingBefore !== null
      ? initialValues.outstandingBefore
      : currentLoanOutstanding
  );

  const initialBreakdown = calculateEmiBreakdown({
    currentOutstanding: currentLoanOutstanding,
    annualInterestRate,
    amount: defaultInitialAmount,
    paymentType: initialType,
    userPrincipal: initialValues.principalAmount,
  });

  const [outstandingAfter, setOutstandingAfter] = useState(
    initialValues.outstandingAfter !== undefined && initialValues.outstandingAfter !== null
      ? initialValues.outstandingAfter
      : initialBreakdown.newOutstanding
  );

  const [isOutstandingUserEdited, setIsOutstandingUserEdited] = useState(false);
  const [isBreakdownUserEdited, setIsBreakdownUserEdited] = useState(
    Boolean(initialValues.principalAmount || initialValues.interestAmount)
  );

  const [note, setNote] = useState(initialValues.note || '');
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Dynamic preview calculation
  const preview = useMemo(() => {
    return createPaymentPreview({
      loan: loan || { id: loanId, annualInterestRate, currentOutstandingPrincipal: currentLoanOutstanding },
      payments,
      paymentType,
      amount,
      userPrincipal: actualPrincipal || principalAmount,
    });
  }, [loan, loanId, annualInterestRate, currentLoanOutstanding, payments, paymentType, amount, actualPrincipal, principalAmount]);

  // Auto-recalculate breakdown & outstandingAfter when amount/paymentType changes
  useEffect(() => {
    if (!isEditMode && currentLoanOutstanding > 0) {
      const breakdown = calculateEmiBreakdown({
        currentOutstanding: currentLoanOutstanding,
        annualInterestRate,
        amount,
        paymentType,
        userPrincipal: isBreakdownUserEdited ? (actualPrincipal || principalAmount) : '',
      });

      if (!isBreakdownUserEdited && Number(amount) > 0) {
        setPrincipalAmount(breakdown.principalPaid);
        setInterestAmount(breakdown.interestPaid);
      }

      if (!isOutstandingUserEdited) {
        setOutstandingAfter(breakdown.newOutstanding);
      }
    }
  }, [
    amount,
    paymentType,
    currentLoanOutstanding,
    annualInterestRate,
    isEditMode,
    isOutstandingUserEdited,
    isBreakdownUserEdited,
    principalAmount,
    actualPrincipal,
  ]);

  const validate = useCallback(() => {
    const input = {
      loanId,
      amount,
      paymentDate,
      dueDate,
      paymentType,
      principalAmount: actualPrincipal !== '' ? actualPrincipal : principalAmount,
      interestAmount: actualInterest !== '' ? actualInterest : interestAmount,
      feesAmount,
      outstandingBefore,
      outstandingAfter,
      balanceUpdated,
      note,
    };

    const res = validateLoanPaymentInput(input);
    setErrors(res.errors);
    setWarnings(res.warnings);
    return res.isValid;
  }, [
    loanId,
    amount,
    paymentDate,
    dueDate,
    paymentType,
    principalAmount,
    actualPrincipal,
    interestAmount,
    actualInterest,
    feesAmount,
    outstandingBefore,
    outstandingAfter,
    balanceUpdated,
    note,
  ]);

  const getPaymentPayload = useCallback(() => {
    const isActualClosingProvided = actualClosingBalance !== null && actualClosingBalance !== undefined && actualClosingBalance !== '';
    const finalBalanceSource = (isBankConfirmed || isActualClosingProvided) ? BALANCE_SOURCES.BANK_CONFIRMED : BALANCE_SOURCES.ESTIMATED;
    const finalClosing = isActualClosingProvided ? Number(actualClosingBalance) : Number(outstandingAfter);

    const calculationSnapshot = {
      annualRate: annualInterestRate,
      interestMethod: 'monthly_reducing',
      openingBalance: preview.openingBalance,
      estimatedInterest: preview.estimatedInterest,
      estimatedPrincipal: preview.estimatedPrincipal,
      estimatedClosingBalance: preview.estimatedClosingBalance,
    };

    return createLoanPayment({
      id: initialValues.id,
      schemaVersion: initialValues.schemaVersion,
      loanId,
      amount: Number(amount) || 0,
      paymentDate,
      dueDate: dueDate || null,
      paymentType,
      principalAmount: actualPrincipal !== '' ? Number(actualPrincipal) : preview.estimatedPrincipal,
      interestAmount: actualInterest !== '' ? Number(actualInterest) : preview.estimatedInterest,
      feesAmount: feesAmount !== '' ? Number(feesAmount) : 0,
      outstandingBefore: balanceUpdated ? preview.openingBalance : null,
      outstandingAfter: balanceUpdated ? finalClosing : null,
      actualClosingBalance: isActualClosingProvided ? Number(actualClosingBalance) : null,
      balanceSource: finalBalanceSource,
      balanceUpdated,
      calculationSnapshot,
      note,
      createdAt: initialValues.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }, [
    initialValues,
    loanId,
    amount,
    paymentDate,
    dueDate,
    paymentType,
    actualPrincipal,
    actualInterest,
    feesAmount,
    balanceUpdated,
    actualClosingBalance,
    isBankConfirmed,
    outstandingAfter,
    preview,
    annualInterestRate,
    note,
  ]);

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setIsBreakdownUserEdited(false);
    setIsOutstandingUserEdited(false);

    if (type === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0) {
      setAmount(setEmiAmount);
      setUseScheduledEmi(true);
    } else {
      setUseScheduledEmi(false);
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    if (setEmiAmount > 0 && String(val) !== String(setEmiAmount)) {
      setUseScheduledEmi(false);
    }
  };

  const handleUseScheduledEmiToggle = (checked) => {
    setUseScheduledEmi(checked);
    if (checked && setEmiAmount > 0) {
      setPaymentType(PAYMENT_TYPES.REGULAR_EMI);
      setAmount(setEmiAmount);
      setIsBreakdownUserEdited(false);
    }
  };

  const handleQuickFillEmi = () => {
    if (setEmiAmount > 0) {
      setPaymentType(PAYMENT_TYPES.REGULAR_EMI);
      setAmount(setEmiAmount);
      setUseScheduledEmi(true);
      setIsBreakdownUserEdited(false);
      setIsOutstandingUserEdited(false);
    }
  };

  return {
    isEditMode,
    loanId,
    setLoanId,
    amount,
    setAmount: handleAmountChange,
    useScheduledEmi,
    setUseScheduledEmi: handleUseScheduledEmiToggle,
    paymentDate,
    setPaymentDate,
    dueDate,
    setDueDate,
    paymentType,
    setPaymentType: handlePaymentTypeChange,
    principalAmount,
    setPrincipalAmount,
    interestAmount,
    setInterestAmount,
    actualInterest,
    setActualInterest,
    actualPrincipal,
    setActualPrincipal,
    actualClosingBalance,
    setActualClosingBalance,
    isBankConfirmed,
    setIsBankConfirmed,
    feesAmount,
    setFeesAmount,
    balanceUpdated,
    setBalanceUpdated,
    outstandingBefore,
    setOutstandingBefore,
    outstandingAfter,
    setOutstandingAfter,
    setEmiAmount,
    handleQuickFillEmi,
    preview,
    note,
    setNote,
    errors,
    warnings,
    validate,
    getPaymentPayload,
  };
};

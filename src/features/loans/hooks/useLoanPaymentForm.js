import { useState, useCallback, useEffect } from 'react';
import { validateLoanPaymentInput } from '../utils/loanPaymentValidation';
import { createLoanPayment } from '../types/loanPaymentTypes';
import { PAYMENT_TYPES, BALANCE_SOURCES } from '../constants/loanPaymentConstants';
import { calculateEmiBreakdown } from '../utils/loanBalanceUtils';

export const useLoanPaymentForm = ({
  initialValues = {},
  currentLoanOutstanding = 0,
  annualInterestRate = 0,
  setEmiAmount = 0,
} = {}) => {
  const isEditMode = Boolean(initialValues && initialValues.id);

  // Normalize initial payment type
  const initialType = initialValues.paymentType || PAYMENT_TYPES.REGULAR_EMI;
  const defaultInitialAmount = initialValues.amount !== undefined && initialValues.amount !== null
    ? initialValues.amount
    : (initialType === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0 ? setEmiAmount : '');

  const [loanId, setLoanId] = useState(initialValues.loanId || '');
  const [paymentType, setPaymentType] = useState(initialType);
  const [amount, setAmount] = useState(defaultInitialAmount);
  const [paymentDate, setPaymentDate] = useState(initialValues.paymentDate || new Date().toISOString().split('T')[0]);
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

  const [actualClosingBalance, setActualClosingBalance] = useState(
    initialValues.actualClosingBalance !== undefined ? initialValues.actualClosingBalance : null
  );

  const [isOutstandingUserEdited, setIsOutstandingUserEdited] = useState(false);
  const [isBreakdownUserEdited, setIsBreakdownUserEdited] = useState(
    Boolean(initialValues.principalAmount || initialValues.interestAmount)
  );

  const [note, setNote] = useState(initialValues.note || '');
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Auto-recalculate breakdown & outstandingAfter when amount/paymentType changes
  useEffect(() => {
    if (!isEditMode && currentLoanOutstanding > 0) {
      const breakdown = calculateEmiBreakdown({
        currentOutstanding: currentLoanOutstanding,
        annualInterestRate,
        amount,
        paymentType,
        userPrincipal: isBreakdownUserEdited ? principalAmount : '',
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
  ]);

  const validate = useCallback(() => {
    const input = {
      loanId,
      amount,
      paymentDate,
      paymentType,
      principalAmount,
      interestAmount,
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
    paymentType,
    principalAmount,
    interestAmount,
    feesAmount,
    outstandingBefore,
    outstandingAfter,
    balanceUpdated,
    note,
  ]);

  const getPaymentPayload = useCallback(() => {
    const isActualProvided = actualClosingBalance !== null && actualClosingBalance !== undefined && actualClosingBalance !== '';
    const finalBalanceSource = isActualProvided ? BALANCE_SOURCES.BANK_CONFIRMED : BALANCE_SOURCES.ESTIMATED;
    const finalClosing = isActualProvided ? Number(actualClosingBalance) : Number(outstandingAfter);

    return createLoanPayment({
      id: initialValues.id,
      schemaVersion: initialValues.schemaVersion,
      loanId,
      amount,
      paymentDate,
      paymentType,
      principalAmount,
      interestAmount,
      feesAmount,
      outstandingBefore: balanceUpdated ? outstandingBefore : null,
      outstandingAfter: balanceUpdated ? finalClosing : null,
      actualClosingBalance: isActualProvided ? Number(actualClosingBalance) : null,
      balanceSource: finalBalanceSource,
      balanceUpdated,
      note,
      createdAt: initialValues.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }, [
    initialValues,
    loanId,
    amount,
    paymentDate,
    paymentType,
    principalAmount,
    interestAmount,
    feesAmount,
    outstandingBefore,
    outstandingAfter,
    actualClosingBalance,
    balanceUpdated,
    note,
  ]);

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setIsBreakdownUserEdited(false);
    setIsOutstandingUserEdited(false);

    if (type === PAYMENT_TYPES.REGULAR_EMI && setEmiAmount > 0) {
      setAmount(setEmiAmount);
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
  };

  const handleQuickFillEmi = () => {
    if (setEmiAmount > 0) {
      setPaymentType(PAYMENT_TYPES.REGULAR_EMI);
      setAmount(setEmiAmount);
      setIsBreakdownUserEdited(false);
      setIsOutstandingUserEdited(false);
    }
  };

  const handlePrincipalChange = (val) => {
    setPrincipalAmount(val);
    setIsBreakdownUserEdited(true);
  };

  const handleInterestChange = (val) => {
    setInterestAmount(val);
    setIsBreakdownUserEdited(true);
  };

  const handleOutstandingAfterChange = (val) => {
    setOutstandingAfter(val);
    setIsOutstandingUserEdited(true);
  };

  const handleBalanceUpdatedToggle = (enabled) => {
    setBalanceUpdated(enabled);
    if (enabled && (outstandingAfter === '' || outstandingAfter === null || outstandingAfter === undefined)) {
      const breakdown = calculateEmiBreakdown({
        currentOutstanding: currentLoanOutstanding,
        annualInterestRate,
        amount,
        paymentType,
        userPrincipal: principalAmount,
      });
      setOutstandingAfter(breakdown.newOutstanding);
    }
  };

  return {
    isEditMode,
    loanId,
    setLoanId,
    amount,
    setAmount: handleAmountChange,
    paymentDate,
    setPaymentDate,
    paymentType,
    setPaymentType: handlePaymentTypeChange,
    principalAmount,
    setPrincipalAmount: handlePrincipalChange,
    interestAmount,
    setInterestAmount: handleInterestChange,
    feesAmount,
    setFeesAmount,
    balanceUpdated,
    setBalanceUpdated: handleBalanceUpdatedToggle,
    outstandingBefore,
    setOutstandingBefore,
    outstandingAfter,
    setOutstandingAfter: handleOutstandingAfterChange,
    actualClosingBalance,
    setActualClosingBalance,
    isOutstandingUserEdited,
    isBreakdownUserEdited,
    setEmiAmount,
    handleQuickFillEmi,
    note,
    setNote,
    errors,
    warnings,
    validate,
    getPaymentPayload,
  };
};

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addLoanProfile, updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import { createLoanProfile } from '../types/loanProfileTypes';
import { validateLoanProfileInput } from '../utils/loanProfileValidation';

export const useLoanProfileForm = (initialProfile = null, onSuccess = null) => {
  const dispatch = useDispatch();

  const isEditMode = Boolean(initialProfile && initialProfile.id);

  const [name, setName] = useState(initialProfile?.name || '');
  const [loanType, setLoanType] = useState(initialProfile?.loanType || 'home_loan');
  const [lenderName, setLenderName] = useState(initialProfile?.lenderName || '');
  const [originalPrincipal, setOriginalPrincipal] = useState(
    initialProfile?.originalPrincipal ? String(initialProfile.originalPrincipal) : ''
  );
  const [currentOutstandingPrincipal, setCurrentOutstandingPrincipal] = useState(
    initialProfile?.currentOutstandingPrincipal ? String(initialProfile.currentOutstandingPrincipal) : ''
  );
  const [annualInterestRate, setAnnualInterestRate] = useState(
    initialProfile?.annualInterestRate ? String(initialProfile.annualInterestRate) : ''
  );
  const [emiAmount, setEmiAmount] = useState(
    initialProfile?.emiAmount ? String(initialProfile.emiAmount) : ''
  );
  const [originalTenureValue, setOriginalTenureValue] = useState(
    initialProfile?.originalTenure?.value ? String(initialProfile.originalTenure.value) : ''
  );
  const [originalTenureUnit, setOriginalTenureUnit] = useState(
    initialProfile?.originalTenure?.unit || 'months'
  );
  const [remainingTenureValue, setRemainingTenureValue] = useState(
    initialProfile?.remainingTenure?.value ? String(initialProfile.remainingTenure.value) : ''
  );
  const [remainingTenureUnit, setRemainingTenureUnit] = useState(
    initialProfile?.remainingTenure?.unit || 'months'
  );
  const [loanStartDate, setLoanStartDate] = useState(
    initialProfile?.loanStartDate || new Date().toISOString().split('T')[0]
  );
  const [nextEmiDate, setNextEmiDate] = useState(
    initialProfile?.nextEmiDate || new Date().toISOString().split('T')[0]
  );
  const [processingFee, setProcessingFee] = useState(
    initialProfile?.processingFee ? String(initialProfile.processingFee) : ''
  );
  const [notes, setNotes] = useState(initialProfile?.notes || '');
  const [isPrimary, setIsPrimary] = useState(Boolean(initialProfile?.isPrimary));

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setLoanType(initialProfile.loanType || 'home_loan');
      setLenderName(initialProfile.lenderName || '');
      setOriginalPrincipal(initialProfile.originalPrincipal ? String(initialProfile.originalPrincipal) : '');
      setCurrentOutstandingPrincipal(initialProfile.currentOutstandingPrincipal ? String(initialProfile.currentOutstandingPrincipal) : '');
      setAnnualInterestRate(initialProfile.annualInterestRate ? String(initialProfile.annualInterestRate) : '');
      setEmiAmount(initialProfile.emiAmount ? String(initialProfile.emiAmount) : '');
      setOriginalTenureValue(initialProfile.originalTenure?.value ? String(initialProfile.originalTenure.value) : '');
      setOriginalTenureUnit(initialProfile.originalTenure?.unit || 'months');
      setRemainingTenureValue(initialProfile.remainingTenure?.value ? String(initialProfile.remainingTenure.value) : '');
      setRemainingTenureUnit(initialProfile.remainingTenure?.unit || 'months');
      setLoanStartDate(initialProfile.loanStartDate || new Date().toISOString().split('T')[0]);
      setNextEmiDate(initialProfile.nextEmiDate || new Date().toISOString().split('T')[0]);
      setProcessingFee(initialProfile.processingFee ? String(initialProfile.processingFee) : '');
      setNotes(initialProfile.notes || '');
      setIsPrimary(Boolean(initialProfile.isPrimary));
    }
  }, [initialProfile]);

  const handleSubmit = useCallback(() => {
    const rawPayload = {
      name,
      loanType,
      lenderName,
      originalPrincipal,
      currentOutstandingPrincipal,
      annualInterestRate,
      emiAmount,
      originalTenure: { value: originalTenureValue, unit: originalTenureUnit },
      remainingTenure: { value: remainingTenureValue, unit: remainingTenureUnit },
      loanStartDate,
      nextEmiDate,
      processingFee,
      notes,
      isPrimary,
    };

    const validation = validateLoanProfileInput(rawPayload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});

    if (isEditMode) {
      const updatedRecord = createLoanProfile({
        ...initialProfile,
        ...rawPayload,
        updatedAt: new Date().toISOString(),
      });
      dispatch(updateLoanProfile(updatedRecord));
      if (onSuccess) onSuccess(updatedRecord);
    } else {
      const newRecord = createLoanProfile(rawPayload);
      dispatch(addLoanProfile(newRecord));
      if (onSuccess) onSuccess(newRecord);
    }

    return true;
  }, [
    name,
    loanType,
    lenderName,
    originalPrincipal,
    currentOutstandingPrincipal,
    annualInterestRate,
    emiAmount,
    originalTenureValue,
    originalTenureUnit,
    remainingTenureValue,
    remainingTenureUnit,
    loanStartDate,
    nextEmiDate,
    processingFee,
    notes,
    isPrimary,
    isEditMode,
    initialProfile,
    dispatch,
    onSuccess,
  ]);

  const handleReset = useCallback(() => {
    setName('');
    setLoanType('home_loan');
    setLenderName('');
    setOriginalPrincipal('');
    setCurrentOutstandingPrincipal('');
    setAnnualInterestRate('');
    setEmiAmount('');
    setOriginalTenureValue('');
    setOriginalTenureUnit('months');
    setRemainingTenureValue('');
    setRemainingTenureUnit('months');
    setLoanStartDate(new Date().toISOString().split('T')[0]);
    setNextEmiDate(new Date().toISOString().split('T')[0]);
    setProcessingFee('');
    setNotes('');
    setIsPrimary(false);
    setErrors({});
  }, []);

  return {
    isEditMode,
    name,
    setName,
    loanType,
    setLoanType,
    lenderName,
    setLenderName,
    originalPrincipal,
    setOriginalPrincipal,
    currentOutstandingPrincipal,
    setCurrentOutstandingPrincipal,
    annualInterestRate,
    setAnnualInterestRate,
    emiAmount,
    setEmiAmount,
    originalTenureValue,
    setOriginalTenureValue,
    originalTenureUnit,
    setOriginalTenureUnit,
    remainingTenureValue,
    setRemainingTenureValue,
    remainingTenureUnit,
    setRemainingTenureUnit,
    loanStartDate,
    setLoanStartDate,
    nextEmiDate,
    setNextEmiDate,
    processingFee,
    setProcessingFee,
    notes,
    setNotes,
    isPrimary,
    setIsPrimary,
    errors,
    handleSubmit,
    handleReset,
  };
};

export default useLoanProfileForm;

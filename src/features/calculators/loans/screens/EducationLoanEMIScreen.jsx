import React from 'react';
import LoanCalculatorScreen from '../LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../config/loanConfigs';

export const EducationLoanEMIScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.EDUCATION_LOAN} {...props} />;
};

export default EducationLoanEMIScreen;

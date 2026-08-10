import React from 'react';
import LoanCalculatorScreen from '../LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../config/loanConfigs';

export const PersonalLoanEMIScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.PERSONAL_LOAN} {...props} />;
};

export default PersonalLoanEMIScreen;

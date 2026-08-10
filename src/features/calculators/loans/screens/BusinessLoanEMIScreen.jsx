import React from 'react';
import LoanCalculatorScreen from '../LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../config/loanConfigs';

export const BusinessLoanEMIScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.BUSINESS_LOAN} {...props} />;
};

export default BusinessLoanEMIScreen;

import React from 'react';
import LoanCalculatorScreen from '../LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../config/loanConfigs';

export const HomeLoanEMIScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.HOME_LOAN} {...props} />;
};

export default HomeLoanEMIScreen;

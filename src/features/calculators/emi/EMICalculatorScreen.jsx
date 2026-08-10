import React from 'react';
import LoanCalculatorScreen from '../loans/LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../loans/config/loanConfigs';

export const EMICalculatorScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.HOME_LOAN} {...props} />;
};

export default EMICalculatorScreen;

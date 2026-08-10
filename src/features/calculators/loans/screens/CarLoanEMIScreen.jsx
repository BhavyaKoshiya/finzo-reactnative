import React from 'react';
import LoanCalculatorScreen from '../LoanCalculatorScreen';
import { LOAN_CONFIGS } from '../config/loanConfigs';

export const CarLoanEMIScreen = (props) => {
  return <LoanCalculatorScreen config={LOAN_CONFIGS.CAR_LOAN} {...props} />;
};

export default CarLoanEMIScreen;

import { useLoanCalculator } from '../../loans/hooks/useLoanCalculator';
import { LOAN_CONFIGS } from '../../loans/config/loanConfigs';

export const DEFAULT_EMI_INPUTS = LOAN_CONFIGS.HOME_LOAN.defaults;

export const useEMICalculator = () => {
  return useLoanCalculator(LOAN_CONFIGS.HOME_LOAN);
};

export default useEMICalculator;

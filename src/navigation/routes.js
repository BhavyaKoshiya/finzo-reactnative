export const ROUTES = {
  MAIN_TABS: 'MainTabs',
  HOME: 'Home',
  CALCULATORS: 'Calculators',
  MY_LOANS: 'MyLoans',
  SAVED: 'MyLoans', // Maintained for backward compatibility
  PROFILE: 'Profile',
  REWARDS: 'Rewards',
  SETTINGS: 'Profile', // Maintained for backward compatibility alias
  SHOWCASE: 'Showcase',
  CALCULATOR_SEARCH: 'CalculatorSearch',
  CALCULATOR_DETAIL: 'CalculatorDetail',
  CALCULATOR_RESULT: 'CalculatorResult',
  EMI_CALCULATOR: 'EMICalculator', // Backward-compatible route for Home Loan EMI
  HOME_LOAN_EMI: 'HomeLoanEMI',
  PERSONAL_LOAN_EMI: 'PersonalLoanEMI',
  CAR_LOAN_EMI: 'CarLoanEMI',
  EDUCATION_LOAN_EMI: 'EducationLoanEMI',
  BUSINESS_LOAN_EMI: 'BusinessLoanEMI',
  SIP_CALCULATOR: 'SIPCalculator',
  FD_CALCULATOR: 'FDCalculator',
  RD_CALCULATOR: 'RDCalculator',
  CAGR_CALCULATOR: 'CAGRCalculator',
  ROI_CALCULATOR: 'ROICalculator',
  GST_CALCULATOR: 'GSTCalculator',
  SIMPLE_INTEREST_CALCULATOR: 'SimpleInterestCalculator',
  COMPOUND_INTEREST_CALCULATOR: 'CompoundInterestCalculator',
  PERCENTAGE_CALCULATOR: 'PercentageCalculator',
  // Real Loan Profiles & Dashboard Routes (Phase 16)
  LOAN_DASHBOARD: 'LoanDashboard',
  ADD_LOAN: 'AddLoan',
  EDIT_LOAN: 'EditLoan',
  LOAN_DETAILS: 'LoanDetails',
  // Real Loan Payment History Routes (Phase 17)
  ADD_PAYMENT: 'AddPayment',
  EDIT_PAYMENT: 'EditPayment',
  LOAN_PAYMENT_HISTORY: 'LoanPaymentHistory',
  // Prepayment Simulator (Phase 16.5)
  LOAN_PREPAYMENT_SIMULATOR: 'LoanPrepaymentSimulator',
};

export default ROUTES;

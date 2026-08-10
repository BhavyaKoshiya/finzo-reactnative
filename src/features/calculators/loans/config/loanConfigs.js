import { Home, User, Car, GraduationCap, Briefcase } from 'lucide-react-native';
import { CALCULATOR_IDS } from '../../../../calculators/registry/calculatorIds';
import { ROUTES } from '../../../../navigation/routes';

export const LOAN_CONFIGS = {
  HOME_LOAN: {
    id: CALCULATOR_IDS.HOME_LOAN_EMI,
    title: 'Home Loan EMI',
    subtitle: 'Home, Housing & Property Loans',
    description: 'Estimate your monthly home loan EMI, total interest, and payment split.',
    icon: Home,
    route: ROUTES.HOME_LOAN_EMI,
    defaults: {
      loanAmount: '1000000', // ₹10,00,000
      interestRate: '8.5', // 8.5% p.a.
      tenureValue: '5', // 5 Years
      tenureUnit: 'years',
    },
    amountLabel: 'Loan Amount',
    rateLabel: 'Interest Rate (% p.a.)',
    tenureLabel: 'Loan Tenure',
  },
  PERSONAL_LOAN: {
    id: CALCULATOR_IDS.PERSONAL_LOAN_EMI,
    title: 'Personal Loan EMI',
    subtitle: 'Personal & Instant Cash Loans',
    description: 'Calculate your personal loan EMI, total interest, and repayment amount.',
    icon: User,
    route: ROUTES.PERSONAL_LOAN_EMI,
    defaults: {
      loanAmount: '500000', // ₹5,00,000
      interestRate: '12', // 12% p.a.
      tenureValue: '5', // 5 Years
      tenureUnit: 'years',
    },
    amountLabel: 'Loan Amount',
    rateLabel: 'Interest Rate (% p.a.)',
    tenureLabel: 'Loan Tenure',
  },
  CAR_LOAN: {
    id: CALCULATOR_IDS.CAR_LOAN_EMI,
    title: 'Car Loan EMI',
    subtitle: 'Car, Auto & Vehicle Loans',
    description: 'Estimate your monthly car loan payment and total interest.',
    icon: Car,
    route: ROUTES.CAR_LOAN_EMI,
    defaults: {
      loanAmount: '800000', // ₹8,00,000
      interestRate: '9', // 9% p.a.
      tenureValue: '5', // 5 Years
      tenureUnit: 'years',
    },
    amountLabel: 'Loan Amount',
    rateLabel: 'Interest Rate (% p.a.)',
    tenureLabel: 'Loan Tenure',
  },
  EDUCATION_LOAN: {
    id: CALCULATOR_IDS.EDUCATION_LOAN_EMI,
    title: 'Education Loan EMI',
    subtitle: 'Student & Higher Study Loans',
    description: 'Estimate your education loan EMI and total repayment cost.',
    icon: GraduationCap,
    route: ROUTES.EDUCATION_LOAN_EMI,
    defaults: {
      loanAmount: '1000000', // ₹10,00,000
      interestRate: '9', // 9% p.a.
      tenureValue: '7', // 7 Years
      tenureUnit: 'years',
    },
    amountLabel: 'Loan Amount',
    rateLabel: 'Interest Rate (% p.a.)',
    tenureLabel: 'Loan Tenure',
  },
  BUSINESS_LOAN: {
    id: CALCULATOR_IDS.BUSINESS_LOAN_EMI,
    title: 'Business Loan EMI',
    subtitle: 'Commercial & Enterprise Loans',
    description: 'Calculate your business loan EMI and total repayment.',
    icon: Briefcase,
    route: ROUTES.BUSINESS_LOAN_EMI,
    defaults: {
      loanAmount: '1000000', // ₹10,00,000
      interestRate: '11', // 11% p.a.
      tenureValue: '5', // 5 Years
      tenureUnit: 'years',
    },
    amountLabel: 'Loan Amount',
    rateLabel: 'Interest Rate (% p.a.)',
    tenureLabel: 'Loan Tenure',
  },
};

export default LOAN_CONFIGS;

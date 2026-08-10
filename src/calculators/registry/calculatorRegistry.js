import {
  Home,
  User,
  Car,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Calendar,
  Percent,
  PieChart,
  Landmark,
  DollarSign,
  Scale,
  Divide,
} from 'lucide-react-native';
import { CALCULATOR_IDS } from './calculatorIds';
import { CATEGORY_IDS, CALCULATOR_CATEGORIES } from './calculatorCategories';
import { ROUTES } from '../../navigation/routes';

export const CALCULATOR_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'comingSoon',
};

export const CALCULATOR_REGISTRY = [
  {
    id: CALCULATOR_IDS.HOME_LOAN_EMI,
    name: 'Home Loan EMI',
    shortName: 'Home Loan',
    description: 'Estimate your monthly home loan EMI, total interest, and payment split.',
    category: CATEGORY_IDS.LOANS,
    icon: Home,
    route: ROUTES.HOME_LOAN_EMI,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['home loan', 'housing loan', 'property', 'emi', 'mortgage', 'loan'],
  },
  {
    id: CALCULATOR_IDS.PERSONAL_LOAN_EMI,
    name: 'Personal Loan EMI',
    shortName: 'Personal Loan',
    description: 'Calculate your personal loan EMI, total interest, and repayment amount.',
    category: CATEGORY_IDS.LOANS,
    icon: User,
    route: ROUTES.PERSONAL_LOAN_EMI,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['personal loan', 'cash loan', 'instant loan', 'emi', 'borrowing'],
  },
  {
    id: CALCULATOR_IDS.CAR_LOAN_EMI,
    name: 'Car Loan EMI',
    shortName: 'Car Loan',
    description: 'Estimate your monthly car loan payment and total interest.',
    category: CATEGORY_IDS.LOANS,
    icon: Car,
    route: ROUTES.CAR_LOAN_EMI,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['car loan', 'auto loan', 'vehicle loan', 'emi', 'automobile'],
  },
  {
    id: CALCULATOR_IDS.EDUCATION_LOAN_EMI,
    name: 'Education Loan EMI',
    shortName: 'Education Loan',
    description: 'Estimate your education loan EMI and total repayment cost.',
    category: CATEGORY_IDS.LOANS,
    icon: GraduationCap,
    route: ROUTES.EDUCATION_LOAN_EMI,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['education loan', 'student loan', 'study loan', 'college', 'emi'],
  },
  {
    id: CALCULATOR_IDS.BUSINESS_LOAN_EMI,
    name: 'Business Loan EMI',
    shortName: 'Business Loan',
    description: 'Calculate your business loan EMI and total repayment.',
    category: CATEGORY_IDS.LOANS,
    icon: Briefcase,
    route: ROUTES.BUSINESS_LOAN_EMI,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['business loan', 'commercial loan', 'startup loan', 'enterprise', 'emi'],
  },
  {
    id: CALCULATOR_IDS.SIP,
    name: 'Systematic Investment Plan',
    shortName: 'SIP Calculator',
    description: 'Project estimated wealth growth from regular monthly SIP investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: TrendingUp,
    route: ROUTES.SIP_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['sip', 'systematic investment', 'mutual fund', 'monthly investment', 'investment calculator'],
  },
  {
    id: CALCULATOR_IDS.FD,
    name: 'Fixed Deposit',
    shortName: 'FD Calculator',
    description: 'Calculate maturity returns with compound interest compounding.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Briefcase,
    route: ROUTES.FD_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['fd', 'fixed deposit', 'fixed deposit calculator', 'maturity', 'interest'],
  },
  {
    id: CALCULATOR_IDS.RD,
    name: 'Recurring Deposit',
    shortName: 'RD Calculator',
    description: 'Calculate maturity value for monthly recurring bank deposits.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Landmark,
    route: ROUTES.RD_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['rd', 'recurring deposit', 'monthly deposit', 'maturity', 'interest'],
  },
  {
    id: CALCULATOR_IDS.CAGR,
    name: 'Compound Annual Growth Rate',
    shortName: 'CAGR Calculator',
    description: 'Calculate Compound Annual Growth Rate for investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: DollarSign,
    route: ROUTES.CAGR_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['cagr', 'compound annual growth', 'annualized return', 'investment growth'],
  },
  {
    id: CALCULATOR_IDS.ROI,
    name: 'Return on Investment',
    shortName: 'ROI Calculator',
    description: 'Calculate percentage gain or loss on your investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Scale,
    route: ROUTES.ROI_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['roi', 'return on investment', 'investment return', 'profit', 'loss'],
  },
  {
    id: CALCULATOR_IDS.GST,
    name: 'GST Calculator',
    shortName: 'GST Calculator',
    description: 'Calculate Goods & Services Tax inclusive and exclusive amounts.',
    category: CATEGORY_IDS.BUSINESS,
    icon: Percent,
    route: ROUTES.GST_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['gst', 'goods and services tax', 'gst calculator', 'tax', 'business', 'inclusive', 'exclusive', 'vat'],
  },
  {
    id: CALCULATOR_IDS.SIMPLE_INTEREST,
    name: 'Simple Interest',
    shortName: 'Simple Interest',
    description: 'Calculate simple interest on principal amounts over time.',
    category: CATEGORY_IDS.EVERYDAY,
    icon: Calendar,
    route: ROUTES.SIMPLE_INTEREST_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['simple interest', 'interest', 'si calculator', 'rate', 'borrowing'],
  },
  {
    id: CALCULATOR_IDS.COMPOUND_INTEREST,
    name: 'Compound Interest',
    shortName: 'Compound Interest',
    description: 'Calculate compound interest growth across various frequencies.',
    category: CATEGORY_IDS.EVERYDAY,
    icon: PieChart,
    route: ROUTES.COMPOUND_INTEREST_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['compound interest', 'ci calculator', 'compound', 'interest', 'compounding', 'growth'],
  },
  {
    id: CALCULATOR_IDS.PERCENTAGE,
    name: 'Percentage Calculator',
    shortName: 'Percentage',
    description: 'Calculate percentage of, percentage change, and percentage differences.',
    category: CATEGORY_IDS.EVERYDAY,
    icon: Divide,
    route: ROUTES.PERCENTAGE_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: false,
    keywords: ['percentage', 'percent', 'percentage change', 'percentage difference', 'percentage calculator'],
  },
];

export const getCalculatorById = (id) => {
  if (!id) return null;
  return (
    CALCULATOR_REGISTRY.find(
      (item) => item.id === id || (id === CALCULATOR_IDS.EMI && item.id === CALCULATOR_IDS.HOME_LOAN_EMI)
    ) || null
  );
};

export const getAvailableCalculators = () => {
  return CALCULATOR_REGISTRY.filter((item) => item.status === CALCULATOR_STATUS.AVAILABLE);
};

export const getComingSoonCalculators = () => {
  return CALCULATOR_REGISTRY.filter((item) => item.status === CALCULATOR_STATUS.COMING_SOON);
};

export const getCalculatorsByCategory = (categoryId) => {
  return CALCULATOR_REGISTRY.filter((item) => item.category === categoryId);
};

export const getCalculatorCategories = () => {
  return CALCULATOR_CATEGORIES.map((cat) => {
    const catCalculators = getCalculatorsByCategory(cat.id);
    return {
      ...cat,
      count: catCalculators.length,
      calculators: catCalculators,
    };
  });
};

export const getPopularCalculators = () => {
  return CALCULATOR_REGISTRY.filter((item) => item.popular);
};

export const validateRegistry = () => {
  const ids = new Set();
  const validCategories = new Set(CALCULATOR_CATEGORIES.map((c) => c.id));
  const errors = [];

  CALCULATOR_REGISTRY.forEach((item, index) => {
    if (!item.id) {
      errors.push(`Registry item at index ${index} is missing an 'id'.`);
    } else if (ids.has(item.id)) {
      errors.push(`Duplicate calculator ID found: '${item.id}'.`);
    } else {
      ids.add(item.id);
    }

    if (!item.name) {
      errors.push(`Calculator '${item.id}' is missing a 'name'.`);
    }

    if (!validCategories.has(item.category)) {
      errors.push(`Calculator '${item.id}' has invalid category '${item.category}'.`);
    }

    if (item.status === CALCULATOR_STATUS.AVAILABLE && !item.route) {
      errors.push(`Available calculator '${item.id}' is missing a 'route'.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  CALCULATOR_REGISTRY,
  CALCULATOR_STATUS,
  getCalculatorById,
  getAvailableCalculators,
  getComingSoonCalculators,
  getCalculatorsByCategory,
  getCalculatorCategories,
  getPopularCalculators,
  validateRegistry,
};

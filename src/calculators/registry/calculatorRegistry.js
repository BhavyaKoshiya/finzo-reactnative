import { Calculator, TrendingUp, Briefcase, Calendar, Percent, PieChart, Landmark, DollarSign, Scale } from 'lucide-react-native';
import { CALCULATOR_IDS } from './calculatorIds';
import { CATEGORY_IDS, CALCULATOR_CATEGORIES } from './calculatorCategories';
import { ROUTES } from '../../navigation/routes';

export const CALCULATOR_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'comingSoon',
};

export const CALCULATOR_REGISTRY = [
  {
    id: CALCULATOR_IDS.EMI,
    name: 'Home Loan EMI',
    shortName: 'EMI Calculator',
    description: 'Calculate monthly installments, total interest, and payment split.',
    category: CATEGORY_IDS.LOANS,
    icon: Calculator,
    route: ROUTES.EMI_CALCULATOR,
    status: CALCULATOR_STATUS.AVAILABLE,
    popular: true,
    keywords: ['emi', 'loan', 'home loan', 'car loan', 'installment', 'mortgage'],
  },
  {
    id: CALCULATOR_IDS.SIP,
    name: 'SIP Investment',
    shortName: 'SIP Calculator',
    description: 'Project wealth growth from regular monthly SIP investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: TrendingUp,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: true,
    keywords: ['sip', 'mutual fund', 'investment', 'wealth', 'systematic'],
  },
  {
    id: CALCULATOR_IDS.FD,
    name: 'Fixed Deposit (FD)',
    shortName: 'FD Calculator',
    description: 'Calculate maturity returns with compound interest compounding.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Briefcase,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: true,
    keywords: ['fd', 'fixed deposit', 'bank', 'interest', 'compounding'],
  },
  {
    id: CALCULATOR_IDS.RD,
    name: 'Recurring Deposit (RD)',
    shortName: 'RD Calculator',
    description: 'Calculate maturity value for monthly recurring bank deposits.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Landmark,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['rd', 'recurring deposit', 'bank', 'monthly deposit'],
  },
  {
    id: CALCULATOR_IDS.GST,
    name: 'GST Calculator',
    shortName: 'GST Calculator',
    description: 'Calculate Goods & Services Tax inclusive and exclusive amounts.',
    category: CATEGORY_IDS.BUSINESS,
    icon: Percent,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['gst', 'tax', 'business', 'inclusive', 'exclusive', 'vat'],
  },
  {
    id: CALCULATOR_IDS.SIMPLE_INTEREST,
    name: 'Simple Interest',
    shortName: 'Simple Interest',
    description: 'Calculate simple interest on principal amounts over time.',
    category: CATEGORY_IDS.EVERYDAY,
    icon: Calendar,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['interest', 'simple interest', 'rate', 'borrowing'],
  },
  {
    id: CALCULATOR_IDS.COMPOUND_INTEREST,
    name: 'Compound Interest',
    shortName: 'Compound Interest',
    description: 'Calculate compound interest growth across various frequencies.',
    category: CATEGORY_IDS.EVERYDAY,
    icon: PieChart,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['compound', 'interest', 'compounding', 'growth'],
  },
  {
    id: CALCULATOR_IDS.CAGR,
    name: 'CAGR Calculator',
    shortName: 'CAGR',
    description: 'Calculate Compound Annual Growth Rate for investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: DollarSign,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['cagr', 'annual growth', 'yield', 'returns'],
  },
  {
    id: CALCULATOR_IDS.ROI,
    name: 'Return on Investment (ROI)',
    shortName: 'ROI Calculator',
    description: 'Calculate percentage gain or loss on your investments.',
    category: CATEGORY_IDS.INVESTMENTS,
    icon: Scale,
    route: null,
    status: CALCULATOR_STATUS.COMING_SOON,
    popular: false,
    keywords: ['roi', 'return', 'profit', 'investment gain'],
  },
];

export const getCalculatorById = (id) => {
  return CALCULATOR_REGISTRY.find((item) => item.id === id) || null;
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

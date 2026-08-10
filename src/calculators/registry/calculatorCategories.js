import { Calculator, TrendingUp, Briefcase, Calendar } from 'lucide-react-native';

export const CATEGORY_IDS = {
  LOANS: 'loans',
  INVESTMENTS: 'investments',
  BUSINESS: 'business',
  EVERYDAY: 'everyday',
};

export const CALCULATOR_CATEGORIES = [
  {
    id: CATEGORY_IDS.LOANS,
    name: 'Loans',
    description: 'Calculate loan installments, prepayment, and interest splits.',
    iconName: 'Calculator',
    icon: Calculator,
  },
  {
    id: CATEGORY_IDS.INVESTMENTS,
    name: 'Investments',
    description: 'Project wealth growth from SIPs, FDs, RDs, and compounding.',
    iconName: 'TrendingUp',
    icon: TrendingUp,
  },
  {
    id: CATEGORY_IDS.BUSINESS,
    name: 'Business',
    description: 'Calculate GST inclusive/exclusive rates, margins, and profit.',
    iconName: 'Briefcase',
    icon: Briefcase,
  },
  {
    id: CATEGORY_IDS.EVERYDAY,
    name: 'Everyday',
    description: 'Simple & compound interest, percentages, and inflation.',
    iconName: 'Calendar',
    icon: Calendar,
  },
];

export default CALCULATOR_CATEGORIES;

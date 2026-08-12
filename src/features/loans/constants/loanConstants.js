import {
  Home,
  User,
  Car,
  GraduationCap,
  Briefcase,
  Landmark,
  WalletCards,
} from 'lucide-react-native';

export const LOAN_TYPES = {
  HOME_LOAN: 'home_loan',
  PERSONAL_LOAN: 'personal_loan',
  CAR_LOAN: 'car_loan',
  EDUCATION_LOAN: 'education_loan',
  BUSINESS_LOAN: 'business_loan',
  OTHER: 'other',
};

export const LOAN_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const LOAN_TYPE_OPTIONS = [
  { label: 'Home Loan', value: LOAN_TYPES.HOME_LOAN },
  { label: 'Personal Loan', value: LOAN_TYPES.PERSONAL_LOAN },
  { label: 'Car Loan', value: LOAN_TYPES.CAR_LOAN },
  { label: 'Education Loan', value: LOAN_TYPES.EDUCATION_LOAN },
  { label: 'Business Loan', value: LOAN_TYPES.BUSINESS_LOAN },
  { label: 'Other Loan', value: LOAN_TYPES.OTHER },
];

export const LOAN_TYPE_CONFIG = {
  [LOAN_TYPES.HOME_LOAN]: {
    label: 'Home Loan',
    icon: Home,
    badgeColor: '#3B82F6',
  },
  [LOAN_TYPES.PERSONAL_LOAN]: {
    label: 'Personal Loan',
    icon: User,
    badgeColor: '#EC4899',
  },
  [LOAN_TYPES.CAR_LOAN]: {
    label: 'Car Loan',
    icon: Car,
    badgeColor: '#10B981',
  },
  [LOAN_TYPES.EDUCATION_LOAN]: {
    label: 'Education Loan',
    icon: GraduationCap,
    badgeColor: '#8B5CF6',
  },
  [LOAN_TYPES.BUSINESS_LOAN]: {
    label: 'Business Loan',
    icon: Briefcase,
    badgeColor: '#F59E0B',
  },
  [LOAN_TYPES.OTHER]: {
    label: 'Other Loan',
    icon: Landmark,
    badgeColor: '#6B7280',
  },
};

export const DEFAULT_LOAN_ICON = WalletCards;

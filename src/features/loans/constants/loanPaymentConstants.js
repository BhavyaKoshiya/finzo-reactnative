import { Wallet, ArrowDownCircle, CheckCircle, HelpCircle } from 'lucide-react-native';

export const PAYMENT_TYPES = {
  REGULAR_EMI: 'regular_emi',
  CUSTOM_PAYMENT: 'custom_payment',
  PREPAYMENT: 'prepayment',
  // Backward compatibility aliases
  EMI: 'regular_emi',
  PART_PREPAYMENT: 'prepayment',
  FULL_PAYMENT: 'prepayment',
  OTHER: 'custom_payment',
};

export const BALANCE_SOURCES = {
  ESTIMATED: 'estimated',
  BANK_CONFIRMED: 'bank_confirmed',
};

export const PAYMENT_TYPE_OPTIONS = [
  {
    label: 'Regular EMI',
    value: PAYMENT_TYPES.REGULAR_EMI,
    description: 'Standard monthly fixed payment',
  },
  {
    label: 'Custom Payment',
    value: PAYMENT_TYPES.CUSTOM_PAYMENT,
    description: 'One-time custom payment amount',
  },
  {
    label: 'Prepayment',
    value: PAYMENT_TYPES.PREPAYMENT,
    description: 'Direct principal reduction',
  },
];

export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.REGULAR_EMI]: 'Regular EMI',
  [PAYMENT_TYPES.CUSTOM_PAYMENT]: 'Custom Payment',
  [PAYMENT_TYPES.PREPAYMENT]: 'Prepayment',
  emi: 'Regular EMI',
  part_prepayment: 'Prepayment',
  full_payment: 'Full Payment',
  other: 'Custom Payment',
};

export const getPaymentTypeConfig = (type) => {
  switch (type) {
    case 'regular_emi':
    case 'emi':
      return {
        label: 'Regular EMI',
        icon: Wallet,
        badgeColor: '#3B82F6',
      };
    case 'custom_payment':
    case 'other':
      return {
        label: 'Custom Payment',
        icon: HelpCircle,
        badgeColor: '#8B5CF6',
      };
    case 'prepayment':
    case 'part_prepayment':
      return {
        label: 'Prepayment',
        icon: ArrowDownCircle,
        badgeColor: '#10B981',
      };
    case 'full_payment':
      return {
        label: 'Full Settlement',
        icon: CheckCircle,
        badgeColor: '#059669',
      };
    default:
      return {
        label: 'Payment',
        icon: Wallet,
        badgeColor: '#3B82F6',
      };
  }
};

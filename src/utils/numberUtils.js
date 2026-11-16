import { formatCurrency } from './financeFormatters';

/**
 * Formats an amount in the active currency, e.g. "₹10,00,000", or "10,00,000"
 * without the symbol (money inputs show the symbol separately).
 */
export const formatAmount = (value, showSymbol = true, decimals = 0) => {
  const options = { includeSymbol: showSymbol, decimalPlaces: decimals };
  if (value === null || value === undefined || isNaN(value)) {
    return formatCurrency(0, options);
  }
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return formatCurrency(numericValue, options);
};

export const parseINRInput = (input) => {
  if (!input) return '';
  // Remove non-digit and non-decimal characters
  const clean = input.toString().replace(/[^0-9.]/g, '');
  // Allow single decimal point
  const parts = clean.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return clean;
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numericValue.toFixed(decimals)}%`;
};

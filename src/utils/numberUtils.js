export const formatINR = (value, showSymbol = true, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol ? '₹0' : '0';
  }
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numericValue);

  return showSymbol ? `₹${formatted}` : formatted;
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

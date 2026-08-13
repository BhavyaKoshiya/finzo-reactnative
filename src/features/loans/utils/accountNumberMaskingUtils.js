/**
 * Utility for masking loan account and reference numbers for UI presentation.
 * E.g. "1234567890" -> "XXXX7890"
 */
export const maskAccountReference = (referenceStr) => {
  if (!referenceStr || typeof referenceStr !== 'string') return '';
  const clean = referenceStr.trim();
  if (clean.length <= 4) return clean;

  const visiblePart = clean.slice(-4);
  const maskedPrefix = 'X'.repeat(Math.min(4, clean.length - 4));
  return `${maskedPrefix}${visiblePart}`;
};

export const RATE_ADJUSTMENT_STRATEGIES = {
  ADJUST_EMI: 'adjust_emi', // Keep tenure same, adjust monthly EMI (default in Indian banking)
  ADJUST_TENURE: 'adjust_tenure', // Keep EMI same, adjust remaining tenure
};

export const RATE_ADJUSTMENT_STRATEGY_OPTIONS = [
  {
    value: RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
    label: 'Adjust EMI',
    description: 'Keep tenure same, recalculate monthly payment (Indian bank default)',
  },
  {
    value: RATE_ADJUSTMENT_STRATEGIES.ADJUST_TENURE,
    label: 'Adjust Tenure',
    description: 'Keep EMI same, recalculate remaining tenure duration',
  },
];

export const RATE_REVISION_SCHEMA_VERSION = 1;

/**
 * Factory function to create a normalized, validated RateRevision record.
 * @param {Object} params
 * @returns {Object} RateRevision record
 */
export const createRateRevision = ({
  id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  schemaVersion = RATE_REVISION_SCHEMA_VERSION,
  loanId = '',
  previousRate = 0,
  newRate = 0,
  effectiveDate = new Date().toISOString().split('T')[0],
  adjustmentStrategy = RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI,
  calculatedNewEmi = null,
  calculatedNewTenureMonths = null,
  exactNewEmi = null,
  exactNewTenureMonths = null,
  appliedNewEmi = null,
  appliedNewTenureMonths = null,
  outstandingAtRevision = 0,
  previousEmi = 0,
  previousRemainingTenureMonths = 0,
  note = '',
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) => {
  const numPrevRate = Number(previousRate) || 0;
  const numNewRate = Number(newRate) || 0;
  const numOutstanding = Number(outstandingAtRevision) || 0;
  const numPrevEmi = Number(previousEmi) || 0;
  const numPrevTenure = Math.round(Number(previousRemainingTenureMonths) || 0);

  const numCalcEmi = calculatedNewEmi !== null && calculatedNewEmi !== undefined && !isNaN(Number(calculatedNewEmi))
    ? Number(calculatedNewEmi)
    : null;
  const numCalcTenure = calculatedNewTenureMonths !== null && calculatedNewTenureMonths !== undefined && !isNaN(Number(calculatedNewTenureMonths))
    ? Math.round(Number(calculatedNewTenureMonths))
    : null;

  const numExactEmi = exactNewEmi !== null && exactNewEmi !== undefined && !isNaN(Number(exactNewEmi)) && Number(exactNewEmi) > 0
    ? Number(exactNewEmi)
    : null;
  const numExactTenure = exactNewTenureMonths !== null && exactNewTenureMonths !== undefined && !isNaN(Number(exactNewTenureMonths)) && Number(exactNewTenureMonths) > 0
    ? Math.round(Number(exactNewTenureMonths))
    : null;

  // Resolve applied values: exact bank override takes precedence over calculated, otherwise fallback to previous
  const finalAppliedEmi = numExactEmi !== null
    ? numExactEmi
    : (numCalcEmi !== null ? numCalcEmi : numPrevEmi);

  const finalAppliedTenure = numExactTenure !== null
    ? numExactTenure
    : (numCalcTenure !== null ? numCalcTenure : numPrevTenure);

  const resolvedStrategy = Object.values(RATE_ADJUSTMENT_STRATEGIES).includes(adjustmentStrategy)
    ? adjustmentStrategy
    : RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI;

  return {
    id,
    schemaVersion,
    loanId: String(loanId || '').trim(),
    previousRate: numPrevRate,
    newRate: numNewRate,
    effectiveDate: String(effectiveDate || '').trim(),
    adjustmentStrategy: resolvedStrategy,
    calculatedNewEmi: numCalcEmi,
    calculatedNewTenureMonths: numCalcTenure,
    exactNewEmi: numExactEmi,
    exactNewTenureMonths: numExactTenure,
    appliedNewEmi: finalAppliedEmi,
    appliedNewTenureMonths: finalAppliedTenure,
    outstandingAtRevision: numOutstanding,
    previousEmi: numPrevEmi,
    previousRemainingTenureMonths: numPrevTenure,
    note: String(note || '').trim(),
    createdAt,
    updatedAt,
  };
};

/**
 * Type guard / schema validator to ensure rate revision records are safe.
 * @param {any} record
 * @returns {boolean}
 */
export const isValidRateRevision = (record) => {
  if (!record || typeof record !== 'object') return false;
  if (!record.id || typeof record.id !== 'string') return false;
  if (!record.loanId || typeof record.loanId !== 'string') return false;
  if (typeof record.newRate !== 'number' || isNaN(record.newRate) || record.newRate <= 0) return false;
  if (typeof record.effectiveDate !== 'string' || !record.effectiveDate.trim()) return false;
  return true;
};

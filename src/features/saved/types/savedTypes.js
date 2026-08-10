import { getCalculatorById } from '../../../calculators';

/**
 * Creates a normalized, serializable saved calculation snapshot.
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.calculatorId
 * @param {string} [params.title]
 * @param {Object} params.inputs
 * @param {Object} params.result
 * @param {boolean} [params.isFavorite=false]
 * @returns {Object} Saved snapshot object
 */
export const createCalculationSnapshot = ({
  id,
  calculatorId,
  title,
  inputs,
  result,
  isFavorite = false,
}) => {
  const calcMetadata = getCalculatorById(calculatorId);
  const defaultTitle = calcMetadata ? calcMetadata.name : 'Saved Calculation';

  const snapshotId = id || `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: snapshotId,
    calculatorId,
    title: title && title.trim().length > 0 ? title.trim() : defaultTitle,
    inputs: inputs ? JSON.parse(JSON.stringify(inputs)) : {},
    result: result ? JSON.parse(JSON.stringify(result)) : {},
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: Boolean(isFavorite),
    schemaVersion: 1,
  };
};

export default {
  createCalculationSnapshot,
};

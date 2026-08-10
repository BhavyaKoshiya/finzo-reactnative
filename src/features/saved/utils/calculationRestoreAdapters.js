/**
 * Pure adapter to extract normalized initial inputs when restoring a saved calculation.
 * @param {Object} savedCalculation
 * @returns {Object|null} Initial inputs object or null
 */
export const restoreSavedCalculationInputs = (savedCalculation) => {
  if (!savedCalculation || !savedCalculation.inputs) {
    return null;
  }

  return {
    ...savedCalculation.inputs,
    editingSavedCalculationId: savedCalculation.id,
    savedTitle: savedCalculation.title,
  };
};

export default {
  restoreSavedCalculationInputs,
};

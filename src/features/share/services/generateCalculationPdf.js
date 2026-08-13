import { getCalculatorReportAdapter, generateReportPdf } from '../../reports';
import logger from '../../../services/logger';

/**
 * Generates an offline PDF report file from a calculator export model or parameters.
 * @param {Object} params
 * @param {Object} params.exportModel
 * @param {'quick'|'detailed'} [params.mode='quick']
 * @returns {Promise<string>} File path/URI of generated PDF
 */
export const generateCalculationPdf = async ({ exportModel, mode = 'quick' }) => {
  if (!exportModel) {
    throw new Error('Export model is required for PDF generation.');
  }

  logger.info('Generating calculation PDF report', { title: exportModel.title, mode });

  const reportModel = getCalculatorReportAdapter(
    exportModel.calculatorId || 'emi',
    exportModel.inputValues || exportModel.inputs || {},
    exportModel.results || exportModel.result || {},
    exportModel.customTitle || exportModel.title
  );

  return generateReportPdf(reportModel);
};

export default generateCalculationPdf;

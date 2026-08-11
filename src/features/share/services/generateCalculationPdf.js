import RNHTMLtoPDF, { generatePDF } from 'react-native-html-to-pdf';
import buildCalculationPdfHtml from '../pdf/pdfHtmlBuilder';
import logger from '../../../services/logger';

/**
 * Generates an offline PDF report file from an Export Model.
 * @param {Object} params
 * @param {Object} params.exportModel
 * @param {'quick'|'detailed'} params.mode
 * @returns {Promise<string>} File path/URI of generated PDF
 */
export const generateCalculationPdf = async ({ exportModel, mode = 'quick' }) => {
  if (!exportModel) {
    throw new Error('Export model is required for PDF generation.');
  }

  const rawName = exportModel.customTitle || exportModel.title || 'Calculation';
  const sanitizedName = `Finzo_${rawName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  logger.info('Generating calculation PDF', { title: exportModel.title, mode, fileName: sanitizedName });

  const htmlContent = buildCalculationPdfHtml(exportModel, mode);

  const options = {
    html: htmlContent,
    fileName: sanitizedName,
    directory: 'Documents',
    bgColor: '#FFFFFF',
    padding: 36, // Standard 0.5 inch (36pt) printable margin
  };

  try {
    const convertFn = typeof generatePDF === 'function'
      ? generatePDF
      : (RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function' ? RNHTMLtoPDF.convert : null);

    if (!convertFn) {
      throw new Error('Native PDF module not linked. Please rebuild the native app (npx react-native run-ios / run-android).');
    }

    const file = await convertFn(options);
    logger.info('Calculation PDF generated successfully', { filePath: file?.filePath });
    return file?.filePath;
  } catch (error) {
    logger.error('Failed to generate PDF', { error: error.message });
    throw new Error(error.message || 'Unable to generate PDF. Please try again.');
  }
};

export default generateCalculationPdf;

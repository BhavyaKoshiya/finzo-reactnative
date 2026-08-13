import RNHTMLtoPDF, { generatePDF } from 'react-native-html-to-pdf';
import { Share } from 'react-native';
import buildReportPdfHtml from '../templates/pdfHtmlRenderer';
import logger from '../../../services/logger';

/**
 * PDF Report Service for Finzo.
 * Handles PDF rendering, local temporary file creation, and native system sharing.
 * 100% Offline & Local — No cloud uploads, no external network requests.
 */

/**
 * Generates an offline PDF report from a normalized reportModel.
 * @param {Object} reportModel Normalized report model
 * @returns {Promise<string>} Local file path of generated PDF
 */
export const generateReportPdf = async (reportModel) => {
  if (!reportModel) {
    throw new Error('Report model is required for PDF generation.');
  }

  const sanitizedTitle = (reportModel.title || 'Finzo_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateSuffix = reportModel.generatedAtISO || new Date().toISOString().split('T')[0];
  const fileName = reportModel.fileName || `Finzo_${sanitizedTitle}_${dateSuffix}`;

  logger.info('Initiating PDF report generation', { title: reportModel.title, fileName });

  const htmlContent = buildReportPdfHtml(reportModel);

  const options = {
    html: htmlContent,
    fileName,
    directory: 'Documents',
    bgColor: '#FFFFFF',
    padding: 24, // Standard PDF printable margins
  };

  try {
    const convertFn = typeof generatePDF === 'function'
      ? generatePDF
      : (RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function' ? RNHTMLtoPDF.convert : null);

    if (!convertFn) {
      throw new Error('Native PDF module not available. Please rebuild native application.');
    }

    const file = await convertFn(options);
    logger.info('PDF report generated successfully', { filePath: file?.filePath });
    return file?.filePath;
  } catch (error) {
    logger.error('Failed to generate PDF report', { error: error.message });
    throw new Error(error.message || 'Unable to create the PDF report. Please try again.');
  }
};

/**
 * Invokes native device Share sheet for generated PDF file.
 * @param {string} pdfFilePath File path or file:// URI
 * @param {string} [title='Finzo Financial Report'] Title for share dialog
 * @returns {Promise<Object>} { success: boolean, dismissed?: boolean }
 */
export const shareReportPdf = async (pdfFilePath, title = 'Finzo Financial Report') => {
  if (!pdfFilePath) {
    throw new Error('PDF file path is required for sharing.');
  }

  const formattedUrl = pdfFilePath.startsWith('file://') ? pdfFilePath : `file://${pdfFilePath}`;

  logger.info('Sharing PDF report file', { formattedUrl, title });

  try {
    const result = await Share.share(
      {
        url: formattedUrl,
        title,
      },
      {
        dialogTitle: `Share ${title}`,
      }
    );

    if (result.action === Share.sharedAction) {
      logger.info('PDF report shared successfully');
      return { success: true };
    } else if (result.action === Share.dismissedAction) {
      logger.info('PDF report share dismissed');
      return { success: false, dismissed: true };
    }
  } catch (error) {
    logger.error('Failed to share PDF report', { error: error.message });
    throw new Error('Unable to share PDF file. Please try again.');
  }
};

/**
 * Combined helper: generates PDF report and opens system share sheet.
 * @param {Object} reportModel Normalized report model
 * @returns {Promise<Object>} Share result object
 */
export const generateAndShareReport = async (reportModel) => {
  const filePath = await generateReportPdf(reportModel);
  if (!filePath) {
    throw new Error('PDF generation failed to produce a valid file.');
  }
  return shareReportPdf(filePath, reportModel.title || 'Finzo Report');
};

export default {
  generateReportPdf,
  shareReportPdf,
  generateAndShareReport,
};

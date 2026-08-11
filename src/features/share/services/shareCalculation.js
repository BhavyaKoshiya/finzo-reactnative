import { Share } from 'react-native';
import buildShareText from '../utils/shareTextBuilder';
import logger from '../../../services/logger';

/**
 * Native Text Sharing Service
 * Invokes React Native built-in Share API for messaging / email sharing.
 */
export const shareCalculationText = async (exportModel) => {
  if (!exportModel) {
    throw new Error('Export model is required for sharing.');
  }

  const message = buildShareText(exportModel);
  const title = exportModel.customTitle || exportModel.title || 'Calculation Summary';

  logger.info('Initiating calculation text share', { title });

  try {
    const result = await Share.share(
      {
        message,
        title,
      },
      {
        dialogTitle: `Share ${title}`,
      }
    );

    if (result.action === Share.sharedAction) {
      logger.info('Calculation shared successfully', { activityType: result.activityType });
      return { success: true, activityType: result.activityType };
    } else if (result.action === Share.dismissedAction) {
      logger.info('Calculation share dismissed by user');
      return { success: false, dismissed: true };
    }
  } catch (error) {
    logger.error('Failed to share calculation', { error: error.message });
    throw new Error('Unable to share this calculation. Please try again.');
  }
};

/**
 * Native PDF File Sharing Service
 * Shares generated PDF file path using Share API.
 */
export const shareCalculationPdfFile = async (pdfFilePath, title = 'Calculation Report') => {
  if (!pdfFilePath) {
    throw new Error('PDF file path is required for sharing.');
  }

  const formattedUrl = pdfFilePath.startsWith('file://') ? pdfFilePath : `file://${pdfFilePath}`;

  logger.info('Initiating calculation PDF file share', { pdfFilePath, formattedUrl });

  try {
    const result = await Share.share(
      {
        url: formattedUrl,
        title,
      },
      {
        dialogTitle: `Share ${title} PDF`,
      }
    );

    if (result.action === Share.sharedAction) {
      logger.info('PDF shared successfully');
      return { success: true };
    } else if (result.action === Share.dismissedAction) {
      logger.info('PDF share dismissed by user');
      return { success: false, dismissed: true };
    }
  } catch (error) {
    logger.error('Failed to share PDF file', { error: error.message });
    throw new Error('Unable to share PDF file. Please try again.');
  }
};

export default {
  shareCalculationText,
  shareCalculationPdfFile,
};

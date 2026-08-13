import { Share } from 'react-native';
import { generateReportPdf, shareReportPdf, generateAndShareReport } from '../services/pdfReportService';
import { createReportModel, createSummaryCard } from '../models/reportModel';

// Mock react-native-html-to-pdf
jest.mock('react-native-html-to-pdf', () => ({
  convert: jest.fn().mockResolvedValue({ filePath: '/mock/path/Finzo_Test_Report.pdf' }),
}));

describe('PDF Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleReportModel = createReportModel({
    title: 'Test EMI Report',
    subtitle: 'Unit Test',
    summaryCards: [createSummaryCard({ label: 'Loan Amount', value: '₹1,000,000' })],
  });

  describe('generateReportPdf', () => {
    it('renders HTML and generates local PDF file path', async () => {
      const filePath = await generateReportPdf(sampleReportModel);

      expect(filePath).toBe('/mock/path/Finzo_Test_Report.pdf');
    });

    it('throws error when report model is missing', async () => {
      await expect(generateReportPdf(null)).rejects.toThrow('Report model is required');
    });
  });

  describe('shareReportPdf', () => {
    it('invokes native Share API with formatted file:// URI', async () => {
      Share.share = jest.fn().mockResolvedValue({ action: Share.sharedAction });

      const result = await shareReportPdf('/mock/path/Finzo_Test_Report.pdf', 'Test Report');

      expect(Share.share).toHaveBeenCalledWith(
        {
          url: 'file:///mock/path/Finzo_Test_Report.pdf',
          title: 'Test Report',
        },
        { dialogTitle: 'Share Test Report' }
      );
      expect(result.success).toBe(true);
    });

    it('handles user share dismissal', async () => {
      Share.share = jest.fn().mockResolvedValue({ action: Share.dismissedAction });

      const result = await shareReportPdf('/mock/path/Finzo_Test_Report.pdf', 'Test Report');

      expect(result.dismissed).toBe(true);
    });
  });

  describe('generateAndShareReport', () => {
    it('combines PDF generation and native share sheet', async () => {
      Share.share = jest.fn().mockResolvedValue({ action: Share.sharedAction });

      const result = await generateAndShareReport(sampleReportModel);

      expect(result.success).toBe(true);
    });
  });
});

import { getEMIDonutChartData, getYearlyAmortizationSummary } from '../utils/emiAdapters';

describe('EMI Presentation Adapters', () => {
  const mockTheme = {
    primary: '#1D4ED8',
    secondary: '#F59E0B',
  };

  describe('getEMIDonutChartData', () => {
    it('should format chart data array with percentage breakdown', () => {
      const resultData = {
        principal: 800000,
        totalInterest: 200000,
      };

      const chartData = getEMIDonutChartData(resultData, mockTheme);
      expect(chartData).toHaveLength(2);

      const principalItem = chartData.find((d) => d.label === 'Principal');
      const interestItem = chartData.find((d) => d.label === 'Interest');

      expect(principalItem.value).toBe(800000);
      expect(principalItem.percentage).toBe(80);
      expect(interestItem.value).toBe(200000);
      expect(interestItem.percentage).toBe(20);
    });

    it('should return empty array when resultData is null', () => {
      expect(getEMIDonutChartData(null, mockTheme)).toEqual([]);
    });
  });

  describe('getYearlyAmortizationSummary', () => {
    it('should aggregate 24 monthly schedule items into 2 yearly summary items', () => {
      const mockMonthlySchedule = Array.from({ length: 24 }, (_, i) => ({
        month: i + 1,
        openingBalance: 100000 - i * 4000,
        payment: 5000,
        principalComponent: 4000,
        interestComponent: 1000,
        closingBalance: 100000 - (i + 1) * 4000,
      }));

      const yearlySummary = getYearlyAmortizationSummary(mockMonthlySchedule);
      expect(yearlySummary).toHaveLength(2);

      expect(yearlySummary[0].year).toBe(1);
      expect(yearlySummary[0].totalPayment).toBe(60000);
      expect(yearlySummary[0].principalComponent).toBe(48000);
      expect(yearlySummary[0].interestComponent).toBe(12000);

      expect(yearlySummary[1].year).toBe(2);
      expect(yearlySummary[1].totalPayment).toBe(60000);
    });

    it('should return empty array for empty or non-array input', () => {
      expect(getYearlyAmortizationSummary([])).toEqual([]);
      expect(getYearlyAmortizationSummary(null)).toEqual([]);
    });
  });
});

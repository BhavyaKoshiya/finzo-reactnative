import { roundCurrency } from '../../../../calculations/core/rounding';

/**
 * Prepares Gifted Charts data for Principal vs Interest breakdown.
 * @param {Object} resultData - { principal, totalInterest }
 * @param {Object} theme - AppTheme tokens
 * @returns {Array<Object>} Array suitable for Gifted Charts PieChart
 */
export const getEMIDonutChartData = (resultData, theme) => {
  if (!resultData) return [];

  const { principal = 0, totalInterest = 0 } = resultData;
  const total = principal + totalInterest;

  const principalPct = total > 0 ? Math.round((principal / total) * 100) : 0;
  const interestPct = total > 0 ? 100 - principalPct : 0;

  return [
    {
      value: principal,
      color: theme.primary,
      text: `${principalPct}%`,
      focused: true,
      label: 'Principal',
      percentage: principalPct,
    },
    {
      value: totalInterest,
      color: theme.secondary || '#F59E0B',
      text: `${interestPct}%`,
      label: 'Interest',
      percentage: interestPct,
    },
  ];
};

/**
 * Aggregates a monthly amortization schedule into yearly summary rows.
 * @param {Array<Object>} schedule - Array of monthly amortization objects
 * @returns {Array<Object>} Aggregated yearly schedule
 */
export const getYearlyAmortizationSummary = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) return [];

  const yearlyMap = {};

  schedule.forEach((row) => {
    const yearIndex = Math.ceil(row.month / 12);
    if (!yearlyMap[yearIndex]) {
      yearlyMap[yearIndex] = {
        year: yearIndex,
        openingBalance: row.openingBalance,
        totalPayment: 0,
        principalComponent: 0,
        interestComponent: 0,
        closingBalance: row.closingBalance,
      };
    }

    yearlyMap[yearIndex].totalPayment += row.payment;
    yearlyMap[yearIndex].principalComponent += row.principalComponent;
    yearlyMap[yearIndex].interestComponent += row.interestComponent;
    yearlyMap[yearIndex].closingBalance = row.closingBalance;
  });

  return Object.values(yearlyMap).map((yr) => ({
    year: yr.year,
    openingBalance: roundCurrency(yr.openingBalance),
    totalPayment: roundCurrency(yr.totalPayment),
    principalComponent: roundCurrency(yr.principalComponent),
    interestComponent: roundCurrency(yr.interestComponent),
    closingBalance: roundCurrency(yr.closingBalance),
  }));
};

export default {
  getEMIDonutChartData,
  getYearlyAmortizationSummary,
};

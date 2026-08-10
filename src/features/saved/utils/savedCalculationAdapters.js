import { formatINR, formatINRCompact } from '../../../calculations/core/currency';
import { formatPercentage, formatNumber } from '../../../utils/financeFormatters';

/**
 * Maps a saved calculation snapshot to its primary metric display value and label.
 * @param {Object} savedItem
 * @returns {Object} { primaryValue: string, primaryLabel: string }
 */
export const getSavedCalculationPrimaryResult = (savedItem) => {
  if (!savedItem || !savedItem.calculatorId || !savedItem.result) {
    return { primaryValue: 'N/A', primaryLabel: 'Result' };
  }

  const { calculatorId, result } = savedItem;

  // Loan Calculators
  if (
    calculatorId === 'home-loan-emi' ||
    calculatorId === 'personal-loan-emi' ||
    calculatorId === 'car-loan-emi' ||
    calculatorId === 'education-loan-emi' ||
    calculatorId === 'business-loan-emi' ||
    calculatorId === 'emi'
  ) {
    const emi = result.monthlyEMI || 0;
    return {
      primaryValue: `${formatINR(emi)} / mo`,
      primaryLabel: 'Monthly EMI',
    };
  }

  // SIP
  if (calculatorId === 'sip') {
    const maturity = result.maturityAmount || 0;
    return {
      primaryValue: `${formatINRCompact(maturity)} est. value`,
      primaryLabel: 'Estimated Value',
    };
  }

  // FD
  if (calculatorId === 'fd') {
    const maturity = result.maturityAmount || 0;
    return {
      primaryValue: `${formatINRCompact(maturity)} maturity`,
      primaryLabel: 'Maturity Amount',
    };
  }

  // RD
  if (calculatorId === 'rd') {
    const maturity = result.maturityAmount || 0;
    return {
      primaryValue: `${formatINRCompact(maturity)} maturity`,
      primaryLabel: 'Maturity Amount',
    };
  }

  // CAGR
  if (calculatorId === 'cagr') {
    const cagr = result.cagr || 0;
    return {
      primaryValue: `${formatPercentage(cagr)} CAGR`,
      primaryLabel: 'Annual Growth Rate',
    };
  }

  // ROI
  if (calculatorId === 'roi') {
    const roi = result.roi || 0;
    return {
      primaryValue: `${formatPercentage(roi)} ROI`,
      primaryLabel: 'Return on Investment',
    };
  }

  // GST
  if (calculatorId === 'gst') {
    const total = result.totalAmount || 0;
    const gstAmt = result.gstAmount || 0;
    return {
      primaryValue: formatINR(total),
      primaryLabel: `Total (${formatINR(gstAmt)} GST)`,
    };
  }

  // Simple Interest
  if (calculatorId === 'simple-interest') {
    const interest = result.interest || 0;
    return {
      primaryValue: `${formatINR(interest)} interest`,
      primaryLabel: 'Interest Earned',
    };
  }

  // Compound Interest
  if (calculatorId === 'compound-interest') {
    const interest = result.interestEarned || 0;
    return {
      primaryValue: `${formatINR(interest)} interest`,
      primaryLabel: 'Interest Earned',
    };
  }

  // Percentage
  if (calculatorId === 'percentage') {
    const mode = result.mode || 'percentage-of';
    if (mode === 'percentage-of') {
      const calculatedVal = result.result || 0;
      return {
        primaryValue: formatNumber(calculatedVal),
        primaryLabel: 'Calculated Result',
      };
    }
    if (mode === 'percentage-change') {
      const pctChange = result.percentageChange || 0;
      const isInc = result.isIncrease;
      return {
        primaryValue: `${formatPercentage(pctChange)} ${isInc ? 'increase' : 'decrease'}`,
        primaryLabel: 'Percentage Change',
      };
    }
    if (mode === 'percentage-difference') {
      const pctDiff = result.percentageDifference || 0;
      return {
        primaryValue: `${formatPercentage(pctDiff)} diff`,
        primaryLabel: 'Percentage Difference',
      };
    }
  }

  return {
    primaryValue: 'View Result',
    primaryLabel: 'Calculation',
  };
};

export default {
  getSavedCalculationPrimaryResult,
};

import { format } from 'date-fns';

/**
 * Creates a normalized export model representing any calculator state or saved snapshot.
 */
export const createCalculationExportModel = ({
  calculatorId,
  title,
  subtitle = 'Financial calculation report',
  customTitle = '',
  calculatedAt = new Date().toISOString(),
  inputs = [],
  primaryResult = null,
  results = [],
  sections = [],
}) => {
  const formattedDate = format(new Date(calculatedAt), 'dd MMM yyyy, h:mm a');

  return {
    calculatorId,
    title: title || 'Financial Calculation',
    subtitle,
    customTitle,
    calculatedAt,
    formattedDate,
    inputs,
    primaryResult,
    results,
    sections,
  };
};

export default createCalculationExportModel;

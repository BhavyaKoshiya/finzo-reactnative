/**
 * Pure Text Share Builder
 * Formats a clean, readable calculation summary for sharing via Messaging/Email.
 */
export const buildShareText = (exportModel) => {
  if (!exportModel) return '';

  const { title, customTitle, primaryResult, inputs = [], results = [] } = exportModel;

  const displayTitle = customTitle || title || 'Financial Calculation';
  const lines = [
    `📊 ${displayTitle} (Finzo)`,
    '────────────────────────',
  ];

  if (primaryResult) {
    lines.push(`• ${primaryResult.label}: ${primaryResult.value}${primaryResult.supportingText ? ` (${primaryResult.supportingText})` : ''}`);
    lines.push('');
  }

  if (inputs.length > 0) {
    lines.push('Inputs:');
    inputs.forEach((inp) => {
      lines.push(`  - ${inp.label}: ${inp.value}`);
    });
    lines.push('');
  }

  if (results.length > 0) {
    lines.push('Summary:');
    results.forEach((res) => {
      lines.push(`  - ${res.label}: ${res.value}`);
    });
    lines.push('');
  }

  lines.push('Calculated with Finzo');
  return lines.join('\n');
};

export default buildShareText;

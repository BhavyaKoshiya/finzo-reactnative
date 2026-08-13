/**
 * PDF Chart Generator Utility.
 * Renders print-friendly inline HTML/SVG progress bars and legends
 * for breakdown visual representation inside PDF reports.
 */

/**
 * Generates an inline HTML breakdown bar for two-part allocations.
 * @param {Object} params
 * @param {string} params.labelA
 * @param {number} params.valueA
 * @param {string} params.colorA
 * @param {string} params.labelB
 * @param {number} params.valueB
 * @param {string} params.colorB
 * @param {function} params.formatter
 * @returns {string} HTML string
 */
export const renderTwoPartBreakdownHtml = ({
  labelA = 'Principal',
  valueA = 0,
  colorA = '#2563EB',
  labelB = 'Interest',
  valueB = 0,
  colorB = '#F59E0B',
  formatter = (v) => String(v),
}) => {
  const numA = Math.max(0, Number(valueA) || 0);
  const numB = Math.max(0, Number(valueB) || 0);
  const total = numA + numB;

  let pctA = total > 0 ? Math.round((numA / total) * 100) : 50;
  let pctB = total > 0 ? 100 - pctA : 50;

  if (total > 0 && numA > 0 && pctA === 0) pctA = 1;
  if (total > 0 && numB > 0 && pctB === 0) pctB = 1;

  return `
    <div class="chart-container">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1E293B;">
        <span>${labelA}: ${formatter(numA)} (${pctA}%)</span>
        <span>${labelB}: ${formatter(numB)} (${pctB}%)</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-segment" style="width: ${pctA}%; background-color: ${colorA};"></div>
        <div class="chart-bar-segment" style="width: ${pctB}%; background-color: ${colorB};"></div>
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${colorA};"></div>
          <span>${labelA} (${pctA}%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${colorB};"></div>
          <span>${labelB} (${pctB}%)</span>
        </div>
      </div>
    </div>
  `;
};

export default {
  renderTwoPartBreakdownHtml,
};

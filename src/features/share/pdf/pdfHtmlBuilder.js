import escapeHtml from '../utils/htmlEscape';
import getPdfCssStyles from './pdfStyles';

/**
 * Builds clean HTML string for HTML-to-PDF engine.
 * @param {Object} exportModel
 * @param {'quick'|'detailed'} mode
 * @returns {string} Full HTML document
 */
export const buildCalculationPdfHtml = (exportModel, mode = 'quick') => {
  if (!exportModel) return '';

  const cssStyles = getPdfCssStyles();

  const title = escapeHtml(exportModel.title);
  const customTitle = escapeHtml(exportModel.customTitle);
  const formattedDate = escapeHtml(exportModel.formattedDate);

  const primaryResult = exportModel.primaryResult;
  const inputs = exportModel.inputs || [];
  const results = exportModel.results || [];
  const sections = exportModel.sections || [];

  // Render inputs table
  let inputsHtml = '';
  if (inputs.length > 0) {
    const inputRows = inputs
      .map(
        (inp) => `
      <tr>
        <td style="font-weight: 600; color: #475569;">${escapeHtml(inp.label)}</td>
        <td class="number" style="font-weight: 700;">${escapeHtml(inp.value)}</td>
      </tr>`
      )
      .join('');

    inputsHtml = `
      <div style="margin-bottom: 20px;">
        <div class="section-title">CALCULATION INPUTS</div>
        <table class="data-table">
          <tbody>${inputRows}</tbody>
        </table>
      </div>`;
  }

  // Render summary results table
  let resultsHtml = '';
  if (results.length > 0) {
    const resultRows = results
      .map(
        (res) => `
      <tr>
        <td style="font-weight: 600; color: #475569;">${escapeHtml(res.label)}</td>
        <td class="number" style="font-weight: 700; color: #0F172A;">${escapeHtml(res.value)}</td>
      </tr>`
      )
      .join('');

    resultsHtml = `
      <div style="margin-bottom: 20px;">
        <div class="section-title">SUMMARY BREAKDOWN</div>
        <table class="data-table">
          <tbody>${resultRows}</tbody>
        </table>
      </div>`;
  }

  // Render sections (tables, projections, amortization) for detailed mode
  let sectionsHtml = '';
  if (mode === 'detailed' && sections.length > 0) {
    sectionsHtml = sections
      .map((sec) => {
        const secTitle = escapeHtml(sec.title);
        if (sec.type === 'table' && Array.isArray(sec.rows)) {
          const headersHtml = (sec.headers || [])
            .map((h, i) => {
              const align = sec.alignments && sec.alignments[i] ? sec.alignments[i] : 'left';
              return `<th class="${align === 'right' ? 'number' : ''}">${escapeHtml(h)}</th>`;
            })
            .join('');

          const rowsHtml = sec.rows
            .map((row) => {
              const cells = row
                .map((cell, i) => {
                  const align = sec.alignments && sec.alignments[i] ? sec.alignments[i] : 'left';
                  return `<td class="${align === 'right' ? 'number' : ''}">${escapeHtml(cell)}</td>`;
                })
                .join('');
              return `<tr>${cells}</tr>`;
            })
            .join('');

          return `
            <div style="margin-top: 16px;">
              <div class="section-title">${secTitle}</div>
              <table class="data-table">
                <thead><tr>${headersHtml}</tr></thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>`;
        }
        return '';
      })
      .join('');
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${cssStyles}</style>
      </head>
      <body>
        <div class="running-header">
          <div>FINZO • ${title}</div>
          <div>${formattedDate}</div>
        </div>

        <div class="running-footer">
          <div>Calculated with Finzo • Offline Financial Utility</div>
          <div>Report</div>
        </div>

        <div class="header">
          <div>
            <div class="brand-title">FINZO</div>
            <div class="brand-sub">Financial Planning Utility</div>
          </div>
          <div class="report-info">
            <div class="report-title">${title}</div>
            <div class="report-date">${formattedDate}</div>
          </div>
        </div>

        ${customTitle ? `<div class="custom-title-banner">${customTitle}</div>` : ''}

        ${
          primaryResult
            ? `<div class="hero-card">
                <div class="hero-label">${escapeHtml(primaryResult.label)}</div>
                <div class="hero-value">${escapeHtml(primaryResult.value)}</div>
                ${
                  primaryResult.supportingText
                    ? `<div class="hero-support">${escapeHtml(primaryResult.supportingText)}</div>`
                    : ''
                }
              </div>`
            : ''
        }

        <div class="grid-container">
          <div class="grid-row">
            <div class="grid-cell">${inputsHtml}</div>
            <div class="grid-cell">${resultsHtml}</div>
          </div>
        </div>

        ${sectionsHtml}

        <div class="footer">
          Calculated with Finzo • Offline Financial Utility
        </div>
      </body>
    </html>
  `;
};

export default buildCalculationPdfHtml;

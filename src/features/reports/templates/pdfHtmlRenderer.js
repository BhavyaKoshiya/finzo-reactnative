import getPdfCss from './pdfStyles';
import { renderTwoPartBreakdownHtml } from '../utils/pdfChartUtils';

/**
 * HTML Template Renderer for Finzo PDF Reports.
 * Converts a normalized reportModel into clean, print-friendly HTML.
 * @param {Object} reportModel Normalized report model
 * @returns {string} Complete HTML string
 */
export const buildReportPdfHtml = (reportModel) => {
  if (!reportModel) {
    return '<html><body><p>Invalid Report Model</p></body></html>';
  }

  const {
    title,
    subtitle,
    generatedAt,
    summaryCards = [],
    sections = [],
    assumptions = [],
    disclaimer,
  } = reportModel;

  const css = getPdfCss();

  // 1. Render Summary Cards Grid
  let summaryCardsHtml = '';
  if (summaryCards.length > 0) {
    summaryCardsHtml = `
      <div class="summary-cards-grid">
        ${summaryCards
          .map(
            (card) => `
          <div class="summary-card ${card.highlight ? 'highlight' : ''}">
            <div class="summary-label">${card.label}</div>
            <div class="summary-value" style="color: ${card.color || '#1E293B'};">${card.value}</div>
            ${card.subtitle ? `<div class="summary-subtitle">${card.subtitle}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // 2. Render Sections
  let sectionsHtml = '';
  sections.forEach((section) => {
    const { title: secTitle, type, items = [], tableHeaders = [], tableRows = [], chartData, description } = section;

    let secContent = '';

    if (description) {
      secContent += `<p style="font-size: 8.5pt; color: #64748B; margin-bottom: 6pt;">${description}</p>`;
    }

    if (type === 'key_value' && items.length > 0) {
      secContent += `
        <table class="kv-table">
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td class="kv-label ${item.indent ? 'indent' : ''}">
                  ${item.label} ${item.isEstimate ? '<span style="font-size: 7pt; color: #D97706; font-weight: 600;">(Estimated)</span>' : ''}
                </td>
                <td class="kv-value ${item.highlight ? 'highlight' : ''}">${item.value}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'chart_breakdown' && chartData) {
      secContent += renderTwoPartBreakdownHtml(chartData);
    } else if (type === 'table' && tableHeaders.length > 0) {
      secContent += `
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                ${tableHeaders.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows
                .map(
                  (row) => `
                <tr>
                  ${row
                    .map((cell, idx) => {
                      if (typeof cell === 'object' && cell !== null && cell.badge) {
                        const chipClass = cell.badgeType ? `chip-${cell.badgeType}` : 'chip-emi';
                        return `<td><span class="chip-tag ${chipClass}">${cell.text}</span></td>`;
                      }
                      return `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`;
                    })
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    sectionsHtml += `
      <div class="section-block">
        <div class="section-title">${secTitle}</div>
        ${secContent}
      </div>
    `;
  });

  // 3. Render Assumptions & Disclaimer
  let assumptionsHtml = '';
  if (assumptions.length > 0 || disclaimer) {
    assumptionsHtml = `
      <div class="assumptions-box">
        ${
          assumptions.length > 0
            ? `
          <div class="assumptions-title">How Finzo calculates these figures</div>
          <ul class="assumptions-list">
            ${assumptions.map((a) => `<li>${a}</li>`).join('')}
          </ul>
        `
            : ''
        }
        ${disclaimer ? `<div class="disclaimer-text">${disclaimer}</div>` : ''}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="report-container">
          <!-- Report Header -->
          <div class="report-header">
            <div>
              <div class="brand-title">FINZO</div>
              <div class="brand-tagline">Financial Calculator & Loan Planner</div>
            </div>
            <div class="report-title-box">
              <div class="report-title">${title}</div>
              <div class="report-meta">${subtitle ? `${subtitle} • ` : ''}${generatedAt}</div>
            </div>
          </div>

          <!-- Summary Cards -->
          ${summaryCardsHtml}

          <!-- Main Content Sections -->
          ${sectionsHtml}

          <!-- Assumptions & Disclaimer -->
          ${assumptionsHtml}

          <!-- Footer -->
          <div class="report-footer">
            <span>FINZO — Private financial record — generated locally</span>
            <span>Document generated on ${generatedAt}</span>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default buildReportPdfHtml;

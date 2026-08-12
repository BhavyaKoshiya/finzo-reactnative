/**
 * Safely interpolates placeholders in configuration copy string templates.
 *
 * Supported placeholders:
 * - {points}
 * - {count}
 * - {day}
 * - {reward}
 * - {nextReward}
 *
 * @param {string} template - Raw copy string containing optional {placeholder} tokens
 * @param {Object} values - Key-value map of replacement values
 * @returns {string} Interpolated copy string
 */
export const interpolateRewardCopy = (template, values = {}) => {
  if (typeof template !== 'string') return '';
  if (!values || typeof values !== 'object') return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key) && values[key] !== undefined && values[key] !== null) {
      return String(values[key]);
    }
    // Return original token if placeholder is unfulfilled
    return match;
  });
};

export default {
  interpolateRewardCopy,
};

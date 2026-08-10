import { CALCULATOR_REGISTRY } from '../registry/calculatorRegistry';

/**
 * Searches calculators across metadata (name, shortName, description, keywords, category)
 * and returns ranked results sorted by relevance.
 *
 * @param {string} rawQuery - Search term query string
 * @param {Array<Object>} [calculators=CALCULATOR_REGISTRY] - List of calculator registry items
 * @param {string} [categoryFilter='all'] - Optional category filter ID
 * @returns {Array<Object>} Ranked array of calculator registry items
 */
export const searchCalculators = (
  rawQuery = '',
  calculators = CALCULATOR_REGISTRY,
  categoryFilter = 'all',
) => {
  if (!Array.isArray(calculators)) {
    return [];
  }

  // First apply category filtering if selected
  let baseList = calculators;
  if (categoryFilter && categoryFilter !== 'all') {
    baseList = baseList.filter((item) => item.category === categoryFilter);
  }

  const query = (rawQuery || '').trim().toLowerCase();
  if (query.length === 0) {
    return baseList;
  }

  const scoredItems = [];

  baseList.forEach((item) => {
    const nameLower = (item.name || '').toLowerCase();
    const shortNameLower = (item.shortName || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();
    const keywords = Array.isArray(item.keywords)
      ? item.keywords.map((k) => k.toLowerCase())
      : [];

    let score = 0;

    // Rank 1: Exact match on name or shortName
    if (nameLower === query || shortNameLower === query) {
      score += 100;
    }
    // Rank 2: Name or shortName starts with query
    else if (nameLower.startsWith(query) || shortNameLower.startsWith(query)) {
      score += 80;
    }
    // Rank 3: Name or shortName contains query
    else if (nameLower.includes(query) || shortNameLower.includes(query)) {
      score += 60;
    }

    // Rank 4: Exact or partial match in keywords array
    const keywordMatch = keywords.some(
      (kw) => kw === query || kw.startsWith(query) || kw.includes(query),
    );
    if (keywordMatch) {
      score += 40;
    }

    // Rank 5: Description contains query
    if (descLower.includes(query)) {
      score += 20;
    }

    // Rank 6: Category match
    if (categoryLower.includes(query)) {
      score += 10;
    }

    if (score > 0) {
      scoredItems.push({ item, score });
    }
  });

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((entry) => entry.item);
};

export default {
  searchCalculators,
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import logger from './logger';

/**
 * Asks for a Play Store rating through Google's In-App Review API, only after the user
 * has had a few good experiences (e.g. recorded an EMI, saw interest saved by prepaying).
 * More and better ratings raise the store listing's install rate, which lowers the cost
 * of every paid install.
 *
 * Google decides whether the review card is actually shown and enforces its own quota,
 * so these rules only keep LoanPilot from asking at bad moments or too often.
 */

export const REVIEW_PROMPT_STORAGE_KEY = '@loanpilot/review_prompt_v1';

export const REVIEW_PROMPT_RULES = {
  /** Good experiences needed before the first request */
  minPositiveMoments: 3,
  /** Days since the app was first used */
  minDaysSinceFirstUse: 2,
  /** Days between requests */
  minDaysBetweenPrompts: 120,
  /** Requests over the app's lifetime */
  maxPrompts: 3,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const createInitialReviewPromptState = (now) => ({
  firstUsedAt: now,
  positiveMoments: 0,
  promptCount: 0,
  lastPromptAt: null,
});

/**
 * Persisted state is untrusted: fill in missing or invalid fields.
 */
export const normalizeReviewPromptState = (raw, now) => {
  const initial = createInitialReviewPromptState(now);
  if (!raw || typeof raw !== 'object') return initial;

  const asCount = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);
  const asTime = (value) => (Number.isFinite(value) && value > 0 ? value : null);

  return {
    firstUsedAt: asTime(raw.firstUsedAt) ?? initial.firstUsedAt,
    positiveMoments: asCount(raw.positiveMoments),
    promptCount: asCount(raw.promptCount),
    lastPromptAt: asTime(raw.lastPromptAt),
  };
};

/**
 * @returns {boolean} Whether a review may be requested now
 */
export const isReviewPromptDue = (state, now, rules = REVIEW_PROMPT_RULES) => {
  if (state.promptCount >= rules.maxPrompts) return false;
  if (state.positiveMoments < rules.minPositiveMoments) return false;
  if (now - state.firstUsedAt < rules.minDaysSinceFirstUse * DAY_MS) return false;
  if (state.lastPromptAt && now - state.lastPromptAt < rules.minDaysBetweenPrompts * DAY_MS) {
    return false;
  }
  return true;
};

class ReviewPromptService {
  /**
   * Records a good experience and, when the rules allow, requests a review.
   * Never throws: a review prompt must not disturb the user's workflow.
   *
   * @param {string} moment - e.g. 'payment_recorded', 'prepayment_savings_viewed'
   * @returns {Promise<boolean>} Whether a review was requested
   */
  async recordPositiveMoment(moment) {
    try {
      const now = Date.now();
      const stored = await AsyncStorage.getItem(REVIEW_PROMPT_STORAGE_KEY);
      const state = normalizeReviewPromptState(stored ? JSON.parse(stored) : null, now);
      state.positiveMoments += 1;

      const shouldPrompt = isReviewPromptDue(state, now) && InAppReview.isAvailable();
      if (shouldPrompt) {
        state.promptCount += 1;
        state.lastPromptAt = now;
      }
      await AsyncStorage.setItem(REVIEW_PROMPT_STORAGE_KEY, JSON.stringify(state));

      if (shouldPrompt) {
        await InAppReview.RequestInAppReview();
        if (__DEV__) {
          logger.info('ReviewPromptService: review requested', { moment });
        }
      }
      return shouldPrompt;
    } catch (err) {
      logger.warn('ReviewPromptService: review request failed', { moment, error: err?.message });
      return false;
    }
  }
}

export const reviewPromptService = new ReviewPromptService();
export default reviewPromptService;

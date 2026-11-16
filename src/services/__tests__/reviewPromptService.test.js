/**
 * The Play In-App Review prompt is requested only after good experiences,
 * and never too early or too often.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import reviewPromptService, {
  REVIEW_PROMPT_STORAGE_KEY,
  isReviewPromptDue,
  normalizeReviewPromptState,
} from '../reviewPromptService';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
      setItem: jest.fn(async (key, value) => {
        store[key] = value;
      }),
      clear: jest.fn(async () => {
        store = {};
      }),
    },
  };
});

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 16);

const dueState = {
  firstUsedAt: NOW - 3 * DAY,
  positiveMoments: 3,
  promptCount: 0,
  lastPromptAt: null,
};

describe('isReviewPromptDue', () => {
  test('due after enough good moments and days of use', () => {
    expect(isReviewPromptDue(dueState, NOW)).toBe(true);
  });

  test('not due with too few good moments', () => {
    expect(isReviewPromptDue({ ...dueState, positiveMoments: 2 }, NOW)).toBe(false);
  });

  test('not due on the first days of use', () => {
    expect(isReviewPromptDue({ ...dueState, firstUsedAt: NOW - DAY }, NOW)).toBe(false);
  });

  test('not due again within 120 days, due after', () => {
    expect(isReviewPromptDue({ ...dueState, promptCount: 1, lastPromptAt: NOW - 30 * DAY }, NOW)).toBe(false);
    expect(isReviewPromptDue({ ...dueState, promptCount: 1, lastPromptAt: NOW - 121 * DAY }, NOW)).toBe(true);
  });

  test('never more than 3 times', () => {
    expect(isReviewPromptDue({ ...dueState, promptCount: 3, lastPromptAt: NOW - 400 * DAY }, NOW)).toBe(false);
  });
});

describe('normalizeReviewPromptState', () => {
  test('tolerates missing or corrupted persisted state', () => {
    expect(normalizeReviewPromptState(null, NOW)).toEqual({
      firstUsedAt: NOW,
      positiveMoments: 0,
      promptCount: 0,
      lastPromptAt: null,
    });
    expect(
      normalizeReviewPromptState({ firstUsedAt: 'x', positiveMoments: -2, promptCount: 1.5 }, NOW)
    ).toEqual({ firstUsedAt: NOW, positiveMoments: 0, promptCount: 0, lastPromptAt: null });
  });
});

describe('reviewPromptService.recordPositiveMoment', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('counts the moment without asking when not yet due', async () => {
    await expect(reviewPromptService.recordPositiveMoment('payment_recorded')).resolves.toBe(false);

    expect(InAppReview.RequestInAppReview).not.toHaveBeenCalled();
    const saved = JSON.parse(await AsyncStorage.getItem(REVIEW_PROMPT_STORAGE_KEY));
    expect(saved.positiveMoments).toBe(1);
  });

  test('asks for a review once due, and records the request', async () => {
    await AsyncStorage.setItem(
      REVIEW_PROMPT_STORAGE_KEY,
      JSON.stringify({ ...dueState, positiveMoments: 2 })
    );

    await expect(reviewPromptService.recordPositiveMoment('payment_recorded')).resolves.toBe(true);

    expect(InAppReview.RequestInAppReview).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(await AsyncStorage.getItem(REVIEW_PROMPT_STORAGE_KEY));
    expect(saved.promptCount).toBe(1);
    expect(saved.lastPromptAt).toBe(NOW);
  });

  test('never throws when the review API fails', async () => {
    await AsyncStorage.setItem(
      REVIEW_PROMPT_STORAGE_KEY,
      JSON.stringify({ ...dueState, positiveMoments: 2 })
    );
    InAppReview.RequestInAppReview.mockRejectedValueOnce(new Error('Play unavailable'));

    await expect(reviewPromptService.recordPositiveMoment('payment_recorded')).resolves.toBe(false);
  });
});

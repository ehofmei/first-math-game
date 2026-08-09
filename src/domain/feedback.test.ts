import { describe, expect, it } from 'vitest';
import {
  answerFeedbackDelay,
  CORRECT_ANSWER_FEEDBACK_MS,
  INCORRECT_ANSWER_FEEDBACK_MS,
} from './feedback';

describe('answer feedback timing', () => {
  it('keeps correct answers quick and gives incorrect answers longer to register', () => {
    expect(answerFeedbackDelay(true)).toBe(CORRECT_ANSWER_FEEDBACK_MS);
    expect(answerFeedbackDelay(false)).toBe(INCORRECT_ANSWER_FEEDBACK_MS);
    expect(INCORRECT_ANSWER_FEEDBACK_MS).toBeGreaterThan(CORRECT_ANSWER_FEEDBACK_MS);
  });
});

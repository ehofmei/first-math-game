export const CORRECT_ANSWER_FEEDBACK_MS = 340;
export const INCORRECT_ANSWER_FEEDBACK_MS = 500;

export function answerFeedbackDelay(correct: boolean): number {
  return correct ? CORRECT_ANSWER_FEEDBACK_MS : INCORRECT_ANSWER_FEEDBACK_MS;
}

import type { Clock } from './clock';
import type { GameSettings, OperationId, Problem } from './math';

export const RULESET_VERSION = 2;

export interface AnswerRecord {
  problemId: string;
  skillKey: string;
  operation: OperationId;
  left: number;
  right: number;
  choices: number[];
  correctChoiceIndex: number;
  selectedAnswer: number;
  correctAnswer: number;
  correct: boolean;
  responseMs: number;
}

export interface SessionSummary {
  rulesetVersion: number;
  id: string;
  completedAt: string;
  settings: GameSettings;
  seed: number;
  answers: AnswerRecord[];
  correctCount: number;
  accuracy: number;
  elapsedMs: number;
  score: number;
  coinsPotential: number;
  coinsEarned: number;
}

export function scoreAnswer(correct: boolean, responseMs: number): number {
  if (!correct) return 0;
  const boundedResponse = Math.max(0, responseMs);
  const speedBonus = Math.max(0, Math.round(50 - boundedResponse / 200));
  return 100 + speedBonus;
}

export function summarizeSession(
  problems: readonly Problem[],
  answers: readonly AnswerRecord[],
  settings: GameSettings,
  seed: number,
  clock: Clock,
): SessionSummary {
  if (answers.length !== problems.length) {
    throw new Error('A completed session needs one answer per problem.');
  }
  const correctCount = answers.filter((answer) => answer.correct).length;
  const elapsedMs = answers.reduce((sum, answer) => sum + Math.max(0, answer.responseMs), 0);
  const score = answers.reduce(
    (sum, answer) => sum + scoreAnswer(answer.correct, answer.responseMs),
    0,
  );
  const accuracyBonus = correctCount / problems.length >= 0.8 ? 2 : 0;
  const perfectBonus = correctCount === problems.length ? 3 : 0;
  const coinsEarned = correctCount + accuracyBonus + perfectBonus;

  return {
    rulesetVersion: RULESET_VERSION,
    id: `session:${clock.now()}:${seed}`,
    completedAt: new Date(clock.now()).toISOString(),
    settings,
    seed,
    answers: [...answers],
    correctCount,
    accuracy: correctCount / problems.length,
    elapsedMs,
    score,
    coinsPotential: coinsEarned,
    coinsEarned,
  };
}

import { describe, expect, it } from 'vitest';
import { createEmptyArchivedProgress, archiveSession } from '../domain/progress';
import { DEFAULT_SETTINGS } from '../domain/math';
import type { AnswerRecord, SessionSummary } from '../domain/session';
import {
  deriveResultDialogueFacts,
  MAX_PACE_ACCURACY_DROP,
  PACE_IMPROVEMENT_RATIO,
} from './resultFacts';

function summary({
  id,
  correct = 8,
  elapsedMs = 10_000,
  score = 1_000,
  operations = DEFAULT_SETTINGS.operations,
}: {
  id: string;
  correct?: number;
  elapsedMs?: number;
  score?: number;
  operations?: SessionSummary['settings']['operations'];
}): SessionSummary {
  const answers = Array.from({ length: 10 }, (_, index) => ({
    problemId: `${id}:${index}`,
    skillKey: 'addition:easy',
    operation: operations[index % operations.length]!,
    left: index,
    right: 1,
    choices: [index, index + 1, index + 2, index + 3],
    correctChoiceIndex: 1,
    selectedAnswer: index < correct ? index + 1 : index,
    correctAnswer: index + 1,
    correct: index < correct,
    responseMs: elapsedMs / 10,
  })) satisfies AnswerRecord[];
  return {
    rulesetVersion: 6,
    id,
    completedAt: '2026-08-19T12:00:00.000Z',
    settings: { ...DEFAULT_SETTINGS, operations: [...operations], questionCount: 10 },
    seed: 1,
    answers,
    correctCount: correct,
    accuracy: correct / 10,
    elapsedMs,
    score,
    coinsPotential: 0,
    coinsEarned: 0,
  };
}

describe('deriveResultDialogueFacts', () => {
  it('recognizes a first, perfect round without inventing a prior personal best', () => {
    const facts = deriveResultDialogueFacts(
      summary({ id: 'first', correct: 10 }),
      [],
      createEmptyArchivedProgress(),
    );

    expect(facts).toMatchObject({
      accuracy: 1,
      perfect: true,
      firstRound: true,
      personalBest: false,
      accuracyImproved: false,
      paceImproved: false,
      completedQuestions: 10,
    });
    expect(facts.operationLabels).toEqual(['addition', 'subtraction']);
  });

  it('recognizes a new score best plus meaningful accuracy and pace improvements', () => {
    const previous = summary({ id: 'previous', correct: 7, elapsedMs: 20_000, score: 900 });
    const current = summary({ id: 'current', correct: 9, elapsedMs: 10_000, score: 1_100 });
    const facts = deriveResultDialogueFacts(current, [previous], createEmptyArchivedProgress());

    expect(facts).toMatchObject({
      firstRound: false,
      personalBest: true,
      accuracyImproved: true,
      paceImproved: true,
    });
  });

  it('does not call speed improvement progress when accuracy drops materially', () => {
    const previous = summary({ id: 'previous', correct: 9, elapsedMs: 20_000 });
    const current = summary({ id: 'current', correct: 8, elapsedMs: 5_000 });
    const facts = deriveResultDialogueFacts(current, [previous], createEmptyArchivedProgress());

    expect(previous.accuracy - current.accuracy).toBeGreaterThan(MAX_PACE_ACCURACY_DROP);
    expect(current.elapsedMs / previous.elapsedMs).toBeLessThan(PACE_IMPROVEMENT_RATIO);
    expect(facts.paceImproved).toBe(false);
  });

  it('uses archived configuration scores when judging a personal best', () => {
    const archivedBest = summary({ id: 'archived', score: 1_500 });
    const archived = archiveSession(createEmptyArchivedProgress(), archivedBest);
    const current = summary({ id: 'current', score: 1_200 });
    const facts = deriveResultDialogueFacts(current, [], archived);

    expect(facts.firstRound).toBe(false);
    expect(facts.personalBest).toBe(false);
    expect(facts.accuracyImproved).toBe(false);
  });

  it('does not compare accuracy or pace across different configurations', () => {
    const other = summary({
      id: 'other',
      correct: 2,
      elapsedMs: 40_000,
      operations: ['multiplication'],
    });
    const current = summary({ id: 'current', correct: 9, elapsedMs: 5_000 });
    const facts = deriveResultDialogueFacts(current, [other], createEmptyArchivedProgress());

    expect(facts.firstRound).toBe(false);
    expect(facts.accuracyImproved).toBe(false);
    expect(facts.paceImproved).toBe(false);
  });
});

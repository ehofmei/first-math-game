import { describe, expect, it } from 'vitest';
import { FakeClock } from '../domain/clock';
import { generateSession, type GameSettings } from '../domain/math';
import { SeededRandom } from '../domain/random';
import { summarizeSession } from '../domain/session';
import { applyCompletedSession, createInitialSave, type SaveData } from '../storage/save';
import {
  buildPlayHistoryExport,
  serializePlayHistory,
  summarizeConfigurations,
  summarizeRulesets,
} from './history';

function addRound(
  save: SaveData,
  settings: GameSettings,
  seed: number,
  incorrectIndex = -1,
): SaveData {
  const problems = generateSession(settings, new SeededRandom(seed));
  const answers = problems.map((problem, index) => ({
    problemId: problem.id,
    skillKey: problem.skillKey,
    operation: problem.operation,
    left: problem.left,
    right: problem.right,
    choices: problem.choices,
    correctChoiceIndex: problem.correctChoiceIndex,
    selectedAnswer: index === incorrectIndex ? Number.MIN_SAFE_INTEGER : problem.correctAnswer,
    correctAnswer: problem.correctAnswer,
    correct: index !== incorrectIndex,
    responseMs: 500 + index * 100,
  }));
  const clock = new FakeClock(Date.parse(`2026-01-0${seed}T12:00:00Z`));
  const summary = summarizeSession(problems, answers, settings, seed, clock);
  return applyCompletedSession(save, summary, clock.today());
}

describe('play history analysis export', () => {
  it('exports an empty history and known or missing economy rewards safely', () => {
    const empty = createInitialSave('Hidden Name', 'cozy-cats:sunny');
    const emptyAnalysis = buildPlayHistoryExport(empty, '2026-02-01T12:00:00.000Z');
    expect(emptyAnalysis.overall).toEqual({
      averageScore: 0,
      averageScorePerQuestion: 0,
      averageAccuracyPercent: 0,
      averageResponseMs: 0,
      totalQuestions: 0,
    });
    expect(emptyAnalysis.configurations).toEqual([]);
    expect(emptyAnalysis.rulesets).toEqual([]);

    const withEvents: SaveData = {
      ...empty,
      economyEvents: [
        {
          id: 'known',
          occurredAt: '2026-02-01T12:00:00.000Z',
          type: 'capsule_opened',
          coinsSpent: 60,
          collectibleId: 'cozy-cats:sunny',
        },
        {
          id: 'retired-content',
          occurredAt: '2026-02-02T12:00:00.000Z',
          type: 'capsule_opened',
          coinsSpent: 60,
          collectibleId: 'retired:friend',
        },
      ],
    };
    const events = buildPlayHistoryExport(withEvents, '2026-02-03T12:00:00.000Z').economyEvents;
    expect(events[0]).toMatchObject({ collectibleKind: 'cat', rarity: 'common' });
    expect(events[1]).toMatchObject({ collectibleKind: null, rarity: null });
  });

  it('exports reproducible question, score, timing, settings, and economy data without a name', () => {
    const settings: GameSettings = {
      operations: ['division', 'addition', 'multiplication', 'subtraction'],
      difficulty: 'hard',
      questionCount: 10,
    };
    const save = addRound(createInitialSave('Private Player', 'cozy-cats:sunny'), settings, 1, 2);
    const analysis = buildPlayHistoryExport(save, '2026-02-01T12:00:00.000Z');
    const serialized = serializePlayHistory(save, '2026-02-01T12:00:00.000Z');

    expect(serialized).not.toContain('Private Player');
    expect(analysis.privacy.playerNameIncluded).toBe(false);
    expect(analysis.currentState.completedRoundCount).toBe(1);
    expect(analysis.overall.totalQuestions).toBe(10);
    expect(analysis.sessions[0]).toMatchObject({
      rulesetVersion: 3,
      seed: 1,
      settings: {
        operations: ['addition', 'subtraction', 'multiplication', 'division'],
        difficulty: 'hard',
        questionCount: 10,
      },
      results: {
        correctCount: 9,
        questionCount: 10,
        accuracyPercent: 90,
        coinsPotential: 11,
        coinsAwarded: 11,
      },
    });
    const firstQuestion = analysis.sessions[0]?.questions[0];
    expect(firstQuestion?.choices).toHaveLength(4);
    expect(firstQuestion?.selectedChoiceIndex).toEqual(expect.any(Number));
    expect(firstQuestion?.responseMs).toBe(500);
    expect(firstQuestion?.scoreAwarded).toEqual(expect.any(Number));
  });

  it('groups comparable settings and keeps different difficulties and rulesets separate', () => {
    const easy: GameSettings = {
      operations: ['addition', 'subtraction'],
      difficulty: 'easy',
      questionCount: 10,
    };
    const hard: GameSettings = { ...easy, difficulty: 'hard' };
    let save = createInitialSave('Ada', 'cozy-cats:sunny');
    save = addRound(save, easy, 1);
    save = addRound(save, { ...easy, operations: [...easy.operations].reverse() }, 2, 0);
    save = addRound(save, hard, 3);
    save = addRound(save, hard, 4, 1);
    save = {
      ...save,
      sessions: [...save.sessions, { ...save.sessions[0]!, id: 'legacy-copy', rulesetVersion: 2 }],
    };

    const groups = summarizeConfigurations(save.sessions);
    expect(groups).toHaveLength(3);
    expect(
      groups.find(
        ({ settings, rulesetVersion }) => settings.difficulty === 'easy' && rulesetVersion === 3,
      )?.rounds,
    ).toBe(2);
    expect(groups.find(({ rulesetVersion }) => rulesetVersion === 2)?.rounds).toBe(1);
    expect(groups.find(({ settings }) => settings.difficulty === 'hard')?.rounds).toBe(2);
    expect(groups.every(({ averageScorePerQuestion }) => averageScorePerQuestion > 0)).toBe(true);

    expect(summarizeRulesets(save.sessions)).toMatchObject([
      { rulesetVersion: 2, rounds: 1, totalQuestions: 10 },
      { rulesetVersion: 3, rounds: 4, totalQuestions: 40 },
    ]);

    const oddAnswerSession = {
      ...save.sessions[0]!,
      answers: save.sessions[0]!.answers.slice(0, 9),
    };
    expect(summarizeConfigurations([oddAnswerSession])[0]?.medianResponseMs).toBe(900);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { FakeClock } from '../domain/clock';
import { DEFAULT_SETTINGS, generateSession } from '../domain/math';
import { SeededRandom } from '../domain/random';
import { summarizeSession } from '../domain/session';
import {
  applyCompletedSession,
  createInitialSave,
  dailyCoinsRemaining,
  LocalStorageSaveRepository,
  updateSettings,
} from './save';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
});

describe('save data', () => {
  it('creates, stores, exports, and reloads a versioned save', async () => {
    const repository = new LocalStorageSaveRepository();
    const save = createInitialSave(' Ada ', 'cozy-cats:sunny');
    expect(save.player.name).toBe('Ada');
    expect(save.schemaVersion).toBe(3);
    await repository.save(save);
    await expect(repository.load()).resolves.toEqual(save);
    expect(repository.parseImport(repository.export(save))).toEqual(save);
  });

  it('migrates a version 1 save without losing progress', () => {
    const repository = new LocalStorageSaveRepository();
    const current = createInitialSave('Ada', 'cozy-cats:sunny');
    const { dailyCoins: _dailyCoins, ...legacy } = current;
    void _dailyCoins;
    const migrated = repository.parseImport(JSON.stringify({ ...legacy, schemaVersion: 1 }));
    expect(migrated).toMatchObject({
      schemaVersion: 3,
      player: { name: 'Ada' },
      coins: 0,
      dailyCoins: { date: '', earned: 0 },
    });
  });

  it('migrates version 2 sessions into reproducible analysis records', () => {
    const repository = new LocalStorageSaveRepository();
    const initial = createInitialSave('Ada', 'cozy-cats:sunny');
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(7));
    const answers = problems.map((problem) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: problem.correctAnswer,
      correctAnswer: problem.correctAnswer,
      correct: true,
      responseMs: 700,
    }));
    const summary = summarizeSession(problems, answers, DEFAULT_SETTINGS, 7, new FakeClock(7));
    const current = applyCompletedSession(initial, summary, '2026-01-02');
    const legacySessions = current.sessions.map((session) => ({
      id: session.id,
      completedAt: session.completedAt,
      settings: session.settings,
      seed: session.seed,
      answers: session.answers.map((answer) => ({
        problemId: answer.problemId,
        skillKey: answer.skillKey,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        correct: answer.correct,
        responseMs: answer.responseMs,
      })),
      correctCount: session.correctCount,
      accuracy: session.accuracy,
      elapsedMs: session.elapsedMs,
      score: session.score,
      coinsEarned: session.coinsEarned,
    }));
    const legacyV2 = {
      ...current,
      schemaVersion: 2,
      sessions: [
        ...legacySessions,
        {
          ...legacySessions[0],
          id: 'old-addition-format',
          answers: [
            {
              ...legacySessions[0]!.answers[0],
              problemId: 'q1:7+3',
              skillKey: 'addition:3+7',
            },
          ],
          correctCount: 1,
          accuracy: 1,
        },
      ],
    };

    const migrated = repository.parseImport(JSON.stringify(legacyV2));
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.sessions[0]).toMatchObject({
      rulesetVersion: 1,
      coinsPotential: 15,
    });
    expect(typeof migrated.sessions[0]?.answers[0]?.operation).toBe('string');
    expect(migrated.sessions[0]?.answers[0]?.choices).toEqual([]);
    expect(migrated.sessions[0]?.answers[0]?.correctChoiceIndex).toBe(-1);
    expect(migrated.sessions[1]?.answers[0]).toMatchObject({
      operation: 'addition',
      left: 7,
      right: 3,
    });
  });

  it('returns null when no save exists and rejects malformed imports', async () => {
    const repository = new LocalStorageSaveRepository();
    await expect(repository.load()).resolves.toBeNull();
    expect(() => repository.parseImport('{')).toThrow();
    expect(() => repository.parseImport('{}')).toThrow();
  });

  it('applies a completed session exactly once and retains settings', () => {
    const save = createInitialSave('Ada', 'cozy-cats:sunny');
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(3));
    const answers = problems.map((problem) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: problem.correctAnswer,
      correctAnswer: problem.correctAnswer,
      correct: true,
      responseMs: 400,
    }));
    const summary = summarizeSession(problems, answers, DEFAULT_SETTINGS, 3, new FakeClock(1));
    const once = applyCompletedSession(save, summary, '2026-01-02');
    const twice = applyCompletedSession(once, summary, '2026-01-02');
    expect(once.coins).toBe(15);
    expect(twice).toEqual(once);
    expect(updateSettings(once, DEFAULT_SETTINGS).settings).toEqual(DEFAULT_SETTINGS);
  });

  it('caps earnings per calendar day and resets availability on a new day', () => {
    const initial = createInitialSave('Ada', 'cozy-cats:sunny');
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(3));
    const answers = problems.map((problem) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: problem.correctAnswer,
      correctAnswer: problem.correctAnswer,
      correct: true,
      responseMs: 400,
    }));
    const makeSummary = (seed: number) =>
      summarizeSession(problems, answers, DEFAULT_SETTINGS, seed, new FakeClock(seed));

    const first = applyCompletedSession(initial, makeSummary(1), '2026-01-02');
    const second = applyCompletedSession(first, makeSummary(2), '2026-01-02');
    const capped = applyCompletedSession(second, makeSummary(3), '2026-01-02');
    expect(capped.coins).toBe(30);
    expect(capped.sessions.at(-1)?.coinsEarned).toBe(0);
    expect(dailyCoinsRemaining(capped, '2026-01-02')).toBe(0);
    expect(dailyCoinsRemaining(capped, '2026-01-03')).toBe(30);

    const nextDay = applyCompletedSession(capped, makeSummary(4), '2026-01-03');
    expect(nextDay.coins).toBe(45);
    expect(nextDay.dailyCoins).toEqual({ date: '2026-01-03', earned: 15 });
  });
});

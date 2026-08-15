import { OPERATION_IDS, type DifficultyId, type GameSettings, type OperationId } from './math';
import { scoreAnswer, type AnswerRecord, type SessionSummary } from './session';

export interface ProgressTotals {
  rounds: number;
  questions: number;
  correct: number;
  score: number;
  responseMs: number;
}

export interface RulesetProgress extends ProgressTotals {
  rulesetVersion: number;
}

export interface DifficultyProgress extends ProgressTotals {
  difficulty: DifficultyId;
}

export interface OperationProgress extends ProgressTotals {
  operation: OperationId;
}

export interface ConfigurationProgress extends ProgressTotals {
  key: string;
  rulesetVersion: number;
  settings: GameSettings;
  highScore: number;
}

export interface ArchivedProgress {
  overall: ProgressTotals;
  rulesets: RulesetProgress[];
  difficulties: DifficultyProgress[];
  operations: OperationProgress[];
  configurations: ConfigurationProgress[];
}

export function emptyProgressTotals(): ProgressTotals {
  return { rounds: 0, questions: 0, correct: 0, score: 0, responseMs: 0 };
}

export function createEmptyArchivedProgress(): ArchivedProgress {
  return {
    overall: emptyProgressTotals(),
    rulesets: [],
    difficulties: [],
    operations: [],
    configurations: [],
  };
}

export function normalizeSettings(settings: GameSettings): GameSettings {
  return {
    ...settings,
    operations: [...settings.operations].sort(
      (left, right) => OPERATION_IDS.indexOf(left) - OPERATION_IDS.indexOf(right),
    ),
  };
}

export function configurationKey(settings: GameSettings, rulesetVersion: number): string {
  const normalized = normalizeSettings(settings);
  return `ruleset-${rulesetVersion}|${normalized.operations.join('+')}|${normalized.difficulty}|${normalized.questionCount}`;
}

function answerTotals(answers: readonly AnswerRecord[], rounds: number): ProgressTotals {
  return {
    rounds,
    questions: answers.length,
    correct: answers.filter(({ correct }) => correct).length,
    score: answers.reduce(
      (total, answer) => total + scoreAnswer(answer.correct, answer.responseMs),
      0,
    ),
    responseMs: answers.reduce((total, answer) => total + answer.responseMs, 0),
  };
}

function sessionTotals(session: SessionSummary): ProgressTotals {
  return {
    rounds: 1,
    questions: session.answers.length,
    correct: session.correctCount,
    score: session.score,
    responseMs: session.elapsedMs,
  };
}

export function mergeProgressTotals(first: ProgressTotals, second: ProgressTotals): ProgressTotals {
  return {
    rounds: first.rounds + second.rounds,
    questions: first.questions + second.questions,
    correct: first.correct + second.correct,
    score: first.score + second.score,
    responseMs: first.responseMs + second.responseMs,
  };
}

function upsertRuleset(
  values: readonly RulesetProgress[],
  rulesetVersion: number,
  totals: ProgressTotals,
): RulesetProgress[] {
  const existing = values.find((value) => value.rulesetVersion === rulesetVersion);
  return [
    ...values.filter((value) => value.rulesetVersion !== rulesetVersion),
    { rulesetVersion, ...mergeProgressTotals(existing ?? emptyProgressTotals(), totals) },
  ];
}

function upsertDifficulty(
  values: readonly DifficultyProgress[],
  difficulty: DifficultyId,
  totals: ProgressTotals,
): DifficultyProgress[] {
  const existing = values.find((value) => value.difficulty === difficulty);
  return [
    ...values.filter((value) => value.difficulty !== difficulty),
    { difficulty, ...mergeProgressTotals(existing ?? emptyProgressTotals(), totals) },
  ];
}

function upsertOperation(
  values: readonly OperationProgress[],
  operation: OperationId,
  totals: ProgressTotals,
): OperationProgress[] {
  const existing = values.find((value) => value.operation === operation);
  return [
    ...values.filter((value) => value.operation !== operation),
    { operation, ...mergeProgressTotals(existing ?? emptyProgressTotals(), totals) },
  ];
}

function upsertConfiguration(
  values: readonly ConfigurationProgress[],
  session: SessionSummary,
  totals: ProgressTotals,
): ConfigurationProgress[] {
  const key = configurationKey(session.settings, session.rulesetVersion);
  const existing = values.find((value) => value.key === key);
  return [
    ...values.filter((value) => value.key !== key),
    {
      key,
      rulesetVersion: session.rulesetVersion,
      settings: normalizeSettings(session.settings),
      highScore: Math.max(existing?.highScore ?? 0, session.score),
      ...mergeProgressTotals(existing ?? emptyProgressTotals(), totals),
    },
  ];
}

export function archiveSession(
  progress: ArchivedProgress,
  session: SessionSummary,
): ArchivedProgress {
  const totals = sessionTotals(session);
  let operations = progress.operations;
  for (const operation of OPERATION_IDS) {
    const answers = session.answers.filter((answer) => answer.operation === operation);
    if (answers.length === 0) continue;
    operations = upsertOperation(operations, operation, answerTotals(answers, 1));
  }
  return {
    overall: mergeProgressTotals(progress.overall, totals),
    rulesets: upsertRuleset(progress.rulesets, session.rulesetVersion, totals),
    difficulties: upsertDifficulty(progress.difficulties, session.settings.difficulty, totals),
    operations,
    configurations: upsertConfiguration(progress.configurations, session, totals),
  };
}

export function archiveSessions(
  progress: ArchivedProgress,
  sessions: readonly SessionSummary[],
): ArchivedProgress {
  return sessions.reduce(archiveSession, progress);
}

function mergeKeyedProgress<T extends ProgressTotals>(
  first: readonly T[],
  second: readonly T[],
  key: (value: T) => string,
  merge: (left: T, right: T) => T,
): T[] {
  const values = new Map(first.map((value) => [key(value), value]));
  for (const value of second) {
    const existing = values.get(key(value));
    values.set(key(value), existing ? merge(existing, value) : value);
  }
  return [...values.values()];
}

export function mergeArchivedProgress(
  first: ArchivedProgress,
  second: ArchivedProgress,
): ArchivedProgress {
  return {
    overall: mergeProgressTotals(first.overall, second.overall),
    rulesets: mergeKeyedProgress(
      first.rulesets,
      second.rulesets,
      ({ rulesetVersion }) => String(rulesetVersion),
      (left, right) => ({
        rulesetVersion: left.rulesetVersion,
        ...mergeProgressTotals(left, right),
      }),
    ),
    difficulties: mergeKeyedProgress(
      first.difficulties,
      second.difficulties,
      ({ difficulty }) => difficulty,
      (left, right) => ({
        difficulty: left.difficulty,
        ...mergeProgressTotals(left, right),
      }),
    ),
    operations: mergeKeyedProgress(
      first.operations,
      second.operations,
      ({ operation }) => operation,
      (left, right) => ({ operation: left.operation, ...mergeProgressTotals(left, right) }),
    ),
    configurations: mergeKeyedProgress(
      first.configurations,
      second.configurations,
      ({ key }) => key,
      (left, right) => ({
        key: left.key,
        rulesetVersion: left.rulesetVersion,
        settings: left.settings,
        highScore: Math.max(left.highScore, right.highScore),
        ...mergeProgressTotals(left, right),
      }),
    ),
  };
}

export function progressForSessions(sessions: readonly SessionSummary[]): ArchivedProgress {
  return archiveSessions(createEmptyArchivedProgress(), sessions);
}

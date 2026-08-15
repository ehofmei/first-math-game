import { catalog } from '../content/catalog';
import type { DifficultyId, GameSettings, OperationId } from '../domain/math';
import {
  configurationKey,
  mergeArchivedProgress,
  normalizeSettings,
  progressForSessions,
  type ArchivedProgress,
  type ProgressTotals,
} from '../domain/progress';
import { CAPSULE_COST, DAILY_COIN_CAP } from '../domain/rewards';
import { scoreAnswer, type SessionSummary } from '../domain/session';
import { DETAILED_SESSION_LIMIT, type SaveData } from '../storage/save';

export const PLAY_HISTORY_EXPORT_VERSION = 3;

function round(value: number, decimals = 2): number {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function sessionResponseTimes(session: SessionSummary): number[] {
  return session.answers.map(({ responseMs }) => responseMs);
}

export interface HistoryConfigurationSummary {
  key: string;
  rulesetVersion: number;
  settings: GameSettings;
  rounds: number;
  averageScore: number;
  highScore: number;
  averageScorePerQuestion: number;
  averageAccuracyPercent: number;
  averageResponseMs: number;
  medianResponseMs: number;
  medianResponseScope: 'retained-detailed-rounds';
}

export interface HistoryRulesetSummary {
  rulesetVersion: number;
  rounds: number;
  totalQuestions: number;
  averageScorePerQuestion: number;
  averageAccuracyPercent: number;
  averageResponseMs: number;
}

export interface HistoryProgressSummary {
  rounds: number;
  totalQuestions: number;
  averageScorePerQuestion: number;
  averageAccuracyPercent: number;
  averageResponseMs: number;
}

export interface PlayHistoryExport {
  format: 'number-nook-play-history';
  exportVersion: number;
  generatedAt: string;
  privacy: {
    playerNameIncluded: false;
    accountOrDeviceIdentifiersIncluded: false;
  };
  content: {
    catalogVersion: string;
    collectibleCount: number;
  };
  currentEconomy: {
    dailyCoinCap: number;
    capsuleCost: number;
    correctAnswerCoins: number;
    accuracyBonusThresholdPercent: number;
    accuracyBonusCoins: number;
    perfectBonusCoins: number;
  };
  currentState: {
    coinBalance: number;
    ownedCollectibleCount: number;
    completedRoundCount: number;
  };
  retention: {
    detailedRoundLimit: number;
    detailedRoundCount: number;
    archivedRoundCount: number;
  };
  overall: {
    averageScore: number;
    averageScorePerQuestion: number;
    averageAccuracyPercent: number;
    averageResponseMs: number;
    totalQuestions: number;
  };
  rulesets: HistoryRulesetSummary[];
  configurations: HistoryConfigurationSummary[];
  difficulties: Array<HistoryProgressSummary & { difficulty: DifficultyId }>;
  operations: Array<HistoryProgressSummary & { operation: OperationId }>;
  economyEvents: Array<{
    occurredAt: string;
    type: 'capsule_opened';
    coinsSpent: number;
    collectibleId: string;
    collectibleKind: string | null;
    rarity: string | null;
  }>;
  sessions: Array<{
    sessionId: string;
    rulesetVersion: number;
    completedAt: string;
    seed: number;
    settings: GameSettings;
    results: {
      score: number;
      scorePerQuestion: number;
      correctCount: number;
      questionCount: number;
      accuracyPercent: number;
      elapsedMs: number;
      averageResponseMs: number;
      medianResponseMs: number;
      fastestResponseMs: number;
      slowestResponseMs: number;
      coinsPotential: number;
      coinsAwarded: number;
    };
    questions: Array<{
      problemId: string;
      skillKey: string;
      operation: string;
      left: number;
      right: number;
      choices: number[];
      selectedChoiceIndex: number;
      selectedAnswer: number;
      correctChoiceIndex: number;
      correctAnswer: number;
      correct: boolean;
      responseMs: number;
      scoreAwarded: number;
    }>;
  }>;
}

export function summarizeConfigurations(
  sessions: readonly SessionSummary[],
): HistoryConfigurationSummary[] {
  return summarizeConfigurationProgress(progressForSessions(sessions), sessions);
}

function summarizeConfigurationProgress(
  progress: ArchivedProgress,
  detailedSessions: readonly SessionSummary[],
): HistoryConfigurationSummary[] {
  const responseTimesByConfiguration = new Map<string, number[]>();
  for (const session of detailedSessions) {
    const key = configurationKey(session.settings, session.rulesetVersion);
    responseTimesByConfiguration.set(key, [
      ...(responseTimesByConfiguration.get(key) ?? []),
      ...sessionResponseTimes(session),
    ]);
  }

  return progress.configurations
    .map((configuration) => {
      const responseTimes = responseTimesByConfiguration.get(configuration.key) ?? [];
      return {
        key: configuration.key,
        rulesetVersion: configuration.rulesetVersion,
        settings: normalizeSettings(configuration.settings),
        rounds: configuration.rounds,
        averageScore: round(configuration.score / configuration.rounds),
        highScore: configuration.highScore,
        averageScorePerQuestion: round(configuration.score / configuration.questions),
        averageAccuracyPercent: round((configuration.correct / configuration.questions) * 100),
        averageResponseMs: round(configuration.responseMs / configuration.questions),
        medianResponseMs: round(median(responseTimes)),
        medianResponseScope: 'retained-detailed-rounds' as const,
      };
    })
    .sort((left, right) => right.rounds - left.rounds || left.key.localeCompare(right.key));
}

export function summarizeRulesets(sessions: readonly SessionSummary[]): HistoryRulesetSummary[] {
  return summarizeRulesetProgress(progressForSessions(sessions));
}

function summarizeRulesetProgress(progress: ArchivedProgress): HistoryRulesetSummary[] {
  return progress.rulesets
    .map((ruleset) => ({
      rulesetVersion: ruleset.rulesetVersion,
      rounds: ruleset.rounds,
      totalQuestions: ruleset.questions,
      averageScorePerQuestion: round(ruleset.score / ruleset.questions),
      averageAccuracyPercent: round((ruleset.correct / ruleset.questions) * 100),
      averageResponseMs: round(ruleset.responseMs / ruleset.questions),
    }))
    .sort((left, right) => left.rulesetVersion - right.rulesetVersion);
}

function summarizeProgressTotals(totals: ProgressTotals): HistoryProgressSummary {
  return {
    rounds: totals.rounds,
    totalQuestions: totals.questions,
    averageScorePerQuestion: round(totals.questions === 0 ? 0 : totals.score / totals.questions),
    averageAccuracyPercent: round(
      totals.questions === 0 ? 0 : (totals.correct / totals.questions) * 100,
    ),
    averageResponseMs: round(totals.questions === 0 ? 0 : totals.responseMs / totals.questions),
  };
}

export function buildPlayHistoryExport(save: SaveData, generatedAt: string): PlayHistoryExport {
  const recentProgress = progressForSessions(save.sessions);
  const lifetimeProgress = mergeArchivedProgress(save.archivedProgress, recentProgress);
  const overall = lifetimeProgress.overall;
  return {
    format: 'number-nook-play-history',
    exportVersion: PLAY_HISTORY_EXPORT_VERSION,
    generatedAt,
    privacy: {
      playerNameIncluded: false,
      accountOrDeviceIdentifiersIncluded: false,
    },
    content: {
      catalogVersion: catalog.version,
      collectibleCount: catalog.collectibles.length,
    },
    currentEconomy: {
      dailyCoinCap: DAILY_COIN_CAP,
      capsuleCost: CAPSULE_COST,
      correctAnswerCoins: 1,
      accuracyBonusThresholdPercent: 80,
      accuracyBonusCoins: 2,
      perfectBonusCoins: 3,
    },
    currentState: {
      coinBalance: save.coins,
      ownedCollectibleCount: save.ownedCollectibleIds.length,
      completedRoundCount: overall.rounds,
    },
    retention: {
      detailedRoundLimit: DETAILED_SESSION_LIMIT,
      detailedRoundCount: save.sessions.length,
      archivedRoundCount: save.archivedProgress.overall.rounds,
    },
    overall: {
      averageScore: round(overall.rounds === 0 ? 0 : overall.score / overall.rounds),
      averageScorePerQuestion: round(
        overall.questions === 0 ? 0 : overall.score / overall.questions,
      ),
      averageAccuracyPercent: round(
        overall.questions === 0 ? 0 : (overall.correct / overall.questions) * 100,
      ),
      averageResponseMs: round(
        overall.questions === 0 ? 0 : overall.responseMs / overall.questions,
      ),
      totalQuestions: overall.questions,
    },
    rulesets: summarizeRulesetProgress(lifetimeProgress),
    configurations: summarizeConfigurationProgress(lifetimeProgress, save.sessions),
    difficulties: lifetimeProgress.difficulties
      .map((difficulty) => ({
        difficulty: difficulty.difficulty,
        ...summarizeProgressTotals(difficulty),
      }))
      .sort((left, right) => left.difficulty.localeCompare(right.difficulty)),
    operations: lifetimeProgress.operations
      .map((operation) => ({
        operation: operation.operation,
        ...summarizeProgressTotals(operation),
      }))
      .sort((left, right) => left.operation.localeCompare(right.operation)),
    economyEvents: save.economyEvents.map((event) => {
      const collectible = catalog.collectibles.find(({ id }) => id === event.collectibleId);
      return {
        occurredAt: event.occurredAt,
        type: event.type,
        coinsSpent: event.coinsSpent,
        collectibleId: event.collectibleId,
        collectibleKind: collectible?.kind ?? null,
        rarity: collectible?.rarity ?? null,
      };
    }),
    sessions: save.sessions.map((session) => {
      const responseTimes = sessionResponseTimes(session);
      return {
        sessionId: session.id,
        rulesetVersion: session.rulesetVersion,
        completedAt: session.completedAt,
        seed: session.seed,
        settings: normalizeSettings(session.settings),
        results: {
          score: session.score,
          scorePerQuestion: round(session.score / session.answers.length),
          correctCount: session.correctCount,
          questionCount: session.answers.length,
          accuracyPercent: round(session.accuracy * 100),
          elapsedMs: session.elapsedMs,
          averageResponseMs: round(average(responseTimes)),
          medianResponseMs: round(median(responseTimes)),
          fastestResponseMs: Math.min(...responseTimes),
          slowestResponseMs: Math.max(...responseTimes),
          coinsPotential: session.coinsPotential,
          coinsAwarded: session.coinsEarned,
        },
        questions: session.answers.map((answer) => ({
          problemId: answer.problemId,
          skillKey: answer.skillKey,
          operation: answer.operation,
          left: answer.left,
          right: answer.right,
          choices: [...answer.choices],
          selectedChoiceIndex: answer.choices.indexOf(answer.selectedAnswer),
          selectedAnswer: answer.selectedAnswer,
          correctChoiceIndex: answer.correctChoiceIndex,
          correctAnswer: answer.correctAnswer,
          correct: answer.correct,
          responseMs: answer.responseMs,
          scoreAwarded: scoreAnswer(answer.correct, answer.responseMs),
        })),
      };
    }),
  };
}

export function serializePlayHistory(save: SaveData, generatedAt: string): string {
  return JSON.stringify(buildPlayHistoryExport(save, generatedAt), null, 2);
}

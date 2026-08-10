import { catalog } from '../content/catalog';
import { OPERATION_IDS, type GameSettings } from '../domain/math';
import { CAPSULE_COST, DAILY_COIN_CAP } from '../domain/rewards';
import { scoreAnswer, type SessionSummary } from '../domain/session';
import type { SaveData } from '../storage/save';

export const PLAY_HISTORY_EXPORT_VERSION = 2;

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

function normalizedSettings(settings: GameSettings): GameSettings {
  return {
    ...settings,
    operations: [...settings.operations].sort(
      (left, right) => OPERATION_IDS.indexOf(left) - OPERATION_IDS.indexOf(right),
    ),
  };
}

function configurationKey(settings: GameSettings, rulesetVersion: number): string {
  const normalized = normalizedSettings(settings);
  return `ruleset-${rulesetVersion}|${normalized.operations.join('+')}|${normalized.difficulty}|${normalized.questionCount}`;
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
}

export interface HistoryRulesetSummary {
  rulesetVersion: number;
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
  overall: {
    averageScore: number;
    averageScorePerQuestion: number;
    averageAccuracyPercent: number;
    averageResponseMs: number;
    totalQuestions: number;
  };
  rulesets: HistoryRulesetSummary[];
  configurations: HistoryConfigurationSummary[];
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
  const grouped = new Map<string, SessionSummary[]>();
  for (const session of sessions) {
    const key = configurationKey(session.settings, session.rulesetVersion);
    grouped.set(key, [...(grouped.get(key) ?? []), session]);
  }

  return [...grouped.entries()]
    .map(([key, group]) => {
      const responseTimes = group.flatMap(sessionResponseTimes);
      return {
        key,
        rulesetVersion: group[0]!.rulesetVersion,
        settings: normalizedSettings(group[0]!.settings),
        rounds: group.length,
        averageScore: round(average(group.map(({ score }) => score))),
        highScore: Math.max(...group.map(({ score }) => score)),
        averageScorePerQuestion: round(
          average(group.map(({ score, answers }) => score / answers.length)),
        ),
        averageAccuracyPercent: round(average(group.map(({ accuracy }) => accuracy * 100))),
        averageResponseMs: round(average(responseTimes)),
        medianResponseMs: round(median(responseTimes)),
      };
    })
    .sort((left, right) => right.rounds - left.rounds || left.key.localeCompare(right.key));
}

export function summarizeRulesets(sessions: readonly SessionSummary[]): HistoryRulesetSummary[] {
  const versions = new Map<number, SessionSummary[]>();
  for (const session of sessions) {
    versions.set(session.rulesetVersion, [
      ...(versions.get(session.rulesetVersion) ?? []),
      session,
    ]);
  }
  return [...versions.entries()]
    .map(([rulesetVersion, group]) => {
      const responseTimes = group.flatMap(sessionResponseTimes);
      const totalQuestions = group.reduce((sum, session) => sum + session.answers.length, 0);
      return {
        rulesetVersion,
        rounds: group.length,
        totalQuestions,
        averageScorePerQuestion: round(
          group.reduce((sum, session) => sum + session.score, 0) / totalQuestions,
        ),
        averageAccuracyPercent: round(
          (group.reduce((sum, session) => sum + session.correctCount, 0) / totalQuestions) * 100,
        ),
        averageResponseMs: round(average(responseTimes)),
      };
    })
    .sort((left, right) => left.rulesetVersion - right.rulesetVersion);
}

export function buildPlayHistoryExport(save: SaveData, generatedAt: string): PlayHistoryExport {
  const allResponseTimes = save.sessions.flatMap(sessionResponseTimes);
  const totalQuestions = save.sessions.reduce((sum, session) => sum + session.answers.length, 0);
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
      completedRoundCount: save.sessions.length,
    },
    overall: {
      averageScore: round(average(save.sessions.map(({ score }) => score))),
      averageScorePerQuestion: round(
        average(save.sessions.map(({ score, answers }) => score / answers.length)),
      ),
      averageAccuracyPercent: round(average(save.sessions.map(({ accuracy }) => accuracy * 100))),
      averageResponseMs: round(average(allResponseTimes)),
      totalQuestions,
    },
    rulesets: summarizeRulesets(save.sessions),
    configurations: summarizeConfigurations(save.sessions),
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
        settings: normalizedSettings(session.settings),
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

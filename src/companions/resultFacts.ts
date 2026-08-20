import { configurationKey, type ArchivedProgress } from '../domain/progress';
import { OPERATION_LABELS } from '../domain/math';
import type { SessionSummary } from '../domain/session';
import type { ResultDialogueFacts } from './types';

export const PACE_IMPROVEMENT_RATIO = 0.95;
export const MAX_PACE_ACCURACY_DROP = 0.05;

function averageResponseMs(summary: SessionSummary): number {
  return summary.answers.length > 0 ? summary.elapsedMs / summary.answers.length : 0;
}

export function deriveResultDialogueFacts(
  summary: SessionSummary,
  previousSessions: readonly SessionSummary[],
  archivedProgress: ArchivedProgress,
): ResultDialogueFacts {
  const key = configurationKey(summary.settings, summary.rulesetVersion);
  const comparable = previousSessions.filter(
    (session) => configurationKey(session.settings, session.rulesetVersion) === key,
  );
  const latestComparable = comparable.at(-1);
  const archivedComparable = archivedProgress.configurations.find(
    (configuration) => configuration.key === key,
  );
  const firstRound = archivedProgress.overall.rounds + previousSessions.length === 0;
  const hasComparableBaseline = comparable.length > 0 || (archivedComparable?.rounds ?? 0) > 0;
  const previousBestScore = Math.max(
    archivedComparable?.highScore ?? 0,
    ...comparable.map(({ score }) => score),
  );
  const currentPace = averageResponseMs(summary);
  const previousPace = latestComparable ? averageResponseMs(latestComparable) : 0;

  return {
    accuracy: summary.accuracy,
    perfect: summary.answers.length > 0 && summary.correctCount === summary.answers.length,
    firstRound,
    personalBest: hasComparableBaseline && summary.score > previousBestScore,
    accuracyImproved: Boolean(latestComparable && summary.accuracy > latestComparable.accuracy),
    paceImproved: Boolean(
      latestComparable &&
      previousPace > 0 &&
      summary.accuracy >= latestComparable.accuracy - MAX_PACE_ACCURACY_DROP &&
      currentPace <= previousPace * PACE_IMPROVEMENT_RATIO,
    ),
    completedQuestions: summary.answers.length,
    operationLabels: summary.settings.operations.map((operation) =>
      OPERATION_LABELS[operation].toLowerCase(),
    ),
  };
}

import { additiveCompositionTargets } from './additiveComposition';
import { compositionTargets } from './composition';
import type { DifficultyId, OperationId } from './math';
import type { RandomSource } from './random';

export type OperationLowChallengeCounts = Record<OperationId, number>;

const OPERATIONS: readonly OperationId[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

const SESSION_LOW_PER_TEN: Record<DifficultyId, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
  advanced: 1,
};

function maximumPerTen(count: number, perTen: number): number {
  return Math.ceil((count * perTen) / 10);
}

export function sessionLowChallengeLimit(questionCount: number, difficulty: DifficultyId): number {
  return maximumPerTen(questionCount, SESSION_LOW_PER_TEN[difficulty]);
}

function operationCapacity(
  operation: OperationId,
  count: number,
  difficulty: DifficultyId,
): number {
  const targets =
    operation === 'addition' || operation === 'subtraction'
      ? additiveCompositionTargets(count, difficulty)
      : compositionTargets(count, difficulty);
  return Math.min(targets.maximumLow, Math.max(0, count - targets.minimumFocus));
}

function plannedSessionLowCount(
  questionCount: number,
  difficulty: DifficultyId,
  maximum: number,
  random: RandomSource,
): number {
  if (difficulty === 'easy') return maximum;
  const basePerTen = difficulty === 'medium' ? 1 : 0.5;
  const base = Math.round((questionCount * basePerTen) / 10);
  return Math.max(0, Math.min(maximum, base + random.integer(-1, 1)));
}

export function allocateSessionLowChallengeCounts(
  operationSchedule: readonly OperationId[],
  difficulty: DifficultyId,
  random: RandomSource,
): OperationLowChallengeCounts {
  const counts: OperationLowChallengeCounts = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
  };
  const operationCounts = Object.fromEntries(
    OPERATIONS.map((operation) => [
      operation,
      operationSchedule.filter((scheduled) => scheduled === operation).length,
    ]),
  ) as OperationLowChallengeCounts;
  const capacities = Object.fromEntries(
    OPERATIONS.map((operation) => [
      operation,
      operationCapacity(operation, operationCounts[operation], difficulty),
    ]),
  ) as OperationLowChallengeCounts;
  const availableCapacity = OPERATIONS.reduce(
    (total, operation) => total + capacities[operation],
    0,
  );
  const maximum = Math.min(
    sessionLowChallengeLimit(operationSchedule.length, difficulty),
    availableCapacity,
  );
  let remaining = plannedSessionLowCount(operationSchedule.length, difficulty, maximum, random);

  while (remaining > 0) {
    const eligible = random.shuffle(
      OPERATIONS.filter((operation) => counts[operation] < capacities[operation]),
    );
    if (eligible.length === 0) break;
    for (const operation of eligible) {
      counts[operation] += 1;
      remaining -= 1;
      if (remaining === 0) break;
    }
  }

  return counts;
}

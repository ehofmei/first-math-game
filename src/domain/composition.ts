import type { DifficultyId } from './math';
import type { RandomSource } from './random';

export type ComposedOperation = 'multiplication' | 'division';
export type FactCategory = 'low' | 'review' | 'focus';

export interface CompositionRanges {
  multiplicationTables: readonly number[];
  multiplicationFactorMax: number;
  divisionTables: readonly number[];
  divisionQuotientMax: number;
}

export interface ComposedFact {
  operation: ComposedOperation;
  firstFactor: number;
  secondFactor: number;
  skillKey: string;
  category: FactCategory;
  zeroQuotient: boolean;
  identityDivision: boolean;
  unitDivisor: boolean;
  designatedFocusTable: number | null;
}

interface CategoryTargets {
  maximumLow: number;
  minimumFocus: number;
}

const LOW_PER_TEN: Record<DifficultyId, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
  advanced: 1,
};

const FOCUS_PER_TEN: Record<DifficultyId, number> = {
  easy: 0,
  medium: 5,
  hard: 6,
  advanced: 6,
};

function maximumPerTen(count: number, perTen: number): number {
  return Math.ceil((count * perTen) / 10);
}

function minimumFocusCount(count: number, difficulty: DifficultyId): number {
  const exactTarget = (count * FOCUS_PER_TEN[difficulty]) / 10;
  return difficulty === 'advanced' ? Math.round(exactTarget) : Math.floor(exactTarget);
}

export function compositionTargets(count: number, difficulty: DifficultyId): CategoryTargets {
  return {
    maximumLow: maximumPerTen(count, LOW_PER_TEN[difficulty]),
    minimumFocus: minimumFocusCount(count, difficulty),
  };
}

export function tableValueLimit(relevantQuestionCount: number, difficulty: DifficultyId): number {
  const perTen = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 3 : 2;
  return Math.max(2, maximumPerTen(relevantQuestionCount, perTen));
}

export function divisionSubtypeLimits(count: number, difficulty: DifficultyId) {
  return {
    zeroQuotient: maximumPerTen(count, 1),
    identityDivision: maximumPerTen(count, difficulty === 'easy' ? 2 : 1),
    unitDivisor: maximumPerTen(count, difficulty === 'easy' ? 2 : 1),
  };
}

export function isFocusFactorPair(
  firstFactor: number,
  secondFactor: number,
  difficulty: DifficultyId,
): boolean {
  switch (difficulty) {
    case 'easy':
      return false;
    case 'medium':
      return (
        firstFactor >= 3 &&
        secondFactor >= 3 &&
        firstFactor !== 5 &&
        secondFactor !== 5 &&
        firstFactor !== 10 &&
        secondFactor !== 10
      );
    case 'hard':
      return firstFactor >= 6 && secondFactor >= 6;
    case 'advanced':
      return (firstFactor >= 13 && secondFactor >= 6) || (secondFactor >= 13 && firstFactor >= 6);
  }
}

function classifyCandidate(
  operation: ComposedOperation,
  firstFactor: number,
  secondFactor: number,
  difficulty: DifficultyId,
): Omit<
  ComposedFact,
  'operation' | 'firstFactor' | 'secondFactor' | 'skillKey' | 'designatedFocusTable'
> {
  const zeroQuotient = operation === 'division' && secondFactor === 0;
  const identityDivision = operation === 'division' && secondFactor === 1;
  const unitDivisor = operation === 'division' && firstFactor === 1;
  const low =
    operation === 'multiplication'
      ? firstFactor <= 1 || secondFactor <= 1
      : zeroQuotient || identityDivision || unitDivisor;
  return {
    category: low
      ? 'low'
      : isFocusFactorPair(firstFactor, secondFactor, difficulty)
        ? 'focus'
        : 'review',
    zeroQuotient,
    identityDivision,
    unitDivisor,
  };
}

function multiplicationCandidates(
  difficulty: DifficultyId,
  ranges: CompositionRanges,
): ComposedFact[] {
  const candidates = new Map<string, ComposedFact>();
  for (const table of ranges.multiplicationTables) {
    for (let partner = 0; partner <= ranges.multiplicationFactorMax; partner += 1) {
      const firstFactor = Math.min(table, partner);
      const secondFactor = Math.max(table, partner);
      const skillKey = `multiplication:${firstFactor}×${secondFactor}`;
      const classification = classifyCandidate(
        'multiplication',
        firstFactor,
        secondFactor,
        difficulty,
      );
      candidates.set(skillKey, {
        operation: 'multiplication',
        firstFactor,
        secondFactor,
        skillKey,
        ...classification,
        designatedFocusTable: classification.category === 'focus' ? secondFactor : null,
      });
    }
  }
  return [...candidates.values()];
}

function divisionCandidates(difficulty: DifficultyId, ranges: CompositionRanges): ComposedFact[] {
  const candidates: ComposedFact[] = [];
  for (const divisor of ranges.divisionTables) {
    for (let quotient = 0; quotient <= ranges.divisionQuotientMax; quotient += 1) {
      const dividend = divisor * quotient;
      const skillKey = `division:${dividend}÷${divisor}`;
      const classification = classifyCandidate('division', divisor, quotient, difficulty);
      candidates.push({
        operation: 'division',
        firstFactor: divisor,
        secondFactor: quotient,
        skillKey,
        ...classification,
        designatedFocusTable:
          classification.category === 'focus' ? Math.max(divisor, quotient) : null,
      });
    }
  }
  return candidates;
}

function categorySchedule(
  count: number,
  difficulty: DifficultyId,
  lowCount: number,
  random: RandomSource,
): FactCategory[] {
  const targets = compositionTargets(count, difficulty);
  const categories: FactCategory[] = [
    ...Array.from({ length: targets.minimumFocus }, () => 'focus' as const),
    ...Array.from({ length: lowCount }, () => 'low' as const),
    ...Array.from({ length: count - targets.minimumFocus - lowCount }, () => 'review' as const),
  ];
  return random.shuffle(categories);
}

function incrementMap(map: Map<number, number>, value: number, amount: number): void {
  const next = (map.get(value) ?? 0) + amount;
  if (next === 0) map.delete(value);
  else map.set(value, next);
}

function factorOccurrences(candidate: ComposedFact): Array<[number, number]> {
  if (candidate.firstFactor === candidate.secondFactor) {
    return [[candidate.firstFactor, 2]];
  }
  return [
    [candidate.firstFactor, 1],
    [candidate.secondFactor, 1],
  ];
}

function tablePressure(candidate: ComposedFact, counts: ReadonlyMap<number, number>): number {
  return factorOccurrences(candidate).reduce((pressure, [factor, occurrences]) => {
    const current = counts.get(factor) ?? 0;
    return pressure + (current + occurrences) ** 2 - current ** 2;
  }, 0);
}

function composeAttempt(
  operations: readonly ComposedOperation[],
  difficulty: DifficultyId,
  candidates: readonly ComposedFact[],
  lowCounts: Readonly<Record<ComposedOperation, number>>,
  random: RandomSource,
): ComposedFact[] | null {
  const operationCounts: Record<ComposedOperation, number> = {
    multiplication: operations.filter((operation) => operation === 'multiplication').length,
    division: operations.filter((operation) => operation === 'division').length,
  };
  const scheduledCategories: Record<ComposedOperation, FactCategory[]> = {
    multiplication: categorySchedule(
      operationCounts.multiplication,
      difficulty,
      lowCounts.multiplication,
      random,
    ),
    division: categorySchedule(operationCounts.division, difficulty, lowCounts.division, random),
  };
  const categoryIndexes: Record<ComposedOperation, number> = {
    multiplication: 0,
    division: 0,
  };
  const slots = operations.map((operation) => ({
    operation,
    category: scheduledCategories[operation][categoryIndexes[operation]++]!,
  }));
  const pools = new Map<string, ComposedFact[]>();
  for (const operation of ['multiplication', 'division'] as const) {
    for (const category of ['low', 'review', 'focus'] as const) {
      pools.set(
        `${operation}|${category}`,
        random.shuffle(
          candidates.filter(
            (candidate) => candidate.operation === operation && candidate.category === category,
          ),
        ),
      );
    }
  }

  const subtypeLimits = divisionSubtypeLimits(operationCounts.division, difficulty);
  const subtypeCounts = { zeroQuotient: 0, identityDivision: 0, unitDivisor: 0 };
  const tableCounts = new Map<number, number>();
  const usageCounts = new Map<string, number>();
  const selected: Array<ComposedFact | undefined> = Array.from({ length: slots.length });
  const maximumTableCount = tableValueLimit(operations.length, difficulty);
  const categoryPriority: Record<FactCategory, number> = { focus: 0, low: 1, review: 2 };
  const selectionOrder = slots
    .map((_, index) => index)
    .sort(
      (left, right) =>
        categoryPriority[slots[left]!.category] - categoryPriority[slots[right]!.category],
    );

  for (const slotIndex of selectionOrder) {
    const slot = slots[slotIndex]!;
    const poolKey = `${slot.operation}|${slot.category}`;
    const pool = pools.get(poolKey) ?? [];
    if (pool.length === 0) return null;
    const eligible = pool.filter((candidate) => {
      if (operationCounts[slot.operation] <= 20 && (usageCounts.get(candidate.skillKey) ?? 0) > 0) {
        return false;
      }
      if (candidate.zeroQuotient && subtypeCounts.zeroQuotient >= subtypeLimits.zeroQuotient) {
        return false;
      }
      if (
        candidate.identityDivision &&
        subtypeCounts.identityDivision >= subtypeLimits.identityDivision
      ) {
        return false;
      }
      if (candidate.unitDivisor && subtypeCounts.unitDivisor >= subtypeLimits.unitDivisor) {
        return false;
      }
      return factorOccurrences(candidate).every(
        ([factor, occurrences]) =>
          (tableCounts.get(factor) ?? 0) + occurrences <= maximumTableCount,
      );
    });

    eligible.sort((left, right) => {
      const usageDifference =
        (usageCounts.get(left.skillKey) ?? 0) - (usageCounts.get(right.skillKey) ?? 0);
      return (
        usageDifference || tablePressure(left, tableCounts) - tablePressure(right, tableCounts)
      );
    });
    const candidate = eligible[0];
    if (!candidate) return null;
    selected[slotIndex] = candidate;
    usageCounts.set(candidate.skillKey, (usageCounts.get(candidate.skillKey) ?? 0) + 1);
    for (const [factor, occurrences] of factorOccurrences(candidate)) {
      incrementMap(tableCounts, factor, occurrences);
    }
    if (candidate.zeroQuotient) subtypeCounts.zeroQuotient += 1;
    if (candidate.identityDivision) subtypeCounts.identityDivision += 1;
    if (candidate.unitDivisor) subtypeCounts.unitDivisor += 1;
  }

  const completed = selected.filter((candidate): candidate is ComposedFact => Boolean(candidate));
  if (completed.length !== slots.length) return null;
  for (let index = 1; index < completed.length; index += 1) {
    const previous = completed[index - 1]!;
    const current = completed[index]!;
    if (previous.skillKey === current.skillKey) return null;
  }
  return completed;
}

export function composeMultiplicationDivisionFacts(
  operations: readonly ComposedOperation[],
  difficulty: DifficultyId,
  ranges: CompositionRanges,
  lowCounts: Readonly<Record<ComposedOperation, number>>,
  random: RandomSource,
): ComposedFact[] {
  if (operations.length === 0) return [];
  const candidates = [
    ...multiplicationCandidates(difficulty, ranges),
    ...divisionCandidates(difficulty, ranges),
  ];
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = composeAttempt(operations, difficulty, candidates, lowCounts, random);
    if (result) return result;
  }
  throw new Error(`Unable to compose a ${difficulty} multiplication/division session.`);
}

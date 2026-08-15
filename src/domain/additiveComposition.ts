import type { DifficultyId } from './math';
import type { RandomSource } from './random';

export type ComposedAdditiveOperation = 'addition' | 'subtraction';
export type AdditiveCategory = 'low' | 'review' | 'focus' | 'negative';

export interface AdditiveCompositionRanges {
  additionOperandMax: number;
  additionSumMax: number;
  subtractionOperandMax: number;
  allowNegativeSubtraction: boolean;
}

export interface ComposedAdditiveFact {
  operation: ComposedAdditiveOperation;
  left: number;
  right: number;
  correctAnswer: number;
  skillKey: string;
  category: AdditiveCategory;
  regroupCount: number;
  zeroOperand: boolean;
  subtractZero: boolean;
  zeroDifference: boolean;
}

interface AdditiveCompositionTargets {
  maximumLow: number;
  minimumFocus: number;
}

const LOW_PER_TEN: Record<DifficultyId, number> = {
  easy: 2,
  medium: 1,
  hard: 1,
  advanced: 1,
};

const FOCUS_PER_TEN: Record<DifficultyId, number> = {
  easy: 3,
  medium: 4,
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

export function additiveCompositionTargets(
  count: number,
  difficulty: DifficultyId,
): AdditiveCompositionTargets {
  return {
    maximumLow: maximumPerTen(count, LOW_PER_TEN[difficulty]),
    minimumFocus: minimumFocusCount(count, difficulty),
  };
}

export function additiveAnswerLimit(relevantQuestionCount: number): number {
  return Math.max(2, maximumPerTen(relevantQuestionCount, 2));
}

export function subtractionSubtypeLimits(count: number) {
  return {
    subtractZero: maximumPerTen(count, 1),
    zeroDifference: maximumPerTen(count, 1),
  };
}

export function negativeSubtractionTargets(count: number, difficulty: DifficultyId) {
  if (difficulty !== 'advanced') return { minimum: 0, maximum: 0 };
  return {
    minimum: count === 0 ? 0 : Math.max(1, Math.floor((count * 3) / 10)),
    maximum: maximumPerTen(count, 5),
  };
}

export function additionRegroupCount(left: number, right: number): number {
  let first = Math.abs(left);
  let second = Math.abs(right);
  let carry = 0;
  let count = 0;
  while (first > 0 || second > 0 || carry > 0) {
    const sum = (first % 10) + (second % 10) + carry;
    if (sum >= 10) count += 1;
    carry = sum >= 10 ? 1 : 0;
    first = Math.floor(first / 10);
    second = Math.floor(second / 10);
  }
  return count;
}

export function subtractionBorrowCount(left: number, right: number): number {
  if (left < right) return 0;
  let minuend = left;
  let subtrahend = right;
  let borrowed = 0;
  let count = 0;
  while (minuend > 0 || subtrahend > 0) {
    const minuendDigit = (minuend % 10) - borrowed;
    const subtrahendDigit = subtrahend % 10;
    if (minuendDigit < subtrahendDigit) {
      count += 1;
      borrowed = 1;
    } else {
      borrowed = 0;
    }
    minuend = Math.floor(minuend / 10);
    subtrahend = Math.floor(subtrahend / 10);
  }
  return count;
}

export function isAdditiveFocus(
  operation: ComposedAdditiveOperation,
  left: number,
  right: number,
  difficulty: DifficultyId,
): boolean {
  if (operation === 'addition') {
    const regroupCount = additionRegroupCount(left, right);
    if (difficulty === 'advanced') return regroupCount >= 2;
    if (difficulty === 'hard') return regroupCount >= 1 && Math.max(left, right) >= 100;
    return regroupCount >= 1;
  }

  if (left < right) return difficulty === 'advanced';
  const borrowCount = subtractionBorrowCount(left, right);
  if (difficulty === 'advanced') return borrowCount >= 2;
  if (difficulty === 'hard') return borrowCount >= 1 && left >= 100;
  return borrowCount >= 1;
}

function additionSkillKey(left: number, right: number): string {
  return `addition:${Math.min(left, right)}+${Math.max(left, right)}`;
}

function classifyCandidate(
  operation: ComposedAdditiveOperation,
  left: number,
  right: number,
  difficulty: DifficultyId,
): ComposedAdditiveFact {
  const correctAnswer = operation === 'addition' ? left + right : left - right;
  const zeroOperand = operation === 'addition' && (left === 0 || right === 0);
  const subtractZero = operation === 'subtraction' && right === 0;
  const zeroDifference = operation === 'subtraction' && left === right;
  const low = zeroOperand || subtractZero || zeroDifference;
  const negative = operation === 'subtraction' && correctAnswer < 0;
  const regroupCount =
    operation === 'addition'
      ? additionRegroupCount(left, right)
      : subtractionBorrowCount(left, right);
  const category: AdditiveCategory = low
    ? 'low'
    : negative
      ? 'negative'
      : isAdditiveFocus(operation, left, right, difficulty)
        ? 'focus'
        : 'review';
  return {
    operation,
    left,
    right,
    correctAnswer,
    skillKey:
      operation === 'addition' ? additionSkillKey(left, right) : `subtraction:${left}−${right}`,
    category,
    regroupCount,
    zeroOperand,
    subtractZero,
    zeroDifference,
  };
}

function plannedLowCount(
  count: number,
  difficulty: DifficultyId,
  maximumLow: number,
  random: RandomSource,
): number {
  if (difficulty === 'easy') return maximumLow;
  const base = Math.round((count * 0.5) / 10);
  return Math.max(0, Math.min(maximumLow, base + random.integer(-1, 1)));
}

function categorySchedule(
  operation: ComposedAdditiveOperation,
  count: number,
  difficulty: DifficultyId,
  random: RandomSource,
): AdditiveCategory[] {
  if (count === 0) return [];
  const targets = additiveCompositionTargets(count, difficulty);
  const negativeCount =
    operation === 'subtraction' ? negativeSubtractionTargets(count, difficulty).minimum : 0;
  const lowCount = plannedLowCount(count, difficulty, targets.maximumLow, random);
  const otherFocusCount = Math.max(0, targets.minimumFocus - negativeCount);
  return random.shuffle([
    ...Array.from({ length: negativeCount }, () => 'negative' as const),
    ...Array.from({ length: otherFocusCount }, () => 'focus' as const),
    ...Array.from({ length: lowCount }, () => 'low' as const),
    ...Array.from(
      { length: count - negativeCount - otherFocusCount - lowCount },
      () => 'review' as const,
    ),
  ]);
}

function generateLowCandidate(
  operation: ComposedAdditiveOperation,
  difficulty: DifficultyId,
  ranges: AdditiveCompositionRanges,
  random: RandomSource,
): ComposedAdditiveFact {
  if (operation === 'addition') {
    const value = random.integer(1, ranges.additionOperandMax);
    const [left, right] = random.integer(0, 1) === 0 ? [0, value] : [value, 0];
    return classifyCandidate(operation, left, right, difficulty);
  }

  const value = random.integer(1, ranges.subtractionOperandMax);
  return random.integer(0, 1) === 0
    ? classifyCandidate(operation, value, 0, difficulty)
    : classifyCandidate(operation, value, value, difficulty);
}

function generateCandidate(
  operation: ComposedAdditiveOperation,
  category: AdditiveCategory,
  difficulty: DifficultyId,
  ranges: AdditiveCompositionRanges,
  random: RandomSource,
): ComposedAdditiveFact {
  if (category === 'low') return generateLowCandidate(operation, difficulty, ranges, random);

  if (category === 'negative') {
    const left = random.integer(0, ranges.subtractionOperandMax - 1);
    const right = random.integer(left + 1, ranges.subtractionOperandMax);
    return classifyCandidate('subtraction', left, right, difficulty);
  }

  if (operation === 'addition') {
    const left = random.integer(1, ranges.additionOperandMax);
    const right = random.integer(
      1,
      Math.min(ranges.additionOperandMax, ranges.additionSumMax - left),
    );
    return classifyCandidate(operation, left, right, difficulty);
  }

  let left = random.integer(1, ranges.subtractionOperandMax);
  let right = random.integer(1, ranges.subtractionOperandMax);
  if (!ranges.allowNegativeSubtraction && right > left) [left, right] = [right, left];
  return classifyCandidate(operation, left, right, difficulty);
}

function composeAttempt(
  operations: readonly ComposedAdditiveOperation[],
  difficulty: DifficultyId,
  ranges: AdditiveCompositionRanges,
  random: RandomSource,
): ComposedAdditiveFact[] | null {
  const operationCounts: Record<ComposedAdditiveOperation, number> = {
    addition: operations.filter((operation) => operation === 'addition').length,
    subtraction: operations.filter((operation) => operation === 'subtraction').length,
  };
  const categoryIndexes: Record<ComposedAdditiveOperation, number> = {
    addition: 0,
    subtraction: 0,
  };
  const schedules: Record<ComposedAdditiveOperation, AdditiveCategory[]> = {
    addition: categorySchedule('addition', operationCounts.addition, difficulty, random),
    subtraction: categorySchedule('subtraction', operationCounts.subtraction, difficulty, random),
  };
  const slots = operations.map((operation) => ({
    operation,
    category: schedules[operation][categoryIndexes[operation]++]!,
  }));
  const selected: Array<ComposedAdditiveFact | undefined> = Array.from({ length: slots.length });
  const usageCounts = new Map<string, number>();
  const answerCounts = new Map<number, number>();
  const subtypeLimits = subtractionSubtypeLimits(operationCounts.subtraction);
  const subtypeCounts = { subtractZero: 0, zeroDifference: 0 };
  const answerLimit = additiveAnswerLimit(operations.length);
  const categoryPriority: Record<AdditiveCategory, number> = {
    negative: 0,
    focus: 1,
    low: 2,
    review: 3,
  };
  const selectionOrder = slots
    .map((_, index) => index)
    .sort(
      (left, right) =>
        categoryPriority[slots[left]!.category] - categoryPriority[slots[right]!.category],
    );

  for (const slotIndex of selectionOrder) {
    const slot = slots[slotIndex]!;
    let candidate: ComposedAdditiveFact | undefined;
    for (let attempt = 0; attempt < 4_000; attempt += 1) {
      const generated = generateCandidate(
        slot.operation,
        slot.category,
        difficulty,
        ranges,
        random,
      );
      if (generated.category !== slot.category) continue;
      if ((usageCounts.get(generated.skillKey) ?? 0) > 0) continue;
      if ((answerCounts.get(generated.correctAnswer) ?? 0) >= answerLimit) continue;
      if (generated.subtractZero && subtypeCounts.subtractZero >= subtypeLimits.subtractZero) {
        continue;
      }
      if (
        generated.zeroDifference &&
        subtypeCounts.zeroDifference >= subtypeLimits.zeroDifference
      ) {
        continue;
      }
      candidate = generated;
      break;
    }
    if (!candidate) return null;
    selected[slotIndex] = candidate;
    usageCounts.set(candidate.skillKey, (usageCounts.get(candidate.skillKey) ?? 0) + 1);
    answerCounts.set(candidate.correctAnswer, (answerCounts.get(candidate.correctAnswer) ?? 0) + 1);
    if (candidate.subtractZero) subtypeCounts.subtractZero += 1;
    if (candidate.zeroDifference) subtypeCounts.zeroDifference += 1;
  }

  const completed = selected.filter((candidate): candidate is ComposedAdditiveFact =>
    Boolean(candidate),
  );
  if (completed.length !== slots.length) return null;
  for (let index = 1; index < completed.length; index += 1) {
    if (completed[index]!.skillKey === completed[index - 1]!.skillKey) return null;
  }
  return completed;
}

export function composeAdditionSubtractionFacts(
  operations: readonly ComposedAdditiveOperation[],
  difficulty: DifficultyId,
  ranges: AdditiveCompositionRanges,
  random: RandomSource,
): ComposedAdditiveFact[] {
  if (operations.length === 0) return [];
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = composeAttempt(operations, difficulty, ranges, random);
    if (result) return result;
  }
  throw new Error(`Unable to compose a ${difficulty} addition/subtraction session.`);
}

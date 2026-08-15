import { describe, expect, it } from 'vitest';
import {
  additionRegroupCount,
  additiveAnswerLimit,
  additiveCompositionTargets,
  isAdditiveFocus,
  negativeSubtractionTargets,
  subtractionBorrowCount,
  subtractionSubtypeLimits,
} from './additiveComposition';
import { isFocusFactorPair } from './composition';
import {
  DIFFICULTY_IDS,
  generateSession,
  OPERATION_IDS,
  QUESTION_COUNTS,
  type DifficultyId,
  type OperationId,
  type Problem,
} from './math';
import { SeededRandom } from './random';

function isLowChallenge(problem: Problem): boolean {
  if (problem.operation === 'addition') return problem.left === 0 || problem.right === 0;
  if (problem.operation === 'subtraction') {
    return problem.right === 0 || problem.left === problem.right;
  }
  return false;
}

function expectValidAdditiveComposition(
  problems: readonly Problem[],
  difficulty: DifficultyId,
): void {
  const additive = problems.filter(
    ({ operation }) => operation === 'addition' || operation === 'subtraction',
  );
  const answerCounts = new Map<number, number>();
  for (const problem of additive) {
    answerCounts.set(problem.correctAnswer, (answerCounts.get(problem.correctAnswer) ?? 0) + 1);
  }
  const answerLimit = additiveAnswerLimit(additive.length);
  for (const count of answerCounts.values()) expect(count).toBeLessThanOrEqual(answerLimit);

  for (const operation of ['addition', 'subtraction'] as const) {
    const operationProblems = additive.filter((problem) => problem.operation === operation);
    const targets = additiveCompositionTargets(operationProblems.length, difficulty);
    const lowCount = operationProblems.filter(isLowChallenge).length;
    expect(lowCount).toBeLessThanOrEqual(targets.maximumLow);
    const focusCount = operationProblems.filter(
      (problem) =>
        !isLowChallenge(problem) &&
        isAdditiveFocus(operation, problem.left, problem.right, difficulty),
    ).length;
    expect(focusCount).toBeGreaterThanOrEqual(targets.minimumFocus);

    if (operationProblems.length <= 20) {
      expect(new Set(operationProblems.map(({ skillKey }) => skillKey)).size).toBe(
        operationProblems.length,
      );
    }
  }

  const subtraction = additive.filter((problem) => problem.operation === 'subtraction');
  const subtypeLimits = subtractionSubtypeLimits(subtraction.length);
  expect(subtraction.filter(({ right }) => right === 0).length).toBeLessThanOrEqual(
    subtypeLimits.subtractZero,
  );
  expect(subtraction.filter(({ left, right }) => left === right).length).toBeLessThanOrEqual(
    subtypeLimits.zeroDifference,
  );
  const negativeTargets = negativeSubtractionTargets(subtraction.length, difficulty);
  const negativeCount = subtraction.filter(({ correctAnswer }) => correctAnswer < 0).length;
  expect(negativeCount).toBeGreaterThanOrEqual(negativeTargets.minimum);
  expect(negativeCount).toBeLessThanOrEqual(negativeTargets.maximum);

  for (let index = 1; index < additive.length; index += 1) {
    expect(additive[index]?.skillKey).not.toBe(additive[index - 1]?.skillKey);
  }
}

function operationSets(): OperationId[][] {
  return Array.from({ length: 2 ** OPERATION_IDS.length - 1 }, (_, maskIndex) => {
    const mask = maskIndex + 1;
    return OPERATION_IDS.filter((_, operationIndex) => (mask & (1 << operationIndex)) !== 0);
  });
}

describe('addition and subtraction composition', () => {
  it('counts carrying and borrowing columns', () => {
    expect(additionRegroupCount(8, 7)).toBe(1);
    expect(additionRegroupCount(58, 67)).toBe(2);
    expect(additionRegroupCount(500, 200)).toBe(0);
    expect(subtractionBorrowCount(12, 7)).toBe(1);
    expect(subtractionBorrowCount(100, 1)).toBe(2);
    expect(subtractionBorrowCount(50, 20)).toBe(0);
    expect(subtractionBorrowCount(7, 12)).toBe(0);
  });

  it('defines the difficulty focus bands and scaled limits', () => {
    expect(isAdditiveFocus('addition', 8, 7, 'easy')).toBe(true);
    expect(isAdditiveFocus('addition', 20, 5, 'medium')).toBe(false);
    expect(isAdditiveFocus('addition', 58, 67, 'hard')).toBe(false);
    expect(isAdditiveFocus('addition', 158, 67, 'hard')).toBe(true);
    expect(isAdditiveFocus('addition', 58, 67, 'advanced')).toBe(true);
    expect(isAdditiveFocus('subtraction', 12, 7, 'medium')).toBe(true);
    expect(isAdditiveFocus('subtraction', 52, 7, 'hard')).toBe(false);
    expect(isAdditiveFocus('subtraction', 152, 7, 'hard')).toBe(true);
    expect(isAdditiveFocus('subtraction', 100, 1, 'advanced')).toBe(true);
    expect(isAdditiveFocus('subtraction', 7, 12, 'advanced')).toBe(true);
    expect(isAdditiveFocus('subtraction', 7, 12, 'hard')).toBe(false);

    expect(additiveCompositionTargets(10, 'easy')).toEqual({
      maximumLow: 2,
      minimumFocus: 3,
    });
    expect(additiveCompositionTargets(5, 'medium')).toEqual({
      maximumLow: 1,
      minimumFocus: 2,
    });
    expect(additiveCompositionTargets(20, 'hard')).toEqual({
      maximumLow: 2,
      minimumFocus: 12,
    });
    expect(additiveCompositionTargets(3, 'advanced')).toEqual({
      maximumLow: 1,
      minimumFocus: 2,
    });
    expect(additiveCompositionTargets(3, 'hard')).toEqual({
      maximumLow: 1,
      minimumFocus: 1,
    });
    expect(additiveAnswerLimit(5)).toBe(2);
    expect(additiveAnswerLimit(20)).toBe(4);
    expect(subtractionSubtypeLimits(20)).toEqual({ subtractZero: 2, zeroDifference: 2 });
    expect(negativeSubtractionTargets(20, 'advanced')).toEqual({ minimum: 6, maximum: 10 });
    expect(negativeSubtractionTargets(3, 'advanced')).toEqual({ minimum: 1, maximum: 2 });
    expect(negativeSubtractionTargets(0, 'advanced')).toEqual({ minimum: 0, maximum: 0 });
    expect(negativeSubtractionTargets(20, 'hard')).toEqual({ minimum: 0, maximum: 0 });
  });

  it('composes every settings shape across a fixed seed matrix', () => {
    for (const difficulty of DIFFICULTY_IDS) {
      for (const questionCount of QUESTION_COUNTS) {
        for (const operations of operationSets()) {
          for (const seed of [0, 1, 17, 809]) {
            try {
              const problems = generateSession(
                { operations, difficulty, questionCount },
                new SeededRandom(seed),
              );
              expect(problems).toHaveLength(questionCount);
              expectValidAdditiveComposition(problems, difficulty);
            } catch (error) {
              throw new Error(
                `Invalid ${difficulty} ${operations.join('+')} ${questionCount}-question round for seed ${seed}.`,
                { cause: error },
              );
            }
          }
        }
      }
    }
  });

  it('satisfies the complete contract across 5,000 representative seeds', () => {
    for (let seed = 0; seed < 5_000; seed += 1) {
      const operation = seed % 2 === 0 ? 'addition' : 'subtraction';
      const difficulty = DIFFICULTY_IDS[Math.floor(seed / 2) % DIFFICULTY_IDS.length]!;
      const problems = generateSession(
        { operations: [operation], difficulty, questionCount: 20 },
        new SeededRandom(seed),
      );
      expectValidAdditiveComposition(problems, difficulty);
    }
  });

  it('keeps a ten-question Advanced mixed round at six focus questions with a negative', () => {
    const problems = generateSession(
      {
        operations: ['addition', 'subtraction', 'multiplication', 'division'],
        difficulty: 'advanced',
        questionCount: 10,
      },
      new SeededRandom(3_668_138_647),
    );
    const focusCount = problems.filter((problem) => {
      if (problem.operation === 'addition' || problem.operation === 'subtraction') {
        return (
          !isLowChallenge(problem) &&
          isAdditiveFocus(problem.operation, problem.left, problem.right, 'advanced')
        );
      }
      const pair: [number, number] =
        problem.operation === 'multiplication'
          ? [problem.left, problem.right]
          : [problem.right, problem.correctAnswer];
      return !isLowChallenge(problem) && isFocusFactorPair(pair[0], pair[1], 'advanced');
    }).length;
    expect(focusCount).toBe(6);
    expect(
      problems.filter(
        ({ operation, correctAnswer }) => operation === 'subtraction' && correctAnswer < 0,
      ),
    ).toHaveLength(1);
  });

  it('keeps composed correct-answer positions broadly distributed', () => {
    const positions = [0, 0, 0, 0];
    for (let seed = 0; seed < 400; seed += 1) {
      const difficulty = DIFFICULTY_IDS[seed % DIFFICULTY_IDS.length]!;
      const problems = generateSession(
        { operations: ['addition', 'subtraction'], difficulty, questionCount: 10 },
        new SeededRandom(seed),
      );
      for (const problem of problems) {
        positions[problem.correctChoiceIndex] = (positions[problem.correctChoiceIndex] ?? 0) + 1;
      }
    }
    for (const count of positions) {
      expect(count).toBeGreaterThan(850);
      expect(count).toBeLessThan(1_150);
    }
  });
});

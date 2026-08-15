import { describe, expect, it } from 'vitest';
import {
  compositionTargets,
  divisionSubtypeLimits,
  isFocusFactorPair,
  tableValueLimit,
} from './composition';
import {
  DIFFICULTY_IDS,
  DIFFICULTY_RULES,
  generateSession,
  OPERATION_IDS,
  QUESTION_COUNTS,
  type DifficultyId,
  type OperationId,
  type Problem,
} from './math';
import { SeededRandom } from './random';

function factorPair(problem: Problem): [number, number] | null {
  if (problem.operation === 'multiplication') return [problem.left, problem.right];
  if (problem.operation === 'division') return [problem.right, problem.correctAnswer];
  return null;
}

function isLowChallenge(problem: Problem): boolean {
  if (problem.operation === 'multiplication') return problem.left <= 1 || problem.right <= 1;
  if (problem.operation === 'division') {
    return problem.correctAnswer <= 1 || problem.right === 1;
  }
  return false;
}

function expectValidComposition(problems: readonly Problem[], difficulty: DifficultyId): void {
  const multiplicationDivision = problems.filter(
    ({ operation }) => operation === 'multiplication' || operation === 'division',
  );
  const tableCounts = new Map<number, number>();
  for (const problem of multiplicationDivision) {
    const pair = factorPair(problem)!;
    for (const factor of pair) tableCounts.set(factor, (tableCounts.get(factor) ?? 0) + 1);
  }
  const maximumTableCount = tableValueLimit(multiplicationDivision.length, difficulty);
  for (const count of tableCounts.values()) expect(count).toBeLessThanOrEqual(maximumTableCount);

  for (const operation of ['multiplication', 'division'] as const) {
    const operationProblems = problems.filter((problem) => problem.operation === operation);
    const targets = compositionTargets(operationProblems.length, difficulty);
    expect(operationProblems.filter(isLowChallenge).length).toBeLessThanOrEqual(targets.maximumLow);
    const focusCount = operationProblems.filter((problem) => {
      const pair = factorPair(problem)!;
      return !isLowChallenge(problem) && isFocusFactorPair(pair[0], pair[1], difficulty);
    }).length;
    expect(focusCount).toBeGreaterThanOrEqual(targets.minimumFocus);

    if (operationProblems.length <= 20) {
      expect(new Set(operationProblems.map(({ skillKey }) => skillKey)).size).toBe(
        operationProblems.length,
      );
    }
  }

  const division = problems.filter((problem) => problem.operation === 'division');
  const subtypeLimits = divisionSubtypeLimits(division.length, difficulty);
  expect(division.filter(({ correctAnswer }) => correctAnswer === 0).length).toBeLessThanOrEqual(
    subtypeLimits.zeroQuotient,
  );
  expect(division.filter(({ correctAnswer }) => correctAnswer === 1).length).toBeLessThanOrEqual(
    subtypeLimits.identityDivision,
  );
  expect(division.filter(({ right }) => right === 1).length).toBeLessThanOrEqual(
    subtypeLimits.unitDivisor,
  );

  for (let index = 1; index < multiplicationDivision.length; index += 1) {
    expect(multiplicationDivision[index]?.skillKey).not.toBe(
      multiplicationDivision[index - 1]?.skillKey,
    );
  }
}

function operationSets(): OperationId[][] {
  return Array.from({ length: 2 ** OPERATION_IDS.length - 1 }, (_, maskIndex) => {
    const mask = maskIndex + 1;
    return OPERATION_IDS.filter((_, operationIndex) => (mask & (1 << operationIndex)) !== 0);
  });
}

describe('composition rules', () => {
  it('defines the intended focus bands and scaled limits', () => {
    expect(isFocusFactorPair(2, 8, 'easy')).toBe(false);
    expect(isFocusFactorPair(3, 9, 'medium')).toBe(true);
    expect(isFocusFactorPair(5, 9, 'medium')).toBe(false);
    expect(isFocusFactorPair(6, 12, 'hard')).toBe(true);
    expect(isFocusFactorPair(5, 12, 'hard')).toBe(false);
    expect(isFocusFactorPair(13, 6, 'advanced')).toBe(true);
    expect(isFocusFactorPair(12, 20, 'advanced')).toBe(true);
    expect(isFocusFactorPair(13, 5, 'advanced')).toBe(false);

    expect(compositionTargets(10, 'easy')).toEqual({ maximumLow: 3, minimumFocus: 0 });
    expect(compositionTargets(5, 'medium')).toEqual({ maximumLow: 1, minimumFocus: 2 });
    expect(compositionTargets(20, 'hard')).toEqual({ maximumLow: 2, minimumFocus: 12 });
    expect(compositionTargets(3, 'advanced')).toEqual({ maximumLow: 1, minimumFocus: 2 });
    expect(compositionTargets(3, 'hard')).toEqual({ maximumLow: 1, minimumFocus: 1 });
    expect(tableValueLimit(5, 'hard')).toBe(2);
    expect(tableValueLimit(10, 'medium')).toBe(3);
    expect(tableValueLimit(20, 'easy')).toBe(8);
    expect(divisionSubtypeLimits(20, 'medium')).toEqual({
      zeroQuotient: 2,
      identityDivision: 2,
      unitDivisor: 2,
    });
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
              expectValidComposition(problems, difficulty);
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

  it('preserves multiplication and division ranges after composing and orienting facts', () => {
    for (const difficulty of DIFFICULTY_IDS) {
      const rules = DIFFICULTY_RULES[difficulty];
      const problems = generateSession(
        { operations: ['multiplication', 'division'], difficulty, questionCount: 50 },
        new SeededRandom(91),
      );
      for (const problem of problems) {
        if (problem.operation === 'multiplication') {
          expect(problem.left).toBeLessThanOrEqual(rules.multiplicationFactorMax);
          expect(problem.right).toBeLessThanOrEqual(rules.multiplicationFactorMax);
          expect(
            rules.multiplicationTables.includes(problem.left) ||
              rules.multiplicationTables.includes(problem.right),
          ).toBe(true);
        } else {
          expect(rules.divisionTables).toContain(problem.right);
          expect(problem.correctAnswer).toBeLessThanOrEqual(rules.divisionQuotientMax);
        }
      }
    }
  });

  it('fixes the locally reported table-11 and identity clustering seeds', () => {
    const elevenRound = generateSession(
      { operations: ['multiplication', 'division'], difficulty: 'hard', questionCount: 10 },
      new SeededRandom(1_118_559_771),
    );
    const elevenAppearances = elevenRound.reduce((count, problem) => {
      const pair = factorPair(problem)!;
      return count + pair.filter((factor) => factor === 11).length;
    }, 0);
    expect(elevenAppearances).toBeLessThanOrEqual(2);

    const identityRound = generateSession(
      { operations: ['division'], difficulty: 'medium', questionCount: 20 },
      new SeededRandom(4_260_552_859),
    );
    expect(
      identityRound.filter(({ correctAnswer }) => correctAnswer === 1).length,
    ).toBeLessThanOrEqual(2);
  });

  it('keeps composed correct-answer positions broadly distributed', () => {
    const positions = [0, 0, 0, 0];
    for (let seed = 0; seed < 400; seed += 1) {
      const difficulty = DIFFICULTY_IDS[seed % DIFFICULTY_IDS.length]!;
      const problems = generateSession(
        { operations: ['multiplication', 'division'], difficulty, questionCount: 10 },
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

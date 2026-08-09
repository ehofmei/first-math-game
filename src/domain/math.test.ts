import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  additionSkillKey,
  DEFAULT_SETTINGS,
  DIFFICULTY_IDS,
  DIFFICULTY_RULES,
  generateProblem,
  generateSession,
  multiplicationSkillKey,
  OPERATION_IDS,
  type DifficultyId,
  type OperationId,
  type Problem,
} from './math';
import { SeededRandom } from './random';

function expectValidChoices(problem: Problem) {
  expect(problem.choices).toHaveLength(4);
  expect(new Set(problem.choices).size).toBe(4);
  expect(problem.choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
  expect(problem.choices[problem.correctChoiceIndex]).toBe(problem.correctAnswer);
}

describe('problem generation', () => {
  it('normalizes commutative skill keys', () => {
    expect(additionSkillKey(7, 3)).toBe(additionSkillKey(3, 7));
    expect(multiplicationSkillKey(7, 3)).toBe(multiplicationSkillKey(3, 7));
  });

  it('satisfies every operation and difficulty invariant across many seeds', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.constantFrom<OperationId>(...OPERATION_IDS),
        fc.constantFrom<DifficultyId>(...DIFFICULTY_IDS),
        (seed, operation, difficulty) => {
          const problem = generateProblem(operation, difficulty, new SeededRandom(seed));
          const rules = DIFFICULTY_RULES[difficulty];
          expect(problem.operation).toBe(operation);
          expectValidChoices(problem);

          switch (operation) {
            case 'addition':
              expect(problem.correctAnswer).toBe(problem.left + problem.right);
              expect(problem.left).toBeGreaterThanOrEqual(0);
              expect(problem.right).toBeGreaterThanOrEqual(0);
              expect(problem.correctAnswer).toBeLessThanOrEqual(rules.additionSumMax);
              break;
            case 'subtraction':
              expect(problem.correctAnswer).toBe(problem.left - problem.right);
              if (!rules.allowNegativeSubtraction) {
                expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
              }
              break;
            case 'multiplication':
              expect(problem.correctAnswer).toBe(problem.left * problem.right);
              expect(rules.multiplicationTables).toContain(problem.left);
              expect(problem.right).toBeLessThanOrEqual(rules.multiplicationFactorMax);
              break;
            case 'division':
              expect(problem.right).toBeGreaterThan(0);
              expect(problem.left % problem.right).toBe(0);
              expect(problem.correctAnswer).toBe(problem.left / problem.right);
              expect(problem.correctAnswer).toBeLessThanOrEqual(rules.divisionQuotientMax);
              break;
          }
        },
      ),
      { numRuns: 4_000 },
    );
  });

  it('allows negative subtraction only on Advanced', () => {
    const advanced = Array.from({ length: 200 }, (_, seed) =>
      generateProblem('subtraction', 'advanced', new SeededRandom(seed)),
    );
    expect(advanced.some(({ correctAnswer }) => correctAnswer < 0)).toBe(true);

    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const problems = Array.from({ length: 200 }, (_, seed) =>
        generateProblem('subtraction', difficulty, new SeededRandom(seed)),
      );
      expect(problems.every(({ correctAnswer }) => correctAnswer >= 0)).toBe(true);
    }
  });
});

describe('session generation', () => {
  it('is deterministic, unique for a short round, and balances selected operations', () => {
    const settings = { ...DEFAULT_SETTINGS, operations: [...OPERATION_IDS] };
    const first = generateSession(settings, new SeededRandom(123));
    const second = generateSession(settings, new SeededRandom(123));
    expect(first).toEqual(second);
    expect(first).toHaveLength(10);
    expect(new Set(first.map((problem) => problem.skillKey)).size).toBe(10);

    const counts = OPERATION_IDS.map(
      (operation) => first.filter((problem) => problem.operation === operation).length,
    );
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    expect(counts.every((count) => count > 0)).toBe(true);
  });

  it('supports long sessions even when a small fact pool eventually repeats', () => {
    const session = generateSession(
      { operations: ['division'], difficulty: 'easy', questionCount: 50 },
      new SeededRandom(44),
    );
    expect(session).toHaveLength(50);
    expect(session.every(({ operation }) => operation === 'division')).toBe(true);
  });

  it('rejects an empty operation selection', () => {
    expect(() =>
      generateSession({ ...DEFAULT_SETTINGS, operations: [] }, new SeededRandom(1)),
    ).toThrow(/at least one operation/i);
  });

  it('does not favor one answer position across the configuration matrix', () => {
    const counts = [0, 0, 0, 0];
    for (let seed = 0; seed < 8_000; seed += 1) {
      const operation = OPERATION_IDS[seed % OPERATION_IDS.length]!;
      const difficulty =
        DIFFICULTY_IDS[Math.floor(seed / OPERATION_IDS.length) % DIFFICULTY_IDS.length]!;
      const problem = generateProblem(operation, difficulty, new SeededRandom(seed));
      counts[problem.correctChoiceIndex] = (counts[problem.correctChoiceIndex] ?? 0) + 1;
    }
    for (const count of counts) expect(count).toBeGreaterThan(1_800);
    for (const count of counts) expect(count).toBeLessThan(2_200);
  });
});

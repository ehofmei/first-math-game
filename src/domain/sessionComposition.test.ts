import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_IDS,
  generateSession,
  OPERATION_IDS,
  QUESTION_COUNTS,
  type OperationId,
  type Problem,
} from './math';
import { SeededRandom } from './random';
import { allocateSessionLowChallengeCounts, sessionLowChallengeLimit } from './sessionComposition';

function isLowChallenge(problem: Problem): boolean {
  if (problem.operation === 'addition') return problem.left === 0 || problem.right === 0;
  if (problem.operation === 'subtraction') {
    return problem.right === 0 || problem.left === problem.right;
  }
  if (problem.operation === 'multiplication') return problem.left <= 1 || problem.right <= 1;
  return problem.correctAnswer <= 1 || problem.right === 1;
}

function operationSets(): OperationId[][] {
  return Array.from({ length: 2 ** OPERATION_IDS.length - 1 }, (_, maskIndex) => {
    const mask = maskIndex + 1;
    return OPERATION_IDS.filter((_, operationIndex) => (mask & (1 << operationIndex)) !== 0);
  });
}

describe('session-level low-challenge composition', () => {
  it('defines one global limit rather than rounding once per operation', () => {
    expect(sessionLowChallengeLimit(10, 'easy')).toBe(3);
    expect(sessionLowChallengeLimit(10, 'medium')).toBe(2);
    expect(sessionLowChallengeLimit(10, 'hard')).toBe(1);
    expect(sessionLowChallengeLimit(10, 'advanced')).toBe(1);
    expect(sessionLowChallengeLimit(20, 'advanced')).toBe(2);
    expect(sessionLowChallengeLimit(50, 'medium')).toBe(10);
  });

  it('allocates a deterministic Advanced budget across selected operations', () => {
    const schedule: OperationId[] = [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'addition',
      'subtraction',
    ];
    const first = allocateSessionLowChallengeCounts(
      schedule,
      'advanced',
      new SeededRandom(340_833_550),
    );
    const second = allocateSessionLowChallengeCounts(
      schedule,
      'advanced',
      new SeededRandom(340_833_550),
    );

    expect(second).toEqual(first);
    expect(Object.values(first).reduce((total, count) => total + count, 0)).toBeLessThanOrEqual(1);
  });

  it('caps the two locally reported Advanced identity-clustering seeds', () => {
    for (const seed of [340_833_550, 3_497_903_804]) {
      const problems = generateSession(
        {
          operations: ['addition', 'subtraction', 'multiplication', 'division'],
          difficulty: 'advanced',
          questionCount: 10,
        },
        new SeededRandom(seed),
      );
      expect(problems.filter(isLowChallenge).length).toBeLessThanOrEqual(1);
    }
  });

  it('satisfies the global limit across every settings shape', () => {
    for (const difficulty of DIFFICULTY_IDS) {
      for (const questionCount of QUESTION_COUNTS) {
        for (const operations of operationSets()) {
          for (const seed of [0, 1, 17, 809]) {
            const problems = generateSession(
              { operations, difficulty, questionCount },
              new SeededRandom(seed),
            );
            expect(problems.filter(isLowChallenge).length).toBeLessThanOrEqual(
              sessionLowChallengeLimit(questionCount, difficulty),
            );
          }
        }
      }
    }
  });

  it('still varies between zero and one Advanced identity across seeds', () => {
    const observed = new Set<number>();
    for (let seed = 0; seed < 500; seed += 1) {
      const problems = generateSession(
        {
          operations: ['addition', 'subtraction', 'multiplication', 'division'],
          difficulty: 'advanced',
          questionCount: 10,
        },
        new SeededRandom(seed),
      );
      observed.add(problems.filter(isLowChallenge).length);
    }
    expect(observed).toEqual(new Set([0, 1]));
  });
});

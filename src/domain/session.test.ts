import { describe, expect, it } from 'vitest';
import { FakeClock } from './clock';
import { DEFAULT_SETTINGS, generateSession } from './math';
import { SeededRandom } from './random';
import { RULESET_VERSION, scoreAnswer, summarizeSession, type AnswerRecord } from './session';

describe('session scoring', () => {
  it('rewards accurate responses with a bounded speed bonus', () => {
    expect(scoreAnswer(false, 100)).toBe(0);
    expect(scoreAnswer(true, -10)).toBe(150);
    expect(scoreAnswer(true, 2_000)).toBe(140);
    expect(scoreAnswer(true, 20_000)).toBe(100);
  });

  it('locks the score curve used by balance comparisons', () => {
    expect(scoreAnswer(true, 0)).toBe(150);
    expect(scoreAnswer(true, 500)).toBe(148);
    expect(scoreAnswer(true, 1_000)).toBe(145);
    expect(scoreAnswer(true, 3_000)).toBe(135);
    expect(scoreAnswer(true, 10_000)).toBe(100);
  });

  it('summarizes a completed session', () => {
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(1));
    const answers: AnswerRecord[] = problems.map((problem, index) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: index === 0 ? -1 : problem.correctAnswer,
      correctAnswer: problem.correctAnswer,
      correct: index !== 0,
      responseMs: 1_000,
    }));
    const clock = new FakeClock(Date.parse('2026-01-02T12:00:00Z'));
    const summary = summarizeSession(problems, answers, DEFAULT_SETTINGS, 1, clock);
    expect(summary.correctCount).toBe(9);
    expect(summary.accuracy).toBe(0.9);
    expect(summary.elapsedMs).toBe(10_000);
    expect(summary.coinsEarned).toBe(11);
    expect(summary.rulesetVersion).toBe(RULESET_VERSION);
    expect(summary.rulesetVersion).toBe(3);
    expect(summary.id).toContain(String(clock.now()));
  });

  it('adds a perfect-session coin bonus and rejects incomplete answers', () => {
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(2));
    const answers = problems.map((problem) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: problem.correctAnswer,
      correctAnswer: problem.correctAnswer,
      correct: true,
      responseMs: 500,
    }));
    expect(
      summarizeSession(problems, answers, DEFAULT_SETTINGS, 2, new FakeClock(1)).coinsEarned,
    ).toBe(15);
    expect(() =>
      summarizeSession(problems, answers.slice(1), DEFAULT_SETTINGS, 2, new FakeClock(1)),
    ).toThrow(/one answer per problem/);
  });

  it('does not award coins for unanswered guessing', () => {
    const problems = generateSession(DEFAULT_SETTINGS, new SeededRandom(9));
    const answers = problems.map((problem) => ({
      problemId: problem.id,
      skillKey: problem.skillKey,
      operation: problem.operation,
      left: problem.left,
      right: problem.right,
      choices: problem.choices,
      correctChoiceIndex: problem.correctChoiceIndex,
      selectedAnswer: Number.NaN,
      correctAnswer: problem.correctAnswer,
      correct: false,
      responseMs: 10,
    }));
    expect(
      summarizeSession(problems, answers, DEFAULT_SETTINGS, 9, new FakeClock(1)).coinsEarned,
    ).toBe(0);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { FakeClock, SystemClock } from './clock';
import { createRandomSeed, SeededRandom } from './random';

describe('SeededRandom', () => {
  it('replays the same sequence from the same seed', () => {
    const first = new SeededRandom(42);
    const second = new SeededRandom(42);
    expect(Array.from({ length: 20 }, () => first.next())).toEqual(
      Array.from({ length: 20 }, () => second.next()),
    );
  });

  it('generates inclusive bounded integers and deterministic shuffles', () => {
    const random = new SeededRandom(7);
    const values = Array.from({ length: 100 }, () => random.integer(2, 4));
    expect(values.every((value) => value >= 2 && value <= 4)).toBe(true);
    expect(new SeededRandom(9).shuffle([1, 2, 3, 4])).toEqual(
      new SeededRandom(9).shuffle([1, 2, 3, 4]),
    );
  });

  it('rejects invalid integer bounds', () => {
    const random = new SeededRandom(1);
    expect(() => random.integer(1.2, 4)).toThrow(/integers/);
    expect(() => random.integer(5, 4)).toThrow(/maximum/);
  });

  it('creates a seed from browser crypto', () => {
    const getRandomValues = vi.fn((values: Uint32Array) => {
      values[0] = 123;
      return values;
    });
    vi.stubGlobal('crypto', { getRandomValues });
    expect(createRandomSeed()).toBe(123);
    vi.unstubAllGlobals();
  });
});

describe('clocks', () => {
  it('advances fake time deterministically', () => {
    const clock = new FakeClock(Date.UTC(2026, 0, 2, 12));
    expect(clock.today()).toBe('2026-01-02');
    clock.advance(86_400_000);
    expect(clock.today()).toBe('2026-01-03');
  });

  it('returns the system date through its public contract', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'));
    const clock = new SystemClock();
    expect(clock.now()).toBe(Date.parse('2026-04-05T12:00:00Z'));
    expect(clock.today()).toBe('2026-04-05');
    vi.useRealTimers();
  });
});

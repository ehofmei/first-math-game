import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { SeededRandom, type RandomSource } from '../domain/random';
import {
  getEligibleDialoguePhrases,
  rememberDialoguePhrase,
  selectCompanionDialogue,
} from './engine';
import { DIALOGUE_PHRASES } from './phrases';
import { COMPANION_PERSONALITIES } from './personalities';
import { DIALOGUE_CONTEXTS, type DialoguePhrase, type DialogueRequest } from './types';

const resultFacts = {
  accuracy: 0.8,
  perfect: false,
  firstRound: false,
  personalBest: false,
  accuracyImproved: false,
  paceImproved: false,
  completedQuestions: 10,
  operationLabels: ['addition'],
} as const;

function request(overrides: Partial<DialogueRequest> = {}, seed = 42): DialogueRequest {
  return {
    companionId: 'cozy-cats:sunny',
    companionName: 'Sunny',
    context: 'home',
    recentPhraseIds: [],
    random: new SeededRandom(seed),
    ...overrides,
  };
}

function fixedRandom(value: number): RandomSource {
  return {
    next: () => value,
    integer: () => 0,
    pick: <T>(values: readonly T[]) => values[0] as T,
    shuffle: <T>(values: readonly T[]) => [...values],
  };
}

describe('companion dialogue engine', () => {
  it('is deterministic for an identical seed and request', () => {
    const first = selectCompanionDialogue(request({}, 17));
    const second = selectCompanionDialogue(request({}, 17));

    expect(first).toEqual(second);
  });

  it('avoids recent phrases when an alternative exists and falls back when all are recent', () => {
    const phrases = [
      { id: 'first', context: 'home', text: 'First.' },
      { id: 'second', context: 'home', text: 'Second.' },
    ] as const satisfies readonly DialoguePhrase[];

    expect(selectCompanionDialogue(request({ recentPhraseIds: ['first'] }), phrases).id).toBe(
      'second',
    );
    expect(
      ['first', 'second'].includes(
        selectCompanionDialogue(request({ recentPhraseIds: ['first', 'second'] }), phrases).id,
      ),
    ).toBe(true);
  });

  it('maintains a unique bounded recent queue', () => {
    expect(rememberDialoguePhrase(['a', 'b', 'c'], 'b', 3)).toEqual(['a', 'c', 'b']);
    expect(rememberDialoguePhrase(['a', 'b', 'c'], 'd', 3)).toEqual(['b', 'c', 'd']);
    expect(rememberDialoguePhrase(['a'], 'b', 0)).toEqual([]);
  });

  it('uses the documented result priority and truthful conditions', () => {
    const phrases = [
      { id: 'generic', context: 'results', text: 'Practice complete.' },
      {
        id: 'pace',
        context: 'results',
        text: 'Faster.',
        condition: { paceImproved: true },
      },
      {
        id: 'accuracy',
        context: 'results',
        text: 'More accurate.',
        condition: { accuracyImproved: true },
      },
      {
        id: 'best',
        context: 'results',
        text: 'Best.',
        condition: { personalBest: true },
      },
      {
        id: 'perfect',
        context: 'results',
        text: 'Perfect.',
        condition: { perfect: true },
      },
      {
        id: 'first-round',
        context: 'results',
        text: 'First.',
        condition: { firstRound: true },
      },
    ] as const satisfies readonly DialoguePhrase[];
    const facts = {
      ...resultFacts,
      perfect: true,
      firstRound: true,
      personalBest: true,
      accuracyImproved: true,
      paceImproved: true,
    };

    expect(
      selectCompanionDialogue(request({ context: 'results', facts: { result: facts } }), phrases)
        .id,
    ).toBe('first-round');
    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: { result: { ...facts, firstRound: false } },
        }),
        phrases,
      ).id,
    ).toBe('perfect');
    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: { result: { ...facts, firstRound: false, perfect: false } },
        }),
        phrases,
      ).id,
    ).toBe('best');
    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: {
            result: { ...facts, firstRound: false, perfect: false, personalBest: false },
          },
        }),
        phrases,
      ).id,
    ).toBe('accuracy');
    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: {
            result: {
              ...facts,
              firstRound: false,
              perfect: false,
              personalBest: false,
              accuracyImproved: false,
            },
          },
        }),
        phrases,
      ).id,
    ).toBe('pace');
  });

  it('lets a fresh generic line beat repeating the only recent achievement line', () => {
    const phrases = [
      { id: 'generic', context: 'results', text: 'Practice complete.' },
      {
        id: 'perfect',
        context: 'results',
        text: 'Perfect.',
        condition: { perfect: true },
      },
    ] as const satisfies readonly DialoguePhrase[];

    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: { result: { ...resultFacts, accuracy: 1, perfect: true } },
          recentPhraseIds: ['perfect'],
        }),
        phrases,
      ).id,
    ).toBe('generic');
  });

  it('matches signature and both voice profiles without leaking signature lines', () => {
    const sunny = getEligibleDialoguePhrases(request({ context: 'home' }));
    const cloud = getEligibleDialoguePhrases(
      request({ companionId: 'cozy-cats:cloud', companionName: 'Cloud', context: 'home' }),
    );

    expect(sunny.some(({ id }) => id === 'sunny-home-01')).toBe(true);
    expect(sunny.some(({ id }) => id === 'cloud-home-01')).toBe(false);
    expect(sunny.some(({ voices }) => voices?.includes('warm'))).toBe(true);
    expect(sunny.some(({ voices }) => voices?.includes('playful'))).toBe(true);
    expect(cloud.some(({ voices }) => voices?.includes('dreamy'))).toBe(true);
    expect(cloud.some(({ voices }) => voices?.includes('warm'))).toBe(true);
  });

  it('uses a global fallback for an unknown companion', () => {
    const eligible = getEligibleDialoguePhrases(
      request({ companionId: 'future:friendly-fox', companionName: 'Fox' }),
    );
    const selected = selectCompanionDialogue(
      request({ companionId: 'future:friendly-fox', companionName: 'Fox' }),
    );

    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.every(({ voices, companionIds }) => !voices && !companionIds)).toBe(true);
    expect(selected.source).toBe('global');
  });

  it('resolves supported tokens and excludes phrases with missing facts', () => {
    const phrases = [
      {
        id: 'tokens',
        context: 'results',
        text: '{companion} practiced {operation} with {accuracy} accuracy.',
      },
      { id: 'fallback', context: 'results', text: 'Round complete.' },
    ] as const satisfies readonly DialoguePhrase[];

    expect(
      getEligibleDialoguePhrases(request({ context: 'results' }), phrases).map(({ id }) => id),
    ).toEqual(['fallback']);
    expect(
      selectCompanionDialogue(
        request({
          context: 'results',
          facts: { operationLabel: 'addition', result: resultFacts },
        }),
        [phrases[0]],
      ).text,
    ).toBe('Sunny practiced addition with 80% accuracy.');
  });

  it('uses a single result operation as a token and rejects an empty companion token', () => {
    const operationPhrase = [
      { id: 'operation', context: 'results', text: 'You practiced {operation}.' },
    ] as const satisfies readonly DialoguePhrase[];
    const companionPhrase = [
      { id: 'companion', context: 'home', text: '{companion} is ready.' },
    ] as const satisfies readonly DialoguePhrase[];

    expect(
      selectCompanionDialogue(
        request({ context: 'results', facts: { result: resultFacts } }),
        operationPhrase,
      ).text,
    ).toBe('You practiced addition.');
    expect(() =>
      selectCompanionDialogue(request({ companionName: '  ' }), companionPhrase),
    ).toThrow('No eligible home dialogue phrase');
  });

  it('honors positive weights with an injected random source', () => {
    const phrases = [
      { id: 'light', context: 'home', text: 'Light.', weight: 1 },
      { id: 'heavy', context: 'home', text: 'Heavy.', weight: 3 },
    ] as const satisfies readonly DialoguePhrase[];

    expect(selectCompanionDialogue(request({ random: fixedRandom(0) }), phrases).id).toBe('light');
    expect(selectCompanionDialogue(request({ random: fixedRandom(0.99) }), phrases).id).toBe(
      'heavy',
    );
  });

  it('selects a valid immutable result for generated seeds and contexts', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.constantFrom(...DIALOGUE_CONTEXTS),
        fc.constantFrom(...COMPANION_PERSONALITIES),
        (seed, context, personality) => {
          const recentPhraseIds = ['unchanged'];
          const originalPhrases = [...DIALOGUE_PHRASES];
          const selected = selectCompanionDialogue(
            request({
              companionId: personality.companionId,
              companionName: 'Companion',
              context,
              facts: {
                operationLabel: 'addition',
                result: {
                  ...resultFacts,
                  accuracy: 1,
                  perfect: true,
                  firstRound: true,
                  personalBest: true,
                  accuracyImproved: true,
                  paceImproved: true,
                },
              },
              recentPhraseIds,
              random: new SeededRandom(seed),
            }),
          );

          expect(selected.context).toBe(context);
          expect(selected.text).not.toMatch(/\{[^}]+\}/);
          expect(recentPhraseIds).toEqual(['unchanged']);
          expect(DIALOGUE_PHRASES).toEqual(originalPhrases);
        },
      ),
    );
  });
});

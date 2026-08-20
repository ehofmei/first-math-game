import { describe, expect, it } from 'vitest';
import { catalog } from '../content/catalog';
import { DIALOGUE_PHRASES } from './phrases';
import { COMPANION_PERSONALITIES } from './personalities';
import type { CompanionPersonality, DialoguePhrase } from './types';
import { validateCompanionContent } from './validation';

const collectibleIds = catalog.collectibles.map(({ id }) => id);

describe('companion content validation', () => {
  it('accepts the complete production registry and phrase bank', () => {
    expect(validateCompanionContent(collectibleIds)).toEqual([]);
    expect(COMPANION_PERSONALITIES).toHaveLength(11);
    expect(DIALOGUE_PHRASES).toHaveLength(128);
  });

  it('reports invalid and incomplete personality metadata', () => {
    const personalities = [
      {
        companionId: 'known',
        primaryVoice: 'not-a-voice',
        secondaryVoice: 'also-not-a-voice',
        motion: 'not-a-motion',
        motif: 'not-a-motif',
      },
      {
        companionId: 'known',
        primaryVoice: 'warm',
        motion: 'calm-float',
        motif: 'sun',
      },
      {
        companionId: 'unknown',
        primaryVoice: 'warm',
        motion: 'calm-float',
        motif: 'sun',
      },
    ] as unknown as readonly CompanionPersonality[];
    const issues = validateCompanionContent(['known', 'missing'], personalities, []);

    expect(issues).toEqual(
      expect.arrayContaining([
        'Unknown primary voice for known.',
        'Unknown secondary voice for known.',
        'Unknown motion profile for known.',
        'Unknown motif for known.',
        'Duplicate companion personality: known.',
        'Personality references unknown collectible: unknown.',
        'Missing companion personality: missing.',
      ]),
    );
  });

  it('reports malformed phrase metadata and templates', () => {
    const phrases = [
      {
        id: 'Bad ID',
        context: 'unknown',
        text: `${'x'.repeat(97)} {mystery}`,
        voices: ['not-a-voice'],
        companionIds: ['ghost'],
        condition: { minimumAccuracy: 2 },
        weight: 0,
      },
      { id: 'Bad ID', context: 'home', text: 'Duplicate.' },
      { id: 'home-bad-accuracy', context: 'home', text: '{accuracy}' },
      { id: 'capsule-bad-operation', context: 'capsule', text: '{operation}' },
    ] as unknown as readonly DialoguePhrase[];
    const issues = validateCompanionContent([], [], phrases);

    expect(issues).toEqual(
      expect.arrayContaining([
        'Invalid dialogue phrase ID: Bad ID.',
        'Unknown dialogue context on Bad ID.',
        'Dialogue phrase Bad ID exceeds 96 characters.',
        'Dialogue phrase Bad ID has an invalid weight.',
        'Dialogue phrase Bad ID cannot target voices and companions together.',
        'Dialogue phrase Bad ID has unknown voice.',
        'Dialogue phrase Bad ID references unknown companion ghost.',
        'Only results dialogue may declare conditions: Bad ID.',
        'Dialogue phrase Bad ID has invalid minimum accuracy.',
        'Dialogue phrase Bad ID uses unsupported token {mystery}.',
        'Duplicate dialogue phrase ID: Bad ID.',
        'Dialogue phrase home-bad-accuracy cannot resolve {accuracy} in home.',
        'Dialogue phrase capsule-bad-operation cannot resolve {operation} in capsule.',
      ]),
    );
  });

  it('requires enough shared content, a fallback, and signature lines', () => {
    const personality = {
      companionId: 'known',
      primaryVoice: 'warm',
      motion: 'calm-float',
      motif: 'sun',
    } as const satisfies CompanionPersonality;
    const voiceOnlyPhrase = {
      id: 'home-voice-only',
      context: 'home',
      text: 'Hello.',
      voices: ['warm'],
    } as const satisfies DialoguePhrase;
    const issues = validateCompanionContent(['known'], [personality], [voiceOnlyPhrase]);

    expect(issues).toEqual(
      expect.arrayContaining([
        'Expected at least 15 shared home phrases; found 1.',
        'Dialogue context home has no global fallback phrase.',
        'Expected at least 3 signature phrases for known; found 0.',
      ]),
    );
  });
});

import { DIALOGUE_PHRASES } from './phrases.ts';
import { COMPANION_PERSONALITIES } from './personalities.ts';
import {
  COMPANION_MOTIFS,
  DIALOGUE_CONTEXTS,
  MOTION_PROFILES,
  VOICE_IDS,
  type CompanionPersonality,
  type DialogueContext,
  type DialoguePhrase,
} from './types.ts';

const MINIMUM_SHARED_PHRASES: Readonly<Record<DialogueContext, number>> = {
  home: 15,
  setup: 12,
  results: 40,
  capsule: 10,
  equip: 8,
  progress: 10,
};
const APPROVED_TOKENS = new Set(['companion', 'operation', 'accuracy']);
const PHRASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_PHRASE_LENGTH = 96;
const REQUIRED_SIGNATURE_LINES = 3;

export function validateCompanionContent(
  collectibleIds: readonly string[],
  personalities: readonly CompanionPersonality[] = COMPANION_PERSONALITIES,
  phrases: readonly DialoguePhrase[] = DIALOGUE_PHRASES,
): string[] {
  const issues: string[] = [];
  const collectibleIdSet = new Set(collectibleIds);
  const personalityIds = new Set<string>();

  for (const personality of personalities) {
    if (personalityIds.has(personality.companionId)) {
      issues.push(`Duplicate companion personality: ${personality.companionId}.`);
    }
    personalityIds.add(personality.companionId);
    if (!collectibleIdSet.has(personality.companionId)) {
      issues.push(`Personality references unknown collectible: ${personality.companionId}.`);
    }
    if (!VOICE_IDS.includes(personality.primaryVoice)) {
      issues.push(`Unknown primary voice for ${personality.companionId}.`);
    }
    if (personality.secondaryVoice && !VOICE_IDS.includes(personality.secondaryVoice)) {
      issues.push(`Unknown secondary voice for ${personality.companionId}.`);
    }
    if (!MOTION_PROFILES.includes(personality.motion)) {
      issues.push(`Unknown motion profile for ${personality.companionId}.`);
    }
    if (!COMPANION_MOTIFS.includes(personality.motif)) {
      issues.push(`Unknown motif for ${personality.companionId}.`);
    }
  }

  for (const collectibleId of collectibleIds) {
    if (!personalityIds.has(collectibleId)) {
      issues.push(`Missing companion personality: ${collectibleId}.`);
    }
  }

  const phraseIds = new Set<string>();
  for (const phrase of phrases) {
    if (phraseIds.has(phrase.id)) issues.push(`Duplicate dialogue phrase ID: ${phrase.id}.`);
    phraseIds.add(phrase.id);
    if (!PHRASE_ID_PATTERN.test(phrase.id))
      issues.push(`Invalid dialogue phrase ID: ${phrase.id}.`);
    if (!DIALOGUE_CONTEXTS.includes(phrase.context)) {
      issues.push(`Unknown dialogue context on ${phrase.id}.`);
    }
    if (phrase.text.length > MAX_PHRASE_LENGTH) {
      issues.push(`Dialogue phrase ${phrase.id} exceeds ${MAX_PHRASE_LENGTH} characters.`);
    }
    if (phrase.weight !== undefined && (!Number.isFinite(phrase.weight) || phrase.weight <= 0)) {
      issues.push(`Dialogue phrase ${phrase.id} has an invalid weight.`);
    }
    if (phrase.voices && phrase.companionIds) {
      issues.push(`Dialogue phrase ${phrase.id} cannot target voices and companions together.`);
    }
    for (const voice of phrase.voices ?? []) {
      if (!VOICE_IDS.includes(voice))
        issues.push(`Dialogue phrase ${phrase.id} has unknown voice.`);
    }
    for (const companionId of phrase.companionIds ?? []) {
      if (!collectibleIdSet.has(companionId)) {
        issues.push(`Dialogue phrase ${phrase.id} references unknown companion ${companionId}.`);
      }
    }
    if (phrase.condition && phrase.context !== 'results') {
      issues.push(`Only results dialogue may declare conditions: ${phrase.id}.`);
    }
    const minimumAccuracy = phrase.condition?.minimumAccuracy;
    if (minimumAccuracy !== undefined && (minimumAccuracy < 0 || minimumAccuracy > 1)) {
      issues.push(`Dialogue phrase ${phrase.id} has invalid minimum accuracy.`);
    }
    for (const match of phrase.text.matchAll(/\{([^}]+)\}/g)) {
      const token = match[1] ?? '';
      if (!APPROVED_TOKENS.has(token)) {
        issues.push(`Dialogue phrase ${phrase.id} uses unsupported token {${token}}.`);
      } else if (token === 'accuracy' && phrase.context !== 'results') {
        issues.push(`Dialogue phrase ${phrase.id} cannot resolve {accuracy} in ${phrase.context}.`);
      } else if (
        token === 'operation' &&
        phrase.context !== 'setup' &&
        phrase.context !== 'results'
      ) {
        issues.push(
          `Dialogue phrase ${phrase.id} cannot resolve {operation} in ${phrase.context}.`,
        );
      }
    }
  }

  for (const context of DIALOGUE_CONTEXTS) {
    const shared = phrases.filter((phrase) => phrase.context === context && !phrase.companionIds);
    if (shared.length < MINIMUM_SHARED_PHRASES[context]) {
      issues.push(
        `Expected at least ${MINIMUM_SHARED_PHRASES[context]} shared ${context} phrases; found ${shared.length}.`,
      );
    }
    const hasFallback = shared.some(
      (phrase) => !phrase.voices && !phrase.condition && !phrase.text.includes('{operation}'),
    );
    if (!hasFallback) issues.push(`Dialogue context ${context} has no global fallback phrase.`);
  }

  for (const collectibleId of collectibleIds) {
    const signatureCount = phrases.filter((phrase) =>
      phrase.companionIds?.includes(collectibleId),
    ).length;
    if (signatureCount < REQUIRED_SIGNATURE_LINES) {
      issues.push(
        `Expected at least ${REQUIRED_SIGNATURE_LINES} signature phrases for ${collectibleId}; found ${signatureCount}.`,
      );
    }
  }

  return issues;
}

import { DIALOGUE_PHRASES } from './phrases.ts';
import { getCompanionPersonality } from './personalities.ts';
import type {
  CompanionPersonality,
  DialogueCondition,
  DialoguePhrase,
  DialogueRequest,
  DialogueSource,
  ResultDialogueFacts,
  SelectedDialogue,
} from './types.ts';

export const DIALOGUE_TOKEN_PATTERN = /\{([a-z]+)\}/g;
export const DIALOGUE_TOKENS = ['companion', 'operation', 'accuracy'] as const;
export const RECENT_DIALOGUE_LIMIT = 8;

function matchesCondition(
  condition: DialogueCondition | undefined,
  result: ResultDialogueFacts | undefined,
): boolean {
  if (!condition) return true;
  if (!result) return false;
  if (condition.perfect !== undefined && result.perfect !== condition.perfect) return false;
  if (condition.firstRound !== undefined && result.firstRound !== condition.firstRound)
    return false;
  if (condition.personalBest !== undefined && result.personalBest !== condition.personalBest)
    return false;
  if (
    condition.accuracyImproved !== undefined &&
    result.accuracyImproved !== condition.accuracyImproved
  )
    return false;
  if (condition.paceImproved !== undefined && result.paceImproved !== condition.paceImproved)
    return false;
  if (condition.minimumAccuracy !== undefined && result.accuracy < condition.minimumAccuracy)
    return false;
  return true;
}

function matchesAudience(
  phrase: DialoguePhrase,
  companionId: string,
  personality: CompanionPersonality | undefined,
): boolean {
  if (phrase.companionIds) return phrase.companionIds.includes(companionId);
  if (!phrase.voices) return true;
  if (!personality) return false;
  return phrase.voices.some(
    (voice) => voice === personality.primaryVoice || voice === personality.secondaryVoice,
  );
}

function operationToken(request: DialogueRequest): string | undefined {
  if (request.facts?.operationLabel) return request.facts.operationLabel;
  const operations = request.facts?.result?.operationLabels;
  return operations?.length === 1 ? operations[0] : undefined;
}

function canResolveTokens(phrase: DialoguePhrase, request: DialogueRequest): boolean {
  const tokens = [...phrase.text.matchAll(DIALOGUE_TOKEN_PATTERN)].map((match) => match[1]);
  return tokens.every((token) => {
    switch (token) {
      case 'companion':
        return request.companionName.trim().length > 0;
      case 'operation':
        return Boolean(operationToken(request));
      case 'accuracy':
        return request.facts?.result !== undefined;
      default:
        return false;
    }
  });
}

function conditionPriority(condition: DialogueCondition | undefined): number {
  if (!condition) return 0;
  if (condition.firstRound === true) return 600;
  if (condition.perfect === true) return 500;
  if (condition.personalBest === true) return 400;
  if (condition.accuracyImproved === true) return 300;
  if (condition.paceImproved === true) return 200;
  if (condition.minimumAccuracy !== undefined) return 100;
  return 0;
}

function phraseSource(phrase: DialoguePhrase): DialogueSource {
  if (phrase.companionIds) return 'signature';
  if (phrase.voices) return 'voice';
  return 'global';
}

function renderPhrase(phrase: DialoguePhrase, request: DialogueRequest): string {
  return phrase.text.replace(DIALOGUE_TOKEN_PATTERN, (_, token: string) => {
    switch (token) {
      case 'companion':
        return request.companionName;
      case 'operation':
        return operationToken(request) ?? '';
      case 'accuracy':
        return `${Math.round((request.facts?.result?.accuracy ?? 0) * 100)}%`;
      default:
        throw new Error(`Unsupported dialogue token: ${token}`);
    }
  });
}

function weightedPick(
  phrases: readonly DialoguePhrase[],
  request: DialogueRequest,
): DialoguePhrase {
  const total = phrases.reduce((sum, phrase) => sum + (phrase.weight ?? 1), 0);
  let cursor = request.random.next() * total;
  for (const phrase of phrases) {
    cursor -= phrase.weight ?? 1;
    if (cursor < 0) return phrase;
  }
  return phrases[phrases.length - 1]!;
}

export function getEligibleDialoguePhrases(
  request: DialogueRequest,
  phrases: readonly DialoguePhrase[] = DIALOGUE_PHRASES,
): DialoguePhrase[] {
  const personality = getCompanionPersonality(request.companionId);
  return phrases.filter(
    (phrase) =>
      phrase.context === request.context &&
      matchesAudience(phrase, request.companionId, personality) &&
      matchesCondition(phrase.condition, request.facts?.result) &&
      canResolveTokens(phrase, request),
  );
}

export function selectCompanionDialogue(
  request: DialogueRequest,
  phrases: readonly DialoguePhrase[] = DIALOGUE_PHRASES,
): SelectedDialogue {
  const eligible = getEligibleDialoguePhrases(request, phrases);
  if (eligible.length === 0) {
    throw new Error(`No eligible ${request.context} dialogue phrase is available.`);
  }

  const recent = new Set(request.recentPhraseIds);
  const fresh = eligible.filter(({ id }) => !recent.has(id));
  const repetitionPool = fresh.length > 0 ? fresh : eligible;
  const highestPriority = Math.max(
    ...repetitionPool.map(({ condition }) => conditionPriority(condition)),
  );
  const prioritized = repetitionPool.filter(
    ({ condition }) => conditionPriority(condition) === highestPriority,
  );
  const selected = weightedPick(prioritized, request);

  return {
    id: selected.id,
    text: renderPhrase(selected, request),
    context: selected.context,
    source: phraseSource(selected),
  };
}

export function rememberDialoguePhrase(
  recentPhraseIds: readonly string[],
  phraseId: string,
  limit = RECENT_DIALOGUE_LIMIT,
): string[] {
  if (limit <= 0) return [];
  return [...recentPhraseIds.filter((id) => id !== phraseId), phraseId].slice(-limit);
}

import type { CompanionPersonality } from './types.ts';

export const COMPANION_PERSONALITIES = [
  {
    companionId: 'cozy-cats:sunny',
    primaryVoice: 'warm',
    secondaryVoice: 'playful',
    motion: 'buoyant-bob',
    motif: 'sun',
  },
  {
    companionId: 'cozy-cats:cloud',
    primaryVoice: 'dreamy',
    secondaryVoice: 'warm',
    motion: 'calm-float',
    motif: 'cloud',
  },
  {
    companionId: 'cozy-cats:biscuit',
    primaryVoice: 'playful',
    secondaryVoice: 'warm',
    motion: 'buoyant-bob',
    motif: 'biscuit',
  },
  {
    companionId: 'cozy-cats:juniper',
    primaryVoice: 'thoughtful',
    secondaryVoice: 'warm',
    motion: 'calm-float',
    motif: 'leaf',
  },
  {
    companionId: 'cozy-cats:moonbeam',
    primaryVoice: 'dreamy',
    secondaryVoice: 'thoughtful',
    motion: 'cosmic-drift',
    motif: 'moon',
  },
  {
    companionId: 'cozy-cats:patches',
    primaryVoice: 'playful',
    secondaryVoice: 'inventive',
    motion: 'curious-tilt',
    motif: 'paint',
  },
  {
    companionId: 'cozy-cats:gizmo',
    primaryVoice: 'inventive',
    secondaryVoice: 'thoughtful',
    motion: 'curious-tilt',
    motif: 'gear',
  },
  {
    companionId: 'cozy-cats:pepper',
    primaryVoice: 'adventurous',
    secondaryVoice: 'playful',
    motion: 'brave-lean',
    motif: 'trail',
  },
  {
    companionId: 'cozy-cats:aurora',
    primaryVoice: 'dreamy',
    secondaryVoice: 'adventurous',
    motion: 'cosmic-drift',
    motif: 'aurora',
  },
  {
    companionId: 'cozy-cats:comet',
    primaryVoice: 'adventurous',
    secondaryVoice: 'inventive',
    motion: 'cosmic-drift',
    motif: 'comet',
  },
  {
    companionId: 'special-guests:button-bunny',
    primaryVoice: 'plush',
    secondaryVoice: 'warm',
    motion: 'plush-sway',
    motif: 'stitch',
  },
] as const satisfies readonly CompanionPersonality[];

const personalityById = new Map<string, CompanionPersonality>(
  COMPANION_PERSONALITIES.map((personality) => [personality.companionId, personality]),
);

export function getCompanionPersonality(companionId: string): CompanionPersonality | undefined {
  return personalityById.get(companionId);
}

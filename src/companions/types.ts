import type { RandomSource } from '../domain/random.ts';

export const DIALOGUE_CONTEXTS = [
  'home',
  'setup',
  'results',
  'capsule',
  'equip',
  'progress',
] as const;
export type DialogueContext = (typeof DIALOGUE_CONTEXTS)[number];

export const VOICE_IDS = [
  'warm',
  'playful',
  'dreamy',
  'thoughtful',
  'adventurous',
  'inventive',
  'plush',
] as const;
export type VoiceId = (typeof VOICE_IDS)[number];

export const MOTION_PROFILES = [
  'calm-float',
  'buoyant-bob',
  'curious-tilt',
  'brave-lean',
  'cosmic-drift',
  'plush-sway',
] as const;
export type MotionProfile = (typeof MOTION_PROFILES)[number];

export const COMPANION_MOTIFS = [
  'sun',
  'cloud',
  'biscuit',
  'leaf',
  'moon',
  'paint',
  'gear',
  'trail',
  'aurora',
  'comet',
  'stitch',
] as const;
export type CompanionMotif = (typeof COMPANION_MOTIFS)[number];

export interface ResultDialogueFacts {
  accuracy: number;
  perfect: boolean;
  firstRound: boolean;
  personalBest: boolean;
  accuracyImproved: boolean;
  paceImproved: boolean;
  completedQuestions: number;
  operationLabels: readonly string[];
}

export interface DialogueFacts {
  operationLabel?: string;
  result?: ResultDialogueFacts;
}

export interface DialogueCondition {
  perfect?: boolean;
  firstRound?: boolean;
  personalBest?: boolean;
  accuracyImproved?: boolean;
  paceImproved?: boolean;
  minimumAccuracy?: number;
}

export interface DialoguePhrase {
  id: string;
  context: DialogueContext;
  text: string;
  voices?: readonly VoiceId[];
  companionIds?: readonly string[];
  condition?: DialogueCondition;
  weight?: number;
}

export interface CompanionPersonality {
  companionId: string;
  primaryVoice: VoiceId;
  secondaryVoice?: VoiceId;
  motion: MotionProfile;
  motif: CompanionMotif;
}

export interface DialogueRequest {
  companionId: string;
  companionName: string;
  context: DialogueContext;
  facts?: DialogueFacts;
  recentPhraseIds: readonly string[];
  random: RandomSource;
}

export type DialogueSource = 'global' | 'voice' | 'signature';

export interface SelectedDialogue {
  id: string;
  text: string;
  context: DialogueContext;
  source: DialogueSource;
}

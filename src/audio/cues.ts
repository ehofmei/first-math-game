export const AUDIO_CUE_IDS = [
  'correct-chime',
  'correct-bubble',
  'correct-nook',
  'correct-triumph',
  'correct-spark',
  'incorrect-soft',
  'incorrect-tap',
  'round-complete',
  'paw-coin',
  'coin-drop',
  'coin-jingle',
  'capsule-reveal',
  'capsule-anticipation',
  'capsule-starlight',
  'companion-pop',
] as const;

export type AudioCueId = (typeof AUDIO_CUE_IDS)[number];
export type AudioCueCategory = 'Answer feedback' | 'Progress and rewards';

export const GAME_AUDIO_CUES = {
  roundStart: 'correct-bubble',
  correctAnswer: 'correct-nook',
  incorrectAnswer: 'incorrect-soft',
  unavailableAction: 'incorrect-tap',
  roundComplete: 'round-complete',
  coinsEarned: 'coin-jingle',
  capsuleReveal: 'capsule-anticipation',
  starterSelected: 'companion-pop',
  companionEquipped: 'companion-pop',
} as const satisfies Record<string, AudioCueId>;

export interface ToneSpec {
  wave: OscillatorType;
  frequency: number;
  endFrequency?: number;
  startSeconds: number;
  durationSeconds: number;
  gain: number;
  attackSeconds?: number;
}

export interface NoiseSpec {
  startSeconds: number;
  durationSeconds: number;
  gain: number;
  filterFrequency: number;
  filterType: BiquadFilterType;
}

export interface AudioCueDefinition {
  id: AudioCueId;
  label: string;
  description: string;
  category: AudioCueCategory;
  tones: readonly ToneSpec[];
  noise?: NoiseSpec;
  stereoPan?: number;
}

export const AUDIO_CUES: readonly AudioCueDefinition[] = [
  {
    id: 'correct-chime',
    label: 'Bright chime',
    description: 'A quick two-note sine-wave answer confirmation.',
    category: 'Answer feedback',
    tones: [
      { wave: 'sine', frequency: 880, startSeconds: 0, durationSeconds: 0.11, gain: 0.24 },
      { wave: 'sine', frequency: 1_174.66, startSeconds: 0.065, durationSeconds: 0.14, gain: 0.2 },
    ],
  },
  {
    id: 'correct-bubble',
    label: 'Bubble pop',
    description: 'A playful pitch glide used when a player launches a new round.',
    category: 'Answer feedback',
    tones: [
      {
        wave: 'sine',
        frequency: 420,
        endFrequency: 980,
        startSeconds: 0,
        durationSeconds: 0.17,
        gain: 0.24,
      },
      {
        wave: 'triangle',
        frequency: 1_240,
        startSeconds: 0.12,
        durationSeconds: 0.08,
        gain: 0.08,
      },
    ],
  },
  {
    id: 'correct-nook',
    label: 'Nook correct',
    description: 'The opening C-major interval from Round complete, shortened for each answer.',
    category: 'Answer feedback',
    tones: [
      { wave: 'triangle', frequency: 523.25, startSeconds: 0, durationSeconds: 0.16, gain: 0.18 },
      {
        wave: 'triangle',
        frequency: 659.25,
        startSeconds: 0.065,
        durationSeconds: 0.18,
        gain: 0.18,
      },
    ],
  },
  {
    id: 'correct-triumph',
    label: 'Tiny triumph',
    description: 'A compact E–G–C answer flourish drawn from the round-completion harmony.',
    category: 'Answer feedback',
    tones: [
      { wave: 'triangle', frequency: 659.25, startSeconds: 0, durationSeconds: 0.14, gain: 0.14 },
      {
        wave: 'triangle',
        frequency: 783.99,
        startSeconds: 0.055,
        durationSeconds: 0.15,
        gain: 0.15,
      },
      {
        wave: 'sine',
        frequency: 1_046.5,
        startSeconds: 0.11,
        durationSeconds: 0.18,
        gain: 0.14,
      },
    ],
  },
  {
    id: 'correct-spark',
    label: 'Correct spark',
    description: 'A confident G-to-C rise with a quiet high shimmer at the end.',
    category: 'Answer feedback',
    tones: [
      { wave: 'triangle', frequency: 783.99, startSeconds: 0, durationSeconds: 0.15, gain: 0.17 },
      {
        wave: 'sine',
        frequency: 1_046.5,
        startSeconds: 0.065,
        durationSeconds: 0.19,
        gain: 0.16,
      },
      {
        wave: 'sine',
        frequency: 2_093,
        startSeconds: 0.14,
        durationSeconds: 0.14,
        gain: 0.055,
      },
    ],
    noise: {
      startSeconds: 0.13,
      durationSeconds: 0.1,
      gain: 0.012,
      filterFrequency: 5_200,
      filterType: 'highpass',
    },
  },
  {
    id: 'incorrect-soft',
    label: 'Gentle answer cue',
    description: 'A low, rounded tone without a harsh buzzer or failure sting.',
    category: 'Answer feedback',
    tones: [
      {
        wave: 'triangle',
        frequency: 330,
        endFrequency: 270,
        startSeconds: 0,
        durationSeconds: 0.2,
        gain: 0.16,
        attackSeconds: 0.018,
      },
    ],
  },
  {
    id: 'incorrect-tap',
    label: 'Wooden tap',
    description: 'A short tap for an understood action that is currently unavailable.',
    category: 'Answer feedback',
    tones: [
      {
        wave: 'sine',
        frequency: 190,
        endFrequency: 150,
        startSeconds: 0,
        durationSeconds: 0.12,
        gain: 0.1,
      },
    ],
    noise: {
      startSeconds: 0,
      durationSeconds: 0.08,
      gain: 0.055,
      filterFrequency: 900,
      filterType: 'lowpass',
    },
  },
  {
    id: 'round-complete',
    label: 'Round complete',
    description: 'A four-note triangle-wave arpeggio with a soft final octave.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'triangle', frequency: 523.25, startSeconds: 0, durationSeconds: 0.2, gain: 0.16 },
      {
        wave: 'triangle',
        frequency: 659.25,
        startSeconds: 0.08,
        durationSeconds: 0.2,
        gain: 0.16,
      },
      {
        wave: 'triangle',
        frequency: 783.99,
        startSeconds: 0.16,
        durationSeconds: 0.22,
        gain: 0.17,
      },
      {
        wave: 'sine',
        frequency: 1_046.5,
        startSeconds: 0.26,
        durationSeconds: 0.34,
        gain: 0.17,
        attackSeconds: 0.025,
      },
    ],
  },
  {
    id: 'paw-coin',
    label: 'Paw Coin sparkle',
    description: 'Two very short high notes with a tiny shimmering noise tail.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'sine', frequency: 1_320, startSeconds: 0, durationSeconds: 0.1, gain: 0.16 },
      { wave: 'sine', frequency: 1_760, startSeconds: 0.07, durationSeconds: 0.13, gain: 0.14 },
    ],
    noise: {
      startSeconds: 0.1,
      durationSeconds: 0.1,
      gain: 0.025,
      filterFrequency: 4_500,
      filterType: 'highpass',
    },
  },
  {
    id: 'coin-drop',
    label: 'Metal Paw Coin',
    description: 'Two bright impacts with inharmonic overtones for a more metallic coin body.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'sine', frequency: 1_240, startSeconds: 0, durationSeconds: 0.22, gain: 0.14 },
      { wave: 'sine', frequency: 1_736, startSeconds: 0, durationSeconds: 0.15, gain: 0.09 },
      { wave: 'sine', frequency: 2_827, startSeconds: 0, durationSeconds: 0.1, gain: 0.05 },
      { wave: 'sine', frequency: 1_360, startSeconds: 0.105, durationSeconds: 0.2, gain: 0.12 },
      { wave: 'sine', frequency: 1_904, startSeconds: 0.105, durationSeconds: 0.13, gain: 0.07 },
    ],
  },
  {
    id: 'coin-jingle',
    label: 'Paw Coin jingle',
    description: 'A small three-coin cascade suited to an animated reward count-up.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'sine', frequency: 1_100, startSeconds: 0, durationSeconds: 0.15, gain: 0.1 },
      { wave: 'sine', frequency: 2_310, startSeconds: 0, durationSeconds: 0.08, gain: 0.045 },
      { wave: 'sine', frequency: 1_320, startSeconds: 0.1, durationSeconds: 0.16, gain: 0.11 },
      { wave: 'sine', frequency: 2_772, startSeconds: 0.1, durationSeconds: 0.08, gain: 0.045 },
      { wave: 'sine', frequency: 1_650, startSeconds: 0.2, durationSeconds: 0.19, gain: 0.12 },
      { wave: 'sine', frequency: 3_465, startSeconds: 0.2, durationSeconds: 0.09, gain: 0.04 },
    ],
  },
  {
    id: 'capsule-reveal',
    label: 'Capsule reveal',
    description: 'A filtered-noise whoosh followed by a layered major chord.',
    category: 'Progress and rewards',
    tones: [
      {
        wave: 'sine',
        frequency: 392,
        endFrequency: 784,
        startSeconds: 0.08,
        durationSeconds: 0.36,
        gain: 0.12,
      },
      { wave: 'triangle', frequency: 523.25, startSeconds: 0.36, durationSeconds: 0.5, gain: 0.13 },
      {
        wave: 'triangle',
        frequency: 659.25,
        startSeconds: 0.38,
        durationSeconds: 0.48,
        gain: 0.12,
      },
      { wave: 'sine', frequency: 783.99, startSeconds: 0.4, durationSeconds: 0.48, gain: 0.12 },
    ],
    noise: {
      startSeconds: 0,
      durationSeconds: 0.4,
      gain: 0.055,
      filterFrequency: 2_800,
      filterType: 'highpass',
    },
  },
  {
    id: 'capsule-anticipation',
    label: 'Capsule anticipation',
    description: 'Three rising latch notes, a longer whoosh, and a full reveal chord with a tail.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'triangle', frequency: 293.66, startSeconds: 0, durationSeconds: 0.12, gain: 0.09 },
      { wave: 'triangle', frequency: 392, startSeconds: 0.14, durationSeconds: 0.12, gain: 0.1 },
      {
        wave: 'triangle',
        frequency: 523.25,
        startSeconds: 0.28,
        durationSeconds: 0.14,
        gain: 0.11,
      },
      {
        wave: 'sine',
        frequency: 330,
        endFrequency: 1_046.5,
        startSeconds: 0.2,
        durationSeconds: 0.65,
        gain: 0.1,
      },
      {
        wave: 'triangle',
        frequency: 523.25,
        startSeconds: 0.76,
        durationSeconds: 0.64,
        gain: 0.13,
      },
      {
        wave: 'triangle',
        frequency: 659.25,
        startSeconds: 0.78,
        durationSeconds: 0.62,
        gain: 0.12,
      },
      { wave: 'sine', frequency: 783.99, startSeconds: 0.8, durationSeconds: 0.62, gain: 0.11 },
      { wave: 'sine', frequency: 1_567.98, startSeconds: 0.92, durationSeconds: 0.42, gain: 0.05 },
    ],
    noise: {
      startSeconds: 0.2,
      durationSeconds: 0.68,
      gain: 0.045,
      filterFrequency: 3_200,
      filterType: 'highpass',
    },
  },
  {
    id: 'capsule-starlight',
    label: 'Starlight capsule',
    description: 'A patient rising sparkle staircase that blooms into a soft high reward chord.',
    category: 'Progress and rewards',
    tones: [
      { wave: 'sine', frequency: 523.25, startSeconds: 0, durationSeconds: 0.22, gain: 0.09 },
      { wave: 'sine', frequency: 659.25, startSeconds: 0.16, durationSeconds: 0.24, gain: 0.1 },
      { wave: 'sine', frequency: 783.99, startSeconds: 0.32, durationSeconds: 0.26, gain: 0.11 },
      { wave: 'sine', frequency: 1_046.5, startSeconds: 0.48, durationSeconds: 0.3, gain: 0.12 },
      { wave: 'triangle', frequency: 1_046.5, startSeconds: 0.72, durationSeconds: 0.7, gain: 0.1 },
      {
        wave: 'triangle',
        frequency: 1_318.51,
        startSeconds: 0.74,
        durationSeconds: 0.68,
        gain: 0.09,
      },
      { wave: 'sine', frequency: 1_567.98, startSeconds: 0.76, durationSeconds: 0.66, gain: 0.08 },
      { wave: 'sine', frequency: 2_093, startSeconds: 0.92, durationSeconds: 0.42, gain: 0.04 },
    ],
    noise: {
      startSeconds: 0.62,
      durationSeconds: 0.55,
      gain: 0.018,
      filterFrequency: 5_600,
      filterType: 'highpass',
    },
  },
  {
    id: 'companion-pop',
    label: 'Companion pop',
    description: 'A rubbery pitch jump for equipping a favorite companion.',
    category: 'Progress and rewards',
    tones: [
      {
        wave: 'sine',
        frequency: 240,
        endFrequency: 720,
        startSeconds: 0,
        durationSeconds: 0.15,
        gain: 0.2,
      },
      { wave: 'triangle', frequency: 960, startSeconds: 0.11, durationSeconds: 0.12, gain: 0.09 },
    ],
  },
];

export function getAudioCue(id: AudioCueId): AudioCueDefinition {
  const cue = AUDIO_CUES.find((candidate) => candidate.id === id);
  if (!cue) throw new Error(`Unknown audio cue: ${id}`);
  return cue;
}

export function audioCueDuration(cue: AudioCueDefinition): number {
  const toneEnd = Math.max(
    0,
    ...cue.tones.map(({ startSeconds, durationSeconds }) => startSeconds + durationSeconds),
  );
  const noiseEnd = cue.noise ? cue.noise.startSeconds + cue.noise.durationSeconds : 0;
  return Math.max(toneEnd, noiseEnd);
}

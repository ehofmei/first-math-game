import type { AudioCueDefinition, AudioCueId } from './cues';

export const AUDIO_WAVE_OVERRIDES = ['original', 'sine', 'triangle', 'square'] as const;
export type AudioWaveOverride = (typeof AUDIO_WAVE_OVERRIDES)[number];

export interface AudioCueTransform {
  pitchSemitones: number;
  durationScale: number;
  intensityScale: number;
  attackScale: number;
  noiseScale: number;
  stereoPan: number;
  waveOverride: AudioWaveOverride;
}

export const DEFAULT_CUE_TRANSFORM: AudioCueTransform = {
  pitchSemitones: 0,
  durationScale: 1,
  intensityScale: 1,
  attackScale: 1,
  noiseScale: 1,
  stereoPan: 0,
  waveOverride: 'original',
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeCueTransform(transform: AudioCueTransform): AudioCueTransform {
  return {
    pitchSemitones: clamp(Math.round(transform.pitchSemitones), -12, 12),
    durationScale: clamp(transform.durationScale, 0.5, 1.8),
    intensityScale: clamp(transform.intensityScale, 0.5, 1.5),
    attackScale: clamp(transform.attackScale, 0.25, 4),
    noiseScale: clamp(transform.noiseScale, 0, 2),
    stereoPan: clamp(transform.stereoPan, -1, 1),
    waveOverride: AUDIO_WAVE_OVERRIDES.includes(transform.waveOverride)
      ? transform.waveOverride
      : 'original',
  };
}

export function transformAudioCue(
  cue: AudioCueDefinition,
  requestedTransform: AudioCueTransform,
): AudioCueDefinition {
  const transform = normalizeCueTransform(requestedTransform);
  const frequencyScale = 2 ** (transform.pitchSemitones / 12);
  const transformFrequency = (frequency: number) => clamp(frequency * frequencyScale, 40, 12_000);
  const waveGainScale = transform.waveOverride === 'square' ? 0.72 : 1;
  const isDefault = Object.entries(DEFAULT_CUE_TRANSFORM).every(
    ([key, value]) => transform[key as keyof AudioCueTransform] === value,
  );
  if (isDefault) return cue;

  return {
    ...cue,
    stereoPan: transform.stereoPan,
    tones: cue.tones.map((tone) => ({
      ...tone,
      wave: transform.waveOverride === 'original' ? tone.wave : transform.waveOverride,
      frequency: transformFrequency(tone.frequency),
      endFrequency: tone.endFrequency ? transformFrequency(tone.endFrequency) : undefined,
      startSeconds: tone.startSeconds * transform.durationScale,
      durationSeconds: tone.durationSeconds * transform.durationScale,
      gain: clamp(tone.gain * waveGainScale * transform.intensityScale, 0.0001, 0.36),
      attackSeconds:
        (tone.attackSeconds ?? 0.008) * transform.durationScale * transform.attackScale,
    })),
    noise:
      cue.noise && transform.noiseScale > 0
        ? {
            ...cue.noise,
            startSeconds: cue.noise.startSeconds * transform.durationScale,
            durationSeconds: cue.noise.durationSeconds * transform.durationScale,
            filterFrequency: transformFrequency(cue.noise.filterFrequency),
            gain: clamp(
              cue.noise.gain * transform.intensityScale * transform.noiseScale,
              0.0001,
              0.15,
            ),
          }
        : undefined,
  };
}

export function serializeAudioRecipe(
  baseCueId: AudioCueId,
  requestedTransform: AudioCueTransform,
): string {
  return JSON.stringify(
    {
      format: 'number-nook-sound-recipe',
      version: 1,
      baseCueId,
      transform: normalizeCueTransform(requestedTransform),
    },
    null,
    2,
  );
}

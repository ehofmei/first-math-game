import { describe, expect, it } from 'vitest';
import { audioCueDuration, getAudioCue } from './cues';
import {
  DEFAULT_CUE_TRANSFORM,
  normalizeCueTransform,
  serializeAudioRecipe,
  transformAudioCue,
} from './transform';

describe('audio cue transforms', () => {
  it('preserves a cue with the default transform', () => {
    const cue = getAudioCue('correct-nook');
    expect(transformAudioCue(cue, DEFAULT_CUE_TRANSFORM)).toEqual(cue);
  });

  it('transposes, stretches, and overrides oscillator waves safely', () => {
    const cue = getAudioCue('correct-spark');
    const transformed = transformAudioCue(cue, {
      ...DEFAULT_CUE_TRANSFORM,
      pitchSemitones: 12,
      durationScale: 1.5,
      intensityScale: 1.25,
      attackScale: 2,
      noiseScale: 0,
      stereoPan: -0.5,
      waveOverride: 'square',
    });

    expect(transformed.tones[0]?.frequency).toBeCloseTo((cue.tones[0]?.frequency ?? 0) * 2);
    expect(transformed.tones[0]?.wave).toBe('square');
    expect(transformed.tones[0]?.gain).toBeCloseTo((cue.tones[0]?.gain ?? 0) * 0.72 * 1.25);
    expect(transformed.tones[0]?.attackSeconds).toBeCloseTo(0.008 * 1.5 * 2);
    expect(transformed.noise).toBeUndefined();
    expect(transformed.stereoPan).toBe(-0.5);
    expect(audioCueDuration(transformed)).toBeCloseTo(audioCueDuration(cue) * 1.5);
  });

  it('clamps recipes to the Sound Lab ranges', () => {
    expect(
      normalizeCueTransform({
        ...DEFAULT_CUE_TRANSFORM,
        pitchSemitones: 99,
        durationScale: 0,
        intensityScale: 9,
        attackScale: 0,
        noiseScale: -1,
        stereoPan: 4,
        waveOverride: 'triangle',
      }),
    ).toEqual({
      pitchSemitones: 12,
      durationScale: 0.5,
      intensityScale: 1.5,
      attackScale: 0.25,
      noiseScale: 0,
      stereoPan: 1,
      waveOverride: 'triangle',
    });

    expect(
      JSON.parse(
        serializeAudioRecipe('capsule-anticipation', {
          ...DEFAULT_CUE_TRANSFORM,
          pitchSemitones: -4,
          durationScale: 1.2,
          waveOverride: 'sine',
        }),
      ) as unknown,
    ).toMatchObject({
      format: 'number-nook-sound-recipe',
      version: 1,
      baseCueId: 'capsule-anticipation',
    });
  });
});

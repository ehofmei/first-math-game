import { describe, expect, it } from 'vitest';
import { AUDIO_CUES, AUDIO_CUE_IDS, audioCueDuration, GAME_AUDIO_CUES, getAudioCue } from './cues';

describe('audio cue catalog', () => {
  it('defines every cue once with short, bounded synthesis values', () => {
    expect(AUDIO_CUES.map(({ id }) => id)).toEqual(AUDIO_CUE_IDS);
    expect(new Set(AUDIO_CUES.map(({ id }) => id)).size).toBe(AUDIO_CUES.length);

    for (const cue of AUDIO_CUES) {
      expect(cue.tones.length + (cue.noise ? 1 : 0)).toBeGreaterThan(0);
      expect(audioCueDuration(cue)).toBeGreaterThan(0);
      expect(audioCueDuration(cue)).toBeLessThanOrEqual(1.5);
      for (const tone of cue.tones) {
        expect(tone.frequency).toBeGreaterThan(0);
        expect(tone.endFrequency ?? tone.frequency).toBeGreaterThan(0);
        expect(tone.startSeconds).toBeGreaterThanOrEqual(0);
        expect(tone.durationSeconds).toBeGreaterThan(0);
        expect(tone.gain).toBeGreaterThan(0);
        expect(tone.gain).toBeLessThanOrEqual(0.3);
      }
      if (cue.noise) {
        expect(cue.noise.startSeconds).toBeGreaterThanOrEqual(0);
        expect(cue.noise.durationSeconds).toBeGreaterThan(0);
        expect(cue.noise.gain).toBeGreaterThan(0);
        expect(cue.noise.gain).toBeLessThanOrEqual(0.1);
      }
    }
  });

  it('looks up cue definitions by their stable IDs', () => {
    expect(getAudioCue('correct-chime').label).toBe('Bright chime');
  });

  it('maps every gameplay audio event to a catalog cue', () => {
    expect(GAME_AUDIO_CUES).toEqual({
      roundStart: 'correct-chime',
      correctAnswer: 'correct-nook',
      incorrectAnswer: 'incorrect-soft',
      unavailableAction: 'incorrect-tap',
      roundComplete: 'round-complete',
      coinsEarned: 'coin-jingle',
      capsuleReveal: 'capsule-anticipation',
      starterSelected: 'companion-pop',
      companionEquipped: 'companion-pop',
    });
    for (const cueId of Object.values(GAME_AUDIO_CUES)) expect(getAudioCue(cueId)).toBeDefined();
  });
});

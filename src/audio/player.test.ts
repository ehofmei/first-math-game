import { describe, expect, it, vi } from 'vitest';
import type { AudioCueDefinition } from './cues';
import { AudioPlayer, type AudioBackend } from './player';

class FakeAudioBackend implements AudioBackend {
  state: AudioContextState = 'suspended';
  readonly resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });
  readonly play = vi.fn<(cue: AudioCueDefinition, volume: number) => void>();
  readonly close = vi.fn(() => {
    this.state = 'closed';
    return Promise.resolve();
  });
}

describe('AudioPlayer', () => {
  it('does not create audio resources while effects are muted', async () => {
    const factory = vi.fn(() => new FakeAudioBackend());
    const player = new AudioPlayer(factory);
    await expect(
      player.play('correct-chime', { effectsEnabled: false, effectsVolume: 0.4 }),
    ).resolves.toBe(false);
    expect(factory).not.toHaveBeenCalled();
  });

  it('unlocks once, reuses the backend, and schedules named cues at the selected volume', async () => {
    const backend = new FakeAudioBackend();
    const factory = vi.fn(() => backend);
    const player = new AudioPlayer(factory);
    const preferences = { effectsEnabled: true, effectsVolume: 0.35 };

    await expect(player.play('correct-chime', preferences)).resolves.toBe(true);
    await expect(player.play('round-complete', preferences)).resolves.toBe(true);
    expect(factory).toHaveBeenCalledOnce();
    expect(backend.resume).toHaveBeenCalledOnce();
    expect(backend.play).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 'correct-chime' }),
      0.35,
    );
    expect(backend.play).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 'round-complete' }),
      0.35,
    );

    await player.close();
    expect(backend.close).toHaveBeenCalledOnce();
  });

  it('fails quietly when the browser cannot create or resume audio', async () => {
    const player = new AudioPlayer(() => {
      throw new Error('Audio is unavailable');
    });
    await expect(
      player.play('correct-chime', { effectsEnabled: true, effectsVolume: 0.4 }),
    ).resolves.toBe(false);
  });

  it('plays a customized cue definition without requiring a catalog ID', async () => {
    const backend = new FakeAudioBackend();
    const player = new AudioPlayer(() => backend);
    const customCue: AudioCueDefinition = {
      id: 'correct-nook',
      label: 'Customized test',
      description: 'A transformed cue.',
      category: 'Answer feedback',
      tones: [
        {
          wave: 'square',
          frequency: 700,
          startSeconds: 0,
          durationSeconds: 0.2,
          gain: 0.1,
        },
      ],
    };

    await expect(
      player.playDefinition(customCue, { effectsEnabled: true, effectsVolume: 0.25 }),
    ).resolves.toBe(true);
    expect(backend.play).toHaveBeenCalledWith(customCue, 0.25);
  });
});

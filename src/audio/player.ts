import { audioCueDuration, getAudioCue, type AudioCueDefinition, type AudioCueId } from './cues';
import type { AudioPreferences } from './preferences';

export interface AudioBackend {
  readonly state: AudioContextState;
  resume(): Promise<void>;
  play(cue: AudioCueDefinition, volume: number): void;
  close(): Promise<void>;
}

export type AudioBackendFactory = () => AudioBackend;

function createNoiseBuffer(context: AudioContext, durationSeconds: number): AudioBuffer {
  const frameCount = Math.ceil(context.sampleRate * durationSeconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 17_071;
  for (let index = 0; index < data.length; index += 1) {
    seed = (seed * 48_271) % 2_147_483_647;
    data[index] = (seed / 2_147_483_647) * 2 - 1;
  }
  return buffer;
}

export class WebAudioBackend implements AudioBackend {
  private readonly context = new AudioContext();

  get state(): AudioContextState {
    return this.context.state;
  }

  resume(): Promise<void> {
    return this.context.resume();
  }

  play(cue: AudioCueDefinition, volume: number): void {
    const start = this.context.currentTime + 0.008;
    const master = this.context.createGain();
    master.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), start);
    const panner = cue.stereoPan ? this.context.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, cue.stereoPan ?? 0)), start);
      master.connect(panner).connect(this.context.destination);
    } else {
      master.connect(this.context.destination);
    }

    for (const tone of cue.tones) {
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      const toneStart = start + tone.startSeconds;
      const toneEnd = toneStart + tone.durationSeconds;
      const attackEnd = toneStart + Math.min(tone.attackSeconds ?? 0.008, tone.durationSeconds / 2);

      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
      if (tone.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, toneEnd);
      }
      envelope.gain.setValueAtTime(0.0001, toneStart);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, tone.gain), attackEnd);
      envelope.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
      oscillator.connect(envelope).connect(master);
      oscillator.start(toneStart);
      oscillator.stop(toneEnd + 0.01);
    }

    if (cue.noise) {
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const envelope = this.context.createGain();
      const noiseStart = start + cue.noise.startSeconds;
      const noiseEnd = noiseStart + cue.noise.durationSeconds;
      source.buffer = createNoiseBuffer(this.context, cue.noise.durationSeconds);
      filter.type = cue.noise.filterType;
      filter.frequency.setValueAtTime(cue.noise.filterFrequency, noiseStart);
      envelope.gain.setValueAtTime(0.0001, noiseStart);
      envelope.gain.exponentialRampToValueAtTime(cue.noise.gain, noiseStart + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.0001, noiseEnd);
      source.connect(filter).connect(envelope).connect(master);
      source.start(noiseStart);
      source.stop(noiseEnd + 0.01);
    }

    window.setTimeout(
      () => {
        master.disconnect();
        panner?.disconnect();
      },
      (audioCueDuration(cue) + 0.1) * 1_000,
    );
  }

  close(): Promise<void> {
    return this.context.close();
  }
}

export class AudioPlayer {
  private backend: AudioBackend | null = null;

  constructor(private readonly createBackend: AudioBackendFactory = () => new WebAudioBackend()) {}

  async play(cueId: AudioCueId, preferences: AudioPreferences): Promise<boolean> {
    return this.playDefinition(getAudioCue(cueId), preferences);
  }

  async playDefinition(cue: AudioCueDefinition, preferences: AudioPreferences): Promise<boolean> {
    if (!preferences.effectsEnabled || preferences.effectsVolume <= 0) return false;
    try {
      this.backend ??= this.createBackend();
      if (this.backend.state === 'suspended') await this.backend.resume();
      if (this.backend.state !== 'running') return false;
      this.backend.play(cue, preferences.effectsVolume);
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (!this.backend) return;
    const backend = this.backend;
    this.backend = null;
    if (backend.state !== 'closed') await backend.close();
  }
}

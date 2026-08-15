import { z } from 'zod';

export interface AudioPreferences {
  effectsEnabled: boolean;
  effectsVolume: number;
}

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  effectsEnabled: true,
  effectsVolume: 0.4,
};

const audioPreferencesSchema = z.object({
  effectsEnabled: z.boolean(),
  effectsVolume: z.number().min(0).max(1),
});

export class LocalStorageAudioPreferencesRepository {
  static readonly key = 'first-math-game:audio-preferences';

  load(): AudioPreferences {
    const serialized = localStorage.getItem(LocalStorageAudioPreferencesRepository.key);
    if (!serialized) return DEFAULT_AUDIO_PREFERENCES;
    try {
      return audioPreferencesSchema.parse(JSON.parse(serialized) as unknown);
    } catch {
      return DEFAULT_AUDIO_PREFERENCES;
    }
  }

  save(preferences: AudioPreferences): AudioPreferences {
    const validated = audioPreferencesSchema.parse(preferences);
    localStorage.setItem(LocalStorageAudioPreferencesRepository.key, JSON.stringify(validated));
    return validated;
  }
}

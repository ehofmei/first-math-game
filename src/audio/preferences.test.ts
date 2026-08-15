import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_AUDIO_PREFERENCES, LocalStorageAudioPreferencesRepository } from './preferences';

describe('audio preferences', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
  });

  it('defaults effects on at a restrained volume and persists changes', () => {
    const repository = new LocalStorageAudioPreferencesRepository();
    expect(repository.load()).toEqual(DEFAULT_AUDIO_PREFERENCES);
    const saved = repository.save({ effectsEnabled: false, effectsVolume: 0.25 });
    expect(saved).toEqual({ effectsEnabled: false, effectsVolume: 0.25 });
    expect(repository.load()).toEqual(saved);
  });

  it('falls back safely when stored preferences are malformed', () => {
    localStorage.setItem(LocalStorageAudioPreferencesRepository.key, '{');
    expect(new LocalStorageAudioPreferencesRepository().load()).toEqual(DEFAULT_AUDIO_PREFERENCES);

    localStorage.setItem(
      LocalStorageAudioPreferencesRepository.key,
      JSON.stringify({ effectsEnabled: true, effectsVolume: 4 }),
    );
    expect(new LocalStorageAudioPreferencesRepository().load()).toEqual(DEFAULT_AUDIO_PREFERENCES);
  });
});

import { useEffect, useMemo, useState } from 'react';
import type { AudioCueDefinition, AudioCueId } from './cues';
import { AudioPlayer } from './player';
import type { AudioPreferences } from './preferences';

export function useAudioPlayer(preferences: AudioPreferences) {
  const [player] = useState(() => new AudioPlayer());

  useEffect(
    () => () => {
      void player.close();
    },
    [player],
  );

  return useMemo(
    () => ({
      playCue: (cue: AudioCueId) => player.play(cue, preferences),
      playDefinition: (cue: AudioCueDefinition) => player.playDefinition(cue, preferences),
    }),
    [player, preferences],
  );
}

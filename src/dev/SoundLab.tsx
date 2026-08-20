import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUDIO_CUES,
  GAME_AUDIO_CUES,
  audioCueDuration,
  getAudioCue,
  type AudioCueCategory,
  type AudioCueDefinition,
  type AudioCueId,
} from '../audio/cues';
import {
  DEFAULT_AUDIO_PREFERENCES,
  LocalStorageAudioPreferencesRepository,
  type AudioPreferences,
} from '../audio/preferences';
import {
  AUDIO_WAVE_OVERRIDES,
  DEFAULT_CUE_TRANSFORM,
  serializeAudioRecipe,
  transformAudioCue,
  type AudioCueTransform,
  type AudioWaveOverride,
} from '../audio/transform';
import { useAudioPlayer } from '../audio/useAudioPlayer';

const preferencesRepository = new LocalStorageAudioPreferencesRepository();
const CURRENT_GAME_CUES = new Set<AudioCueId>(Object.values(GAME_AUDIO_CUES));

interface SequenceStep {
  cue: AudioCueDefinition;
  atMs: number;
}

function waveformLabel(wave: AudioWaveOverride): string {
  if (wave === 'original') return 'Original mix';
  return `${wave[0]?.toUpperCase() ?? ''}${wave.slice(1)} only`;
}

function panLabel(pan: number): string {
  if (pan === 0) return 'Center';
  return `${pan < 0 ? 'Left' : 'Right'} ${Math.round(Math.abs(pan) * 100)}%`;
}

export function SoundLab() {
  const [preferences, setPreferences] = useState(() => preferencesRepository.load());
  const [status, setStatus] = useState('Choose a sound to begin.');
  const [selectedCueId, setSelectedCueId] = useState<AudioCueId>('correct-nook');
  const [transform, setTransform] = useState<AudioCueTransform>(DEFAULT_CUE_TRANSFORM);
  const [sequenceRunning, setSequenceRunning] = useState(false);
  const sequenceTimers = useRef<number[]>([]);
  const { playCue, playDefinition } = useAudioPlayer(preferences);
  const categories = useMemo(
    () => [...new Set(AUDIO_CUES.map(({ category }) => category))] as AudioCueCategory[],
    [],
  );
  const selectedCue = useMemo(() => getAudioCue(selectedCueId), [selectedCueId]);
  const customizedCue = useMemo(
    () => transformAudioCue(selectedCue, transform),
    [selectedCue, transform],
  );
  const recipe = useMemo(
    () => serializeAudioRecipe(selectedCueId, transform),
    [selectedCueId, transform],
  );
  const canPlay = preferences.effectsEnabled && preferences.effectsVolume > 0;

  const clearSequenceTimers = useCallback(() => {
    for (const timer of sequenceTimers.current) window.clearTimeout(timer);
    sequenceTimers.current = [];
  }, []);

  useEffect(() => clearSequenceTimers, [clearSequenceTimers]);

  const updatePreferences = (next: AudioPreferences) => {
    try {
      setPreferences(preferencesRepository.save(next));
    } catch {
      setPreferences(next);
      setStatus('The setting works for this tab, but this browser could not save it.');
    }
  };

  const audition = async (id: AudioCueId, label: string) => {
    const played = await playCue(id);
    setStatus(
      played
        ? `Scheduled “${label}” at ${Math.round(preferences.effectsVolume * 100)}% volume.`
        : 'Audio is muted or could not start in this browser.',
    );
  };

  const auditionCustomized = async () => {
    const played = await playDefinition(customizedCue);
    setStatus(
      played
        ? `Played customized “${selectedCue.label}.”`
        : 'Audio is muted or could not start in this browser.',
    );
  };

  const runSequence = (label: string, steps: readonly SequenceStep[]) => {
    if (!canPlay || steps.length === 0) return;
    clearSequenceTimers();
    setSequenceRunning(true);
    setStatus(`${label} is playing. Use Stop sequence to end it early.`);

    const firstStep = steps[0];
    if (firstStep) void playDefinition(firstStep.cue);
    for (const step of steps.slice(1)) {
      sequenceTimers.current.push(
        window.setTimeout(() => void playDefinition(step.cue), step.atMs),
      );
    }

    const lastEndMs = Math.max(
      ...steps.map(({ cue, atMs }) => atMs + audioCueDuration(cue) * 1_000),
    );
    sequenceTimers.current.push(
      window.setTimeout(() => {
        sequenceTimers.current = [];
        setSequenceRunning(false);
        setStatus(`${label} finished.`);
      }, lastEndMs + 120),
    );
  };

  const stopSequence = () => {
    clearSequenceTimers();
    setSequenceRunning(false);
    setStatus('Sequence stopped. Sounds already scheduled inside a cue will finish naturally.');
  };

  const repeatCustomized = () => {
    const gapMs = Math.max(550, audioCueDuration(customizedCue) * 1_000 + 220);
    runSequence(
      'Five-repeat fatigue check',
      Array.from({ length: 5 }, (_, index) => ({ cue: customizedCue, atMs: index * gapMs })),
    );
  };

  const pairWithRoundComplete = () => {
    const roundDelay = Math.max(520, audioCueDuration(customizedCue) * 1_000 + 280);
    runSequence('Correct-to-round pairing', [
      { cue: customizedCue, atMs: 0 },
      { cue: getAudioCue('round-complete'), atMs: roundDelay },
    ]);
  };

  const playAnswerDemo = () => {
    const correct = customizedCue;
    runSequence('Five-question answer demo', [
      { cue: correct, atMs: 0 },
      { cue: correct, atMs: 760 },
      { cue: getAudioCue('incorrect-soft'), atMs: 1_520 },
      { cue: correct, atMs: 2_280 },
      { cue: correct, atMs: 3_040 },
      { cue: getAudioCue('round-complete'), atMs: 3_850 },
    ]);
  };

  const playRewardDemo = () => {
    runSequence('Reward sequence demo', [
      { cue: getAudioCue('coin-jingle'), atMs: 0 },
      { cue: getAudioCue('capsule-anticipation'), atMs: 720 },
      { cue: getAudioCue('companion-pop'), atMs: 2_420 },
    ]);
  };

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(recipe);
      setStatus(
        'Copied the customized sound recipe. Paste it into the chat when sharing feedback.',
      );
    } catch {
      setStatus('Clipboard access was blocked. Expand the recipe below and copy it manually.');
    }
  };

  return (
    <main className="state-gallery sound-lab page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Development only</span>
          <h1>Number Nook Sound Lab</h1>
          <p>
            These sounds are generated live with oscillators, gain envelopes, pitch automation,
            chords, and filtered noise. No audio files are being played.
          </p>
        </div>
      </header>

      <section className="panel sound-controls" aria-labelledby="sound-controls-heading">
        <div>
          <h2 id="sound-controls-heading">Listening controls</h2>
          <p>These preferences are shared with the local development game on this device.</p>
        </div>
        <label className="sound-switch">
          <input
            type="checkbox"
            checked={preferences.effectsEnabled}
            onChange={(event) =>
              updatePreferences({ ...preferences, effectsEnabled: event.currentTarget.checked })
            }
          />
          <span>Sound effects {preferences.effectsEnabled ? 'on' : 'off'}</span>
        </label>
        <label className="volume-control" htmlFor="sound-volume">
          <span>Effects volume</span>
          <input
            id="sound-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={preferences.effectsVolume}
            onChange={(event) =>
              updatePreferences({
                ...preferences,
                effectsVolume: Number(event.currentTarget.value),
              })
            }
          />
          <strong>{Math.round(preferences.effectsVolume * 100)}%</strong>
        </label>
        <button
          className="text-button"
          type="button"
          onClick={() => updatePreferences(DEFAULT_AUDIO_PREFERENCES)}
        >
          Reset audio defaults
        </button>
        <p className="sound-status" role="status" aria-label="Sound Lab status">
          {status}
        </p>
      </section>

      <section className="panel sound-playground" aria-labelledby="sound-playground-heading">
        <div className="sound-playground-heading">
          <div>
            <span className="eyebrow">Experiment</span>
            <h2 id="sound-playground-heading">Sound playground</h2>
            <p>Start from any cue, alter it, then copy the exact recipe back to the project.</p>
          </div>
          <span className="mode-pill">
            {Math.round(audioCueDuration(customizedCue) * 1_000)} ms
          </span>
        </div>

        <div className="sound-select-grid">
          <label className="sound-field">
            <span>Starting sound</span>
            <select
              value={selectedCueId}
              onChange={(event) => {
                setSelectedCueId(event.currentTarget.value as AudioCueId);
                setStatus('Loaded a new starting sound into the playground.');
              }}
            >
              {AUDIO_CUES.map((cue) => (
                <option value={cue.id} key={cue.id}>
                  {cue.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sound-field">
            <span>Waveform character</span>
            <select
              value={transform.waveOverride}
              onChange={(event) =>
                setTransform({
                  ...transform,
                  waveOverride: event.currentTarget.value as AudioWaveOverride,
                })
              }
            >
              {AUDIO_WAVE_OVERRIDES.map((wave) => (
                <option value={wave} key={wave}>
                  {waveformLabel(wave)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sound-slider-grid">
          <label className="sound-field sound-slider">
            <span>Pitch</span>
            <output>
              {transform.pitchSemitones > 0 ? '+' : ''}
              {transform.pitchSemitones} semitones
            </output>
            <input
              aria-label="Pitch adjustment"
              type="range"
              min="-12"
              max="12"
              step="1"
              value={transform.pitchSemitones}
              onChange={(event) =>
                setTransform({ ...transform, pitchSemitones: Number(event.currentTarget.value) })
              }
            />
          </label>

          <label className="sound-field sound-slider">
            <span>Length</span>
            <output>{Math.round(transform.durationScale * 100)}%</output>
            <input
              aria-label="Sound length"
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={transform.durationScale}
              onChange={(event) =>
                setTransform({ ...transform, durationScale: Number(event.currentTarget.value) })
              }
            />
          </label>

          <label className="sound-field sound-slider">
            <span>Intensity</span>
            <output>{Math.round(transform.intensityScale * 100)}%</output>
            <input
              aria-label="Sound intensity"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={transform.intensityScale}
              onChange={(event) =>
                setTransform({
                  ...transform,
                  intensityScale: Number(event.currentTarget.value),
                })
              }
            />
          </label>

          <label className="sound-field sound-slider">
            <span>Attack time</span>
            <output>{Math.round(transform.attackScale * 100)}%</output>
            <input
              aria-label="Attack time"
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={transform.attackScale}
              onChange={(event) =>
                setTransform({ ...transform, attackScale: Number(event.currentTarget.value) })
              }
            />
          </label>

          <label className="sound-field sound-slider">
            <span>Noise texture</span>
            <output>
              {selectedCue.noise ? `${Math.round(transform.noiseScale * 100)}%` : 'N/A'}
            </output>
            <input
              aria-label="Noise texture"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={transform.noiseScale}
              disabled={!selectedCue.noise}
              onChange={(event) =>
                setTransform({ ...transform, noiseScale: Number(event.currentTarget.value) })
              }
            />
          </label>

          <label className="sound-field sound-slider">
            <span>Stereo pan</span>
            <output>{panLabel(transform.stereoPan)}</output>
            <input
              aria-label="Stereo pan"
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={transform.stereoPan}
              onChange={(event) =>
                setTransform({ ...transform, stereoPan: Number(event.currentTarget.value) })
              }
            />
          </label>
        </div>

        <div className="sound-playground-actions">
          <button
            className="primary-button"
            type="button"
            disabled={!canPlay || sequenceRunning}
            onClick={() => void auditionCustomized()}
          >
            Play customized sound
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={!canPlay || sequenceRunning}
            onClick={repeatCustomized}
          >
            Repeat ×5
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={!canPlay || sequenceRunning}
            onClick={pairWithRoundComplete}
          >
            Pair with Round complete
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => setTransform(DEFAULT_CUE_TRANSFORM)}
          >
            Reset tweaks
          </button>
          <button className="text-button" type="button" onClick={() => void copyRecipe()}>
            Copy sound recipe
          </button>
        </div>

        <details className="sound-recipe">
          <summary>View recipe JSON</summary>
          <pre>{recipe}</pre>
        </details>
      </section>

      <section className="panel sound-scenarios" aria-labelledby="sound-scenarios-heading">
        <div>
          <span className="eyebrow">Context matters</span>
          <h2 id="sound-scenarios-heading">Sequence tests</h2>
          <p>
            The answer demo treats your customized sound as the correct cue. The reward demo uses
            Paw Coin jingle, Capsule anticipation, and Companion pop.
          </p>
        </div>
        <div className="sound-scenario-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={!canPlay || sequenceRunning}
            onClick={playAnswerDemo}
          >
            Simulate five-question finish
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={!canPlay || sequenceRunning}
            onClick={playRewardDemo}
          >
            Simulate reward sequence
          </button>
          <button
            className="text-button"
            type="button"
            disabled={!sequenceRunning}
            onClick={stopSequence}
          >
            Stop sequence
          </button>
        </div>
      </section>

      {categories.map((category) => (
        <section className="sound-section" key={category}>
          <h2>{category}</h2>
          <div className="sound-grid">
            {AUDIO_CUES.filter((cue) => cue.category === category).map((cue) => (
              <article className="panel sound-card" key={cue.id}>
                <div>
                  <div className="sound-card-heading">
                    <h3>{cue.label}</h3>
                    <div className="sound-card-badges">
                      {CURRENT_GAME_CUES.has(cue.id) ? (
                        <span className="mode-pill">In game</span>
                      ) : (
                        <span className="mode-pill mode-pill--candidate">Candidate</span>
                      )}
                    </div>
                  </div>
                  <p>{cue.description}</p>
                  <small>
                    {Math.round(audioCueDuration(cue) * 1_000)} ms · {cue.tones.length}{' '}
                    {cue.tones.length === 1 ? 'tone' : 'tones'}
                    {cue.noise ? ' + filtered noise' : ''}
                  </small>
                </div>
                <div className="sound-card-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!canPlay || sequenceRunning}
                    onClick={() => void audition(cue.id, cue.label)}
                  >
                    Play {cue.label}
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    aria-pressed={selectedCueId === cue.id}
                    onClick={() => {
                      setSelectedCueId(cue.id);
                      setTransform(DEFAULT_CUE_TRANSFORM);
                      setStatus(`Loaded “${cue.label}” into the playground.`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit in playground
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="panel sound-lab-notes">
        <h2>What to listen for</h2>
        <ul>
          <li>Does a correct cue clearly feel positive when repeated five times?</li>
          <li>Does it lead naturally into Round complete?</li>
          <li>Is the incorrect cue neutral enough to avoid feeling punitive?</li>
          <li>Does a capsule reveal have enough anticipation without becoming slow?</li>
          <li>What volume feels comfortable on both Mac speakers and an iPad?</li>
        </ul>
        <p>
          Open the playable app at <a href={import.meta.env.BASE_URL}>Number Nook</a>. Return here
          with <code>?dev=sounds</code> while running the development server, compare collectible
          studies in the <a href="?dev=art">Art Lab</a>, or inspect palettes in the{' '}
          <a href="?dev=themes">Theme Lab</a>. Dialogue and motion experiments live in the{' '}
          <a href="?dev=companions">Companion Lab</a>.
        </p>
      </section>
    </main>
  );
}

# Sound Effects and Sound Lab

## Current scope

Number Nook's first audio slice provides short optional sound effects without adding audio files or a music dependency. The cues are synthesized at playback time with the browser's Web Audio API and the game remains completely playable while muted.

Currently wired gameplay cues are:

| Event | Cue | Intent |
| --- | --- | --- |
| Round launched | Bright chime | Clear confirmation that the question loop has begun |
| Correct answer | Nook correct | Fast confirmation related to Round complete |
| Incorrect answer | Gentle answer cue | Neutral information without a failure buzzer |
| Round complete | Round complete | Brief four-note finish |
| Paw Coins presented | Paw Coin jingle | Synchronized with the results count-up |
| Capsule opened | Capsule anticipation | Latch, anticipation, and reveal chord synchronized with the opening animation |
| Unavailable capsule | Wooden tap | Neutral boundary feedback without pretending the purchase succeeded |
| Starter selected | Companion pop | Playful first-companion feedback |
| Companion equipped | Companion pop | Playful customization feedback |

The Sound Lab also contains deliberately unwired candidates for comparison:

- Correct-answer variations: Bright chime, Tiny triumph, and Correct spark.
- Paw Coin variations: Paw Coin sparkle and Metal Paw Coin.
- Reveal variations: Capsule reveal and Starlight capsule.

The Sound Lab marks the exact current gameplay set with **In game** badges.

## Trying the Sound Lab

Start the development server:

```sh
npm run dev
```

Open `http://localhost:5173/?dev=sounds`. The Sound Lab is development-only and is not included as normal navigation in the GitHub Pages build.

The lab can:

- Audition each cue independently and show which cues are currently used in the game.
- Change the effects volume in 5% steps.
- Mute or enable effects using the same preference as the playable app.
- Reset the audio preference to the current default of 40%.
- Show cue duration, tone count, and whether filtered noise is involved.
- Load any cue into the Sound Playground.
- Transpose it by up to one octave, stretch it from 50–180% length, and replace its oscillator mix with sine, triangle, or square waves.
- Adjust cue intensity, make its attack sharper or softer, scale or remove existing noise texture, and pan it between the left and right channels.
- Repeat a customized sound five times to expose repetition fatigue.
- Pair a customized cue with Round complete to test whether they sound related.
- Simulate a five-question finish or a Paw Coin/capsule/companion reward sequence.
- Copy a versioned JSON recipe containing the starting cue and exact adjustments.

For initial play-testing, compare Mac, iPhone, and iPad speakers at both low and normal system volume. Listen to fast answer cues repeatedly, not only once; a pleasant isolated sound can become tiring over a twenty-question round.

## What Web Audio is doing

The Web Audio API is a small real-time sound studio built into the browser. The current engine demonstrates:

- **Oscillators:** sine waves sound clean and soft; triangle waves add a little more character.
- **Pitch automation:** notes can glide upward or downward to create pops, bubbles, and gentle corrections.
- **Gain envelopes:** every tone fades in and out over milliseconds, avoiding clicks and harsh starts.
- **Chords and arpeggios:** multiple scheduled tones create round-completion and reward sounds.
- **Filtered noise:** deterministic noise passed through low-pass or high-pass filters creates taps, shimmer, and a small reveal whoosh.
- **Precise scheduling:** several sound parts can start fractions of a second apart while the interface continues immediately.

This approach is tiny, offline-friendly, easy to tune in TypeScript, and avoids licensing questions. It is best for UI feedback and short game-like effects. Recorded samples become more attractive when a sound needs an identifiable instrument, voice, animal sound, or richer texture.

The playground intentionally exposes a useful subset rather than every Web Audio parameter. Future controls can add filter cutoff and resonance, echo time and feedback, reverb mix, tremolo, vibrato, oscillator detuning, per-note editing, and procedural variation. Those controls require additional signal-chain or cue-editor UI and should be added in coherent groups rather than as unexplained raw numbers.

## Runtime and persistence rules

- The audio context is created lazily on the first eligible player action, which respects mobile browser autoplay restrictions.
- Effects default to enabled at 40% volume.
- A speaker button on the home and question screens toggles effects immediately.
- Unsupported or blocked audio fails quietly and never blocks an answer or reward.
- The engine reuses one audio context instead of creating a new one for every cue.
- Effects enabled and volume use the device-local `first-math-game:audio-preferences` record.
- Audio preferences are intentionally separate from progress backups. They describe the destination device's output, not player achievement.

## Test coverage

Automated tests verify:

- Every cue has a unique stable ID, bounded duration, safe frequency and gain values, and a valid lookup.
- Muted playback creates no audio resources.
- A suspended context resumes before playback, one backend is reused, and the selected volume reaches it.
- Browser audio failures are contained.
- Cue transformations are clamped, deterministic, serializable, and do not mutate the catalog definition.
- Sound Lab controls are semantic, persist mute/reset behavior, customize cues, and run stoppable sequences in a real Chromium component test.
- The player journey verifies coin presentation, capsule-opening timing, unavailable-capsule behavior, and persistence in Chromium, WebKit, and the iPad browser project.

Automation can verify the sound graph and controls but cannot judge taste or the character of a physical speaker. Final cue selection therefore requires a short human listening pass on the devices the children will use.

## Recommended next audio steps

1. Play one or two complete rounds to judge Bright chime, Nook correct, Gentle answer cue, Round complete, and the Paw Coin count-up in context.
2. Open a capsule and confirm the sound's reveal chord aligns with the collectible appearing.
3. Try selecting and equipping companions, plus pressing an unaffordable capsule once.
4. Record only obvious problems that should block the next development phase; preserve subjective refinements in the deferred backlog.
5. Check the same flows on an iPad before calling the contextual pass complete.

For music, there are three practical levels:

- **Basic:** no looping music; keep only the current responsive sound effects.
- **Intermediate:** one small original or licensed loop on menus/results, with independent music mute and volume.
- **Advanced:** several layered or procedural tracks that react to game state. This is feasible with Web Audio but adds composition, mixing, transition, and testing work.

The intermediate option is the strongest next experiment: it can improve atmosphere without making the answer loop slower or turning the application into an audio-production project.

## Deferred audio backlog

The contextual-audio pass deliberately stops after round launch, answers, round completion, results coins, capsule opening, unavailable capsules, and companion selection/equipping. Preserve these ideas for a later polish cycle:

- A distinct personal-best accent layered after Round complete.
- Daily and weekly goal-completion cues when those systems exist.
- A successful direct-purchase sequence when the shop exists.
- Optional final-seconds feedback for a future Time Rush mode.
- A tiny confirmation when sound is turned on.
- Filter, resonance, echo, reverb, tremolo, vibrato, detuning, and per-note Sound Lab controls.
- Rarity-sensitive reveal variations after the base capsule animation has been play-tested.
- Recorded or generated samples only where synthesis cannot express the desired character.

Ordinary navigation, review/history interaction, scrolling, text entry, and every settings chip should remain silent unless play-testing reveals a specific usability problem.

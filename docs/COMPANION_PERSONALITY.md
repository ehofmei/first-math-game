# Companion Personality, Dialogue, and Motion

This document defines how Number Nook companions can feel expressive and memorable without distracting from arithmetic or requiring bespoke animation for every collectible. It is the implementation contract for the phrase engine, Companion Lab, reusable CSS presentation profiles, and later personality-driven polish.

The system should be bold enough to make collecting feel worthwhile, but simple enough to scale from eleven companions to one hundred or more.

Implementation status: the pure engine boundary, development-only Companion Lab, and all six initial player-facing dialogue contexts are complete. The repository now contains 128 validated phrases, all eleven personality definitions, deterministic condition-aware selection, per-context eight-line recent queues, token rendering, unit/property coverage, responsive presentation previews, CSS motion/motif profiles, and Draw 50 diagnostics. Stable companion dialogue appears on Home, Game Setup, Round Results, the idle Capsule screen, equip confirmation, and Play History.

The initial copy-polish pass established the companion as the direct first-person speaker, replaced formal educational phrasing with warmer conversational language, and added restrained cute imagery without changing phrase IDs, eligibility, or result conditions.

## Goals

- Give equipped companions recognizable voices and personalities.
- Keep repeated visits, setup screens, and results screens from feeling mechanically identical.
- Celebrate practice, care, and improvement without shaming mistakes.
- Make new companions meaningfully different without requiring new React components or character-specific CSS.
- Keep phrase selection deterministic and directly testable.
- Support future species, collections, and Special Guests through data rather than branching application logic.
- Create a development lab where dialogue and motion can be explored as easily as art and sound.

## Non-goals for the first version

- Companions do not interrupt active questions with dialogue.
- Companions do not react negatively to individual mistakes.
- Dialogue is not spoken aloud in the first phrase-engine slice.
- Portraits do not receive internally animated eyes, mouths, ears, or paws.
- Dialogue does not affect score, Paw Coins, difficulty, capsule odds, or mastery.
- No cloud service, generated-at-runtime text, or child-facing chat input is involved.
- Phrase history is not added to save schema 5 or backup files.

## Experience principles

### Practice is always treated as worthwhile

Results dialogue may recognize accuracy, improvement, a personal best, persistence, or simply completing a round. It must not imply disappointment, lost approval, a broken relationship, or punishment.

Avoid messages such as:

- “You let Pepper down.”
- “Your streak is broken.”
- “That was bad.”
- “Try not to miss next time.”
- “Moonbeam expected better.”

Prefer messages such as:

- “I’m cheering for all the practice you put in.”
- “Every question gave your number skills a little more muscle.”
- “That round felt smoother than the last one.”
- “A new best calls for a tiny celebration!”

### Cute and conversational, not babyish

The visible name below each bubble identifies the speaker. Production dialogue therefore uses first person—“I saved you a cozy spot”—instead of making a companion narrate itself with lines such as “Cloud thinks…” or “Sunny says…”. Contractions and direct language should make each line sound spoken rather than written by an instructional system.

Cuteness should come from one small concrete image, gentle surprise, or character motif: a pocketful of colors, a cozy corner, a whirring number machine, or a tiny celebration. Do not stack several flourishes in one line. Avoid baby talk, forced animal puns, trendy slang, excessive exclamation marks, or language aimed at a specific age.

Prefer “More answers clicked into place this time!” over “You turned practice into greater accuracy.” Keep exact educational terms when they communicate a real fact—such as “100% accuracy”—but surround them with natural language.

### Accuracy claims must be true

A phrase that mentions a perfect round, personal best, faster pace, or improvement must declare that condition in data and cannot enter the candidate pool unless the corresponding fact is true. Generic encouragement must remain accurate at any score.

### Personality should flavor information, not replace it

The results screen must continue to show exact accuracy, time, score, and Paw Coins. Companion dialogue is an emotional layer beside those facts, never the only explanation of progress.

### Quiet during arithmetic

The active-question screen retains its small static portrait, but no speech bubble appears beside the equation or answer choices. Dialogue is reserved for natural pauses so it never competes with reading, timers, or feedback.

### One message per event

Dialogue is selected when a screen or meaningful event begins and remains stable until the next event. It must not change because React rerendered, a timer ticked, or unrelated state updated. There is no automatic carousel or typewriter effect in version one.

## Dialogue contexts

The first engine uses a compact context enum plus structured facts rather than a separate context for every outcome.

| Context | Selection moment | Intended tone | Initial target |
| --- | --- | --- | ---: |
| `home` | Entering or returning to home | Welcoming, playful | 15 shared lines |
| `setup` | Opening game setup | Anticipatory, calm | 12 shared lines |
| `results` | Completing a round | Effort, improvement, celebration | 40 shared lines across conditions |
| `capsule` | Opening the idle capsule screen | Curious, social | 10 shared lines |
| `equip` | Equipping a different companion | Friendly introduction | 8 shared lines |
| `progress` | Opening Play History/progress | Reflective, encouraging | 10 shared lines |

The initial bank therefore contains roughly 95 shared lines. Each current companion adds three to five signature lines distributed across the most relevant contexts. This provides substantial variety without requiring dozens of unique lines for every future collectible.

## Result facts

The results context needs enough structured information to select truthful lines:

```ts
interface ResultDialogueFacts {
  accuracy: number;
  perfect: boolean;
  firstRound: boolean;
  personalBest: boolean;
  accuracyImproved: boolean;
  paceImproved: boolean;
  completedQuestions: number;
  operationLabels: readonly string[];
}
```

The engine should derive these facts from the same comparison logic already used by the results screen. Phrase code must not independently reinterpret session history.

Recommended priority when several conditions are true:

1. first round;
2. perfect round;
3. personal best;
4. accuracy improvement;
5. pace improvement when accuracy has not decreased materially;
6. general practice completion.

This priority prevents a generic line from hiding the most meaningful achievement. It does not change score calculation or the existing results headline.

## Phrase data model

Phrase content lives outside React components and is validated at build/test time.

```ts
type DialogueContext = 'home' | 'setup' | 'results' | 'capsule' | 'equip' | 'progress';

type VoiceId =
  | 'warm'
  | 'playful'
  | 'dreamy'
  | 'thoughtful'
  | 'adventurous'
  | 'inventive'
  | 'plush';

interface DialogueCondition {
  perfect?: boolean;
  firstRound?: boolean;
  personalBest?: boolean;
  accuracyImproved?: boolean;
  paceImproved?: boolean;
  minimumAccuracy?: number;
}

interface DialoguePhrase {
  id: string;
  context: DialogueContext;
  text: string;
  voices?: readonly VoiceId[];
  companionIds?: readonly string[];
  condition?: DialogueCondition;
  weight?: number;
}
```

Rules:

- Every phrase has a permanent, unique, lowercase kebab-case ID.
- A phrase with no `voices` or `companionIds` is globally eligible in its context.
- A phrase with `voices` may be used by a companion whose primary or secondary voice matches.
- A phrase with `companionIds` is a signature line and only those companions may use it.
- Conditions are conjunctive: every declared condition must match.
- Weight defaults to `1`; version one should use weights sparingly because repetition protection is more important than fine probability tuning.
- The phrase bank is repository content. Adding phrases requires no save migration.

## Template tokens

Version one supports a deliberately small token whitelist:

- `{companion}` — current companion name; supported by the renderer, but normally unnecessary in first-person speech because the bubble already labels its speaker;
- `{operation}` — one operation label when exactly one was practiced;
- `{accuracy}` — rounded accuracy percentage, only in contexts where it is supplied.

Unknown or unresolved tokens are validation failures. Player names are omitted initially so shared lines remain natural, privacy-neutral, and easy to preview. More tokens should be added only when a concrete phrase needs them.

Recommended maximum rendered length is 96 characters. Longer lines are rejected unless explicitly marked as a reviewed exception. A phone speech bubble should normally fit in two or three short lines.

## Companion personality model

Dialogue and presentation metadata should be defined in a companion-personality registry keyed by the existing permanent collectible ID. Ownership and save data continue to store only that collectible ID.

```ts
type MotionProfile =
  | 'calm-float'
  | 'buoyant-bob'
  | 'curious-tilt'
  | 'brave-lean'
  | 'cosmic-drift'
  | 'plush-sway';

type Motif =
  | 'sun'
  | 'cloud'
  | 'biscuit'
  | 'leaf'
  | 'moon'
  | 'paint'
  | 'gear'
  | 'trail'
  | 'aurora'
  | 'comet'
  | 'stitch';

interface CompanionPersonality {
  companionId: string;
  primaryVoice: VoiceId;
  secondaryVoice?: VoiceId;
  motion: MotionProfile;
  motif: Motif;
}
```

The registry is separate from the core ownership/economy catalog for the first implementation. Content validation must still guarantee that every live collectible has exactly one personality entry and that no personality references an unknown collectible. If this split becomes inconvenient when content packs expand, the fields can later move into catalog definitions without changing the phrase engine.

### Initial personality map

| Companion | Primary voice | Secondary voice | Motion | Motif |
| --- | --- | --- | --- | --- |
| Sunny | warm | playful | buoyant-bob | sun |
| Cloud | dreamy | warm | calm-float | cloud |
| Biscuit | playful | warm | buoyant-bob | biscuit |
| Juniper | thoughtful | warm | calm-float | leaf |
| Moonbeam | dreamy | thoughtful | cosmic-drift | moon |
| Patches | playful | inventive | curious-tilt | paint |
| Gizmo | inventive | thoughtful | curious-tilt | gear |
| Pepper | adventurous | playful | brave-lean | trail |
| Aurora | dreamy | adventurous | cosmic-drift | aurora |
| Comet | adventurous | inventive | cosmic-drift | comet |
| Button Bunny | plush | warm | plush-sway | stitch |

Voice profiles are reusable writing guidance, not rigid stereotypes. A companion may use global lines, lines from either voice, and its own signature lines.

## Selection and repetition rules

Phrase selection is a pure domain concern and receives an injected `RandomSource`.

```ts
interface DialogueRequest {
  companionId: string;
  context: DialogueContext;
  facts?: ResultDialogueFacts;
  recentPhraseIds: readonly string[];
  random: RandomSource;
}

interface SelectedDialogue {
  id: string;
  text: string;
  context: DialogueContext;
}
```

Selection sequence:

1. Resolve the companion personality.
2. Filter phrases to the requested context.
3. Remove phrases whose conditions are not satisfied.
4. Keep global, matching-voice, and matching-signature lines.
5. Remove recently used phrase IDs when at least one other candidate remains.
6. Prefer the most meaningful eligible result condition according to the result priority.
7. Choose from the remaining pool with the injected random source.
8. Resolve the approved template tokens.

The UI owns a small in-memory recent-ID queue, initially eight phrases per context. This prevents immediate repetition across navigation while avoiding a save migration. Closing or reloading the PWA resets the queue, which is acceptable for version one.

A later version may use a true shuffle deck per companion/context or persist a very small recent queue if real play-testing shows repetition across app launches. That change should be justified by observed behavior rather than added preemptively.

## Initial signature-line direction

Signature lines should be short and recognizable without becoming catchphrases that appear every round.

Examples:

- Sunny: “A little practice can brighten the whole day.”
- Cloud: “One question at a time is a lovely pace.”
- Biscuit: “Fresh practice, nicely done!”
- Juniper: “Small steps grow into strong skills.”
- Moonbeam: “Those answers were shining tonight.”
- Patches: “Every try adds something to the picture.”
- Gizmo: “That round gave the gears a good spin.”
- Pepper: “That was a bold run. Ready for another trail?”
- Aurora: “Your practice left a bright trail behind it.”
- Comet: “That round really moved!”
- Button Bunny: “That practice came together one stitch at a time.”

These examples establish direction. The implementation bank should include three to five reviewed lines per companion and must label any result-specific condition accurately.

## Speech-bubble behavior

- Dialogue is visible text, not a tooltip.
- Home and setup dialogue is ordinary static content and should not use an assertive live region.
- Results and equip dialogue may use `aria-live="polite"` when it appears after an action.
- The companion name remains visible outside the sentence so a generic line does not need to repeat it.
- The bubble uses the equipped theme while maintaining readable text contrast.
- The bubble tail points toward the portrait but never overlaps the face.
- On phones, the bubble may move below the portrait rather than becoming too narrow.
- The entire line appears at once. Character-by-character typing is deferred because it slows reading and creates screen-reader complications.

## CSS presentation system

CSS can create strong personality around a static portrait as long as it animates the presentation rather than pretending to manipulate body parts inside an `<img>`.

### Motion profiles

Reusable motion profiles are applied with data attributes rather than companion-specific selectors:

```html
<div data-companion-motion="plush-sway" data-companion-motif="stitch">...</div>
```

Recommended motion limits:

- idle cycles last 2.8–5 seconds;
- translation stays within approximately 4 CSS pixels;
- rotation stays within approximately 2 degrees;
- entrance motion completes within 300 milliseconds;
- results and capsule reveals may use one larger celebratory beat;
- active questions use no portrait motion beyond the existing restrained static treatment;
- `prefers-reduced-motion: reduce` removes transforms and repeating animation.

Profiles:

- `calm-float`: slow vertical drift with soft shadow breathing;
- `buoyant-bob`: slightly quicker rise and settle;
- `curious-tilt`: tiny alternating tilt with a stable center;
- `brave-lean`: one confident entrance lean, then a restrained idle;
- `cosmic-drift`: slow diagonal drift and glow shift;
- `plush-sway`: gentle side-to-side stuffed-toy movement.

### Motifs

Motifs use one or two `aria-hidden` pseudo-elements or lightweight SVG/CSS primitives around the portrait. They do not require alternate character art.

- sun: warm ray arcs;
- cloud: pale rounded puffs;
- biscuit: subtle round dotted shapes;
- leaf: two drifting leaf silhouettes;
- moon: crescent glow and sparse stars;
- paint: restrained color dots or one brushstroke;
- gear: two slowly offset circular outlines;
- trail: a curved directional streak;
- aurora: one soft gradient ribbon;
- comet: a short cyan light trail;
- stitch: dashed seam arc and button-like dots.

Motifs remain decorative, never communicate gameplay state, and never cover dialogue or controls. New companions reuse existing motion primitives where possible; new selectors are added for motifs, not individual companion IDs.

### Other safe CSS treatments

- theme-colored portrait frames;
- glow and shadow depth based on rarity;
- shimmer on a newly unlocked card;
- a brief equip pulse;
- companion-shaped peeking layouts around empty or loading panels;
- progress bars with a themed motif traveling only when progress changes;
- layered portrait/background parallax on pointer devices, disabled for touch and reduced motion;
- responsive speech-bubble placement using container or media queries.

CSS cannot animate an eye, mouth, ear, or paw inside a single raster image. True expression changes require alternate portraits, transparent layers, a sprite sheet, inline SVG parts, or a canvas/WebGL rig. The recommended next art step is two alternate static expressions for a few favorites—celebrating and curious—before considering character rigs.

## Companion Lab

Add a development-only route at `/?dev=companions` after the pure engine exists. It should not read or mutate the player's save.

Controls:

- companion selector;
- context selector;
- results facts: accuracy, first round, perfect, personal best, accuracy improved, and pace improved;
- art-style selector;
- motion-profile and motif selectors;
- normal/reduced-motion preview;
- phone, tablet, and wide preview widths;
- “Next phrase” and “Draw 50” actions;
- recent-ID queue display;
- copyable selection request and output JSON.

Views:

- speech bubble beside the portrait;
- home presentation;
- setup companion card;
- results celebration;
- capsule-side companion;
- progress-page coach card;
- compact 96-pixel portrait with motif;
- long-line and large-text stress tests.

“Draw 50” should summarize phrase frequencies, consecutive duplicates, condition categories, and unresolved templates. This is a development inspection tool, not a statistical promise about production play.

## Accessibility and child-safety requirements

- Dialogue never uses failure alarms, red styling, or mistake-specific shaking.
- No phrase requires color, animation, or sound to be understood.
- Reduced motion removes repeated animation while retaining the complete layout and text.
- Decorative motifs are hidden from assistive technology.
- Polite announcements occur only after meaningful user actions, not on every navigation rerender.
- Text remains selectable by browser zoom and fits at 200% without clipping.
- Phrase content contains no advertising, purchasing pressure, real-world scarcity, or manipulative “your companion will be sad” framing.
- Daily-return lines may welcome the player but never punish absence or imply a lost relationship.

## Validation and automated testing

### Static content validation

- phrase IDs are unique and kebab-case;
- every context meets its minimum shared-line count;
- every live companion has one personality entry;
- no personality points to an unknown collectible;
- voice, motion, motif, and condition values are recognized;
- weights are finite and positive;
- templates contain only approved tokens;
- every template can resolve for its declared context;
- ordinary phrases render at 96 characters or fewer;
- each live companion has the required signature-line count.

### Unit tests

- identical seed and request produce the same selection;
- recently used lines are excluded when alternatives exist;
- the engine still returns a line when every eligible phrase is recent;
- signature lines never leak to another companion;
- voice lines match either the primary or secondary voice;
- condition-specific lines never appear when their facts are false;
- perfect and personal-best pools outrank generic results when applicable;
- every rendered line has no unresolved token;
- an unknown companion uses a safe global fallback rather than throwing in the UI.

### Property tests

Across generated valid requests and seeds:

- selection returns an eligible phrase whenever the context has a valid global fallback;
- output always belongs to the requested context;
- output conditions are satisfied;
- output contains no unsupported template syntax;
- selection never mutates the phrase bank or recent-ID input.

### Browser and visual tests

- dialogue remains stable across unrelated rerenders;
- home and setup phrases are not noisy live regions;
- results/equip announcements are polite and occur once;
- bubbles fit phone and tablet layouts;
- long reviewed phrases wrap without covering the portrait or controls;
- every motion profile respects reduced motion;
- no dialogue appears beside active equations or answers;
- Companion Lab controls reproduce a request and display deterministic output.

### Play-testing questions

- Do children notice that companions have different voices?
- Are signature lines delightful or repetitive?
- Does dialogue make results feel warmer without delaying replay?
- Do animated motifs attract attention away from setup or progress controls?
- Which companions feel most alive, and why?
- Does any phrase sound judgmental when accuracy is low?

## Implementation sequence

1. ~~Add phrase/personality types, the initial personality registry, shared phrase banks, template validation, and pure selection tests.~~ Completed.
2. ~~Build the in-memory recent queue and deterministic selection service without changing save schema 5.~~ Completed as a pure queue helper; the eventual UI will own one queue per context.
3. ~~Add `/?dev=companions` with phrase generation, scenario controls, motion previews, and Draw 50 diagnostics.~~ Completed without reading or mutating the player's save.
4. ~~Add a reusable `CompanionDialogue` presentation to home, setup, and results first.~~ Completed with stable per-entry selection, truthful result facts, responsive layouts, polite Results announcements, and reduced-motion support.
5. ~~Add dialogue to capsule, equip confirmation, and progress after the first three contexts are play-tested.~~ Completed with an idle-only Capsule prompt, a polite one-event equip introduction, and a compact Play History coach card.
6. ~~Add reusable motion profiles and a small motif set, beginning with Moonbeam, Pepper, Sunny, and Button Bunny as visual stress cases.~~ Completed for every current companion, with reduced-motion coverage.
7. ~~Write three to five signature lines for every live companion and validate the complete bank.~~ Completed with three initial signature lines per companion; phrasing remains open to play-test refinement.
8. Observe real play before adding persistent phrase history, alternate expression art, favorites, companion-led goals, or spoken dialogue.

## Implemented system

The completed initial system includes:

- types and validated data;
- all eleven personality definitions;
- initial global/voice/signature phrase content;
- deterministic filtering, repetition avoidance, selection, and token rendering;
- unit and property tests;
- reusable React presentation across all six contexts;
- CSS motion and decorative motif profiles with reduced-motion handling;
- real-browser component coverage, critical-journey assertions, and deterministic phone snapshots.

Dialogue history intentionally remains session-only, so this feature does not require a save migration.

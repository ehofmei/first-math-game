# Implementation Plan

## Purpose

This plan translates the product research into a sequence of small, verifiable engineering milestones. It prioritizes a complete vertical slice and the testing foundation before broad feature coverage or final artwork.

Related references:

- [Research and product design](../DESIGN_RESEARCH.md)
- [Testing strategy](./TEST_STRATEGY.md)
- [Problem generation and session composition](./PROBLEM_GENERATION.md)
- [Addition and subtraction generation](./ADDITION_SUBTRACTION_GENERATION.md)
- [Round review and play-history retention](./PLAY_HISTORY.md)
- [Save backup and restore](./SAVE_BACKUP.md)
- [Sound effects and Sound Lab](./AUDIO.md)

## Delivery principles

1. Build features as complete slices through domain logic, interface, persistence, and tests.
2. Keep mathematical and economic logic independent of React and browser APIs.
3. Make randomness, time, storage, and content injectable and deterministic.
4. Establish one-command verification before the application becomes large.
5. Validate the interaction loop with placeholder content before producing the full collectible set.
6. Keep every milestone deployable; unfinished later features should not destabilize the completed core.
7. Prefer explicit state models and versioned data over convenient implicit behavior.

## Definition of the first vertical slice

The first vertical slice proves one complete player journey:

1. Launch the app with no save.
2. Enter a local display name.
3. Choose one of three placeholder starter cats.
4. Configure an Easy, ten-question addition game.
5. Play with four answer choices, a subtle count-up timer, and a short feedback beat.
6. Complete the round and see accuracy, elapsed time, a simple improvement message, score, and Paw Coins.
7. Spend coins on a duplicate-protected Cat Capsule.
8. Reveal a collectible and view it in the unified gallery.
9. Equip the collectible and see it on the home screen.
10. Reload the app and confirm that identity, settings, progress, currency, ownership, and equipped state persist.

This is intentionally narrower than the eventual MVP. It validates almost every important architectural seam without requiring four operations, final adaptive practice, a balanced economy, or production artwork.

## Vertical-slice boundaries

### Included

- Responsive app shell.
- One local player per device.
- Three placeholder starter cats.
- Addition only.
- Easy preset only.
- Fixed ten-question Quick Game only.
- Seeded problem and distractor generation.
- Four large answer cards.
- Subtle count-up timer.
- A short correct-answer feedback state and a slightly longer incorrect-answer feedback state.
- Previous-answer feedback ribbon.
- Results and initial scoring.
- Paw Coins.
- A small bundled collectible catalog with Common, Rare, and Special examples.
- Duplicate-protected capsule.
- Unified gallery with locked silhouettes, rarity, and Guest badge support.
- One equipped collectible.
- Versioned local save.
- JSON export/import may be represented by the repository interface but does not need polished UI yet.
- PWA manifest and production build; full offline/update behavior may land in the next milestone.
- Automated tests and the development UI state gallery.

### Excluded

- Subtraction, multiplication, division, and mixed mode.
- Medium, Hard, and Advanced settings.
- Time Rush, Practice retry/hints, and Endless.
- Mastery weighting and adaptive question selection.
- Final scoring balance or Improvement Duel.
- Weekly goal and daily bonus.
- Direct-purchase shop.
- Full content set and final art.
- Speech, music, and elaborate animation.
- Final PWA installation help.
- Cloud synchronization or accounts.

## Architecture established before feature work

### Dependency boundaries

The application should depend inward:

```text
React UI
  -> application/session services
    -> domain modules

browser adapters
  -> domain interfaces

domain modules
  -X-> React, DOM, localStorage, Date, Math.random
```

Domain code must not directly import React, DOM APIs, `localStorage`, `Date.now()`, or `Math.random()`.

### Core interfaces

The exact naming can change, but these capabilities should be explicit:

```ts
interface RandomSource {
  next(): number;
  integer(minInclusive: number, maxInclusive: number): number;
  shuffle<T>(values: readonly T[]): T[];
}

interface Clock {
  now(): number;
  today(): string;
}

interface SaveRepository {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
  export(data: SaveData): Promise<string>;
  parseImport(serialized: string): Promise<SaveData>;
}

interface CollectibleCatalog {
  get(id: CollectibleId): CollectibleDefinition | undefined;
  list(): readonly CollectibleDefinition[];
  version(): string;
}
```

Production adapters provide seeded or cryptographically unnecessary normal randomness, the system clock, `localStorage`, and repository content. Tests provide deterministic implementations.

### Explicit application states

At minimum, model navigation and game lifecycle explicitly.

```text
onboarding
home
setup
playing.ready
playing.answering
playing.feedback
results
capsule.reveal
gallery
settings
```

The reducer or state machine must reject invalid transitions, including:

- Answering twice during feedback.
- Starting a second timer.
- Opening a capsule without sufficient currency.
- Equipping an unowned collectible.
- Completing a session more than once.

### Stable identifiers

- Operation IDs are code-stable values such as `addition`.
- Skill IDs are stable facts such as `addition:7+6` after commutative normalization rules are defined.
- Collectibles use `pack-id:item-id`.
- Personal-best keys are generated from a canonical settings fingerprint.
- Released identifiers are never reused for different meanings.

## Proposed repository structure

```text
src/
  app/
    App.tsx
    routes.ts
    state.ts
  domain/
    game/
    math/
    scoring/
    rewards/
    progress/
  adapters/
    browserClock.ts
    localStorageSaveRepository.ts
    randomSource.ts
  content/
    schema.ts
    catalog.ts
    packs/
  features/
    onboarding/
    setup/
    play/
    results/
    capsule/
    gallery/
    settings/
  components/
  styles/
  dev/
    StateGallery.tsx
  main.tsx
tests/
  fixtures/
  properties/
  e2e/
  visual/
scripts/
  validate-content.ts
```

Folders should be introduced only when needed; this is a target shape, not a requirement to create empty directories.

## Milestone 0: Engineering foundation

### Deliverables

- Vite React TypeScript scaffold.
- Strict TypeScript configuration.
- ESLint and formatting configuration.
- Vitest unit-test setup.
- Property-test dependency and first example.
- Vitest Browser Mode component-test setup.
- Playwright configuration.
- Accessibility integration.
- GitHub Actions verification workflow.
- Production build and GitHub Pages base-path strategy.
- Initial PWA manifest configuration.
- `npm run verify` orchestration command.
- Development-only UI state gallery entry.

### Acceptance criteria

- A clean checkout can install dependencies and run `npm run verify` successfully.
- CI runs the same authoritative checks.
- The app opens in development and production preview.
- One sample unit test, browser component test, end-to-end test, visual snapshot, and accessibility scan pass.
- The state gallery is unavailable from a production build unless explicitly enabled for test preview.

## Milestone 1: Deterministic domain core

### Deliverables

- Seedable random source.
- Fake and system clocks.
- Addition problem generator.
- Difficulty configuration representation.
- Operation-specific distractor strategies.
- Session construction and operation balancing contract.
- Answer evaluation.
- Basic score calculation.
- Currency award calculation.
- Collectible catalog schema and validation.
- Capsule selection with rarity weights and duplicate protection.
- Save schema version 1 and in-memory repository.

### Acceptance criteria

- The same seed and settings always generate the same session and capsule result.
- Generated answers satisfy every mathematical invariant.
- Correct-answer positions are approximately balanced across a large deterministic sample.
- Capsule selection never returns an owned item while an eligible unowned item remains.
- A Special Guest can pass through the same reward and inventory APIs as a cat.
- Malformed catalog entries fail validation during verification.
- Domain modules have complete or near-complete branch coverage.

## Milestone 2: Playable question loop

### Deliverables

- Onboarding and starter choice.
- Remembered setup.
- Question screen.
- Large answer cards.
- Count-up timer.
- Answer lock and feedback transition.
- Previous-answer ribbon.
- Session completion and results.
- Responsive phone and tablet layouts.
- Semantic labels and keyboard support.

### Acceptance criteria

- A player can complete the ten-question addition flow using touch, mouse, or keyboard.
- A rapid double tap cannot answer two questions.
- The first selected answer is the scored answer.
- The feedback state lasts a controlled deterministic interval.
- The timer excludes paused time when pause is introduced.
- Correctness is never conveyed through color alone.
- The flow works at target phone and tablet viewports without horizontal scrolling.
- Critical states pass automated accessibility scans and manual keyboard review.

## Milestone 3: Persistence and reward loop

### Deliverables

- Versioned browser save repository.
- Save migration entry point.
- Session summary persistence.
- Paw Coin award and spending.
- Capsule opening and reveal.
- Unified gallery.
- Locked silhouettes.
- Guest badge and filter.
- Equip action and home-screen companion.
- Reload recovery.

### Acceptance criteria

- Reloading at every safe navigation point preserves committed progress.
- Interrupted writes do not produce a partially valid save.
- A capsule cannot be opened without sufficient currency.
- Every successful capsule transaction is atomic: currency is spent exactly once and ownership is granted exactly once.
- Owned and equipped IDs resolve against the bundled catalog.
- New catalog items appear as unowned without save migration.
- Removed or unknown legacy IDs do not crash the application.

## Milestone 4: Production PWA slice

### Deliverables

- Service worker and offline precache.
- Safe update-available prompt.
- Deferred update activation during active play and reward reveals.
- App icons and install metadata.
- Offline production-preview tests.
- GitHub Pages workflow.
- ~~JSON export/import UI.~~ Complete backup download/share and confirmed restore are available on existing and brand-new devices.
- Initial install and real-device checklists.

### Acceptance criteria

- After one online load, the production app launches and completes a game offline.
- Deploying a new catalog version preserves the save and exposes new unowned content after update.
- An update never reloads an active session.
- Export, reset, import, and reload restore the same meaningful progress.
- The GitHub Pages build works under the repository subpath.
- Physical iPhone and iPad smoke checks are documented and completed before calling the slice done.

## Expansion after the vertical slice

Add one independently verified slice at a time:

1. ~~Subtraction, including nonnegative constraints and borrow-aware difficulty.~~ Completed in ruleset version 4.
2. ~~Multiplication with curated table presets and constrained session composition.~~ Completed in ruleset version 3.
3. ~~Division generated from divisor and quotient with explicit low-challenge limits.~~ Completed in ruleset version 3.
4. ~~Mixed operations with balanced short-session coverage.~~ Completed.
5. Practice mode retry and hint representations.
6. Time Rush and Endless.
7. Per-skill mastery and guided-random weighting.
8. ~~Question-level round review and bounded local play history.~~ Completed with a 30-round detailed window and lifetime aggregates. A richer progress dashboard remains future work.
9. Weekly three-day goal and daily completion bonus.
10. Direct-purchase shop and tuned rarity economy.
11. Improvement Duel after at least five comparable sessions.
12. Final collectible art and expanded repository packs.
13. Optional speech and sound. The synthesized contextual-effects pass and development Sound Lab are complete; subjective cue refinement, music, and spoken problems remain future work.

Each operation must ship with its generator invariants, distractor rules, difficulty tests, UI behavior, progress aggregation, and end-to-end coverage. “Adding the operation” is not complete when only the equation generator exists.

## Content-update workflow

When adding a cat or Guest:

1. Choose a permanent stable ID.
2. Add the catalog definition, art, thumbnail, alt text, rarity, capsule weight, shop price, and personality.
3. Run content validation and asset-size checks.
4. Confirm gallery card, silhouette, shop preview, capsule reveal, equipped state, and narrow-layout rendering in the state gallery.
5. Run the capsule statistical tests with the expanded pool.
6. Decide whether to bundle ordinary cats with a new Special Guest so rarity weighting remains meaningful for established players.
7. Build and test the update path using an older save fixture.
8. Deploy only after verification passes.

## Completion policy

A feature is complete only when:

- Behavior and edge cases are defined.
- Domain logic is tested.
- Component states are represented in the state gallery where visual.
- Critical user behavior has an end-to-end test.
- Accessibility implications are checked.
- Save compatibility is considered.
- Phone and tablet layouts are inspected.
- Documentation is updated when the feature changes a durable decision.

## First implementation decision point

The next authorized build task should be Milestone 0 followed by Milestone 1. The first application UI should not be built until deterministic randomness, clocks, storage contracts, test runners, and the content schema exist.

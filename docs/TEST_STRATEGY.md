# Testing Strategy

## Purpose

The goal is not merely high coverage. The goal is confidence that mathematical generation, timing, progress, rewards, persistence, responsive interaction, accessibility, offline behavior, and content updates work as specified—and that failures are reproducible.

Related references:

- [Research and product design](../DESIGN_RESEARCH.md)
- [Implementation plan](./IMPLEMENTATION_PLAN.md)
- [Problem generation and session composition](./PROBLEM_GENERATION.md)

## Quality goals

1. Every random failure can be reproduced from a seed.
2. Every time-dependent behavior can be tested without waiting for real time.
3. Every persisted-data behavior can run against an in-memory repository and realistic browser storage.
4. Every important visual state can be opened directly without manipulating production data manually.
5. Every critical player journey runs in an actual browser.
6. Mathematical and economic invariants are exercised across thousands of generated cases.
7. Phone and tablet regressions are detectable in CI.
8. Automated accessibility checks are supplemented by keyboard, zoom, motion, and real-device review.
9. The production PWA—not only the development server—is tested offline and through updates.
10. One command represents the repository's complete required verification.

## What “test every aspect” means

Testing is divided by risk rather than forcing all behavior through one tool.

| Concern | Primary technique |
| --- | --- |
| Arithmetic correctness | Unit and property-based tests |
| Distractor validity | Property-based tests and statistical checks |
| Session state transitions | Reducer/state-machine unit tests |
| Timers and calendar logic | Fake-clock tests |
| Scoring, mastery, handicap | Deterministic domain tests |
| Rarity and capsule behavior | Property, invariant, and statistical tests |
| Save compatibility | Schema, migration, fuzz, and round-trip tests |
| Component interaction | Real-browser component tests |
| Complete player journeys | Playwright end-to-end tests |
| Layout and appearance | State gallery, visual snapshots, direct inspection |
| Accessibility | axe-core, semantic interaction tests, manual review |
| Offline and update behavior | Production-preview PWA tests and real devices |
| Engagement and comprehension | Observed play-testing |

## Required testability architecture

### Seeded randomness

No domain code calls `Math.random()` directly. A `RandomSource` is injected into:

- Problem selection.
- Operand generation.
- Distractor generation.
- Answer ordering.
- Mixed-operation balancing.
- Capsule selection.
- Any future daily challenge.

Every randomized test logs its seed on failure. A reported production session should eventually be reproducible from saved diagnostic metadata without storing sensitive information.

### Injectable clock

No domain code calls `Date.now()`, `new Date()`, or timer APIs directly. A `Clock` is injected for:

- Response duration.
- Session duration.
- Daily completion bonus.
- Weekly goal boundaries.
- History windows.
- Mastery spacing.
- Save/export timestamps.
- Improvement baseline windows.

UI transitions should use a small scheduler abstraction or framework-compatible fake timers so tests can advance the configured feedback interval instantly and deterministically.

### Replaceable persistence

The save repository has at least:

- In-memory implementation for unit and component tests.
- Versioned `localStorage` implementation for production.
- Fixture helpers for Playwright.

Tests must never depend on execution order or a developer's existing browser storage.

### Pure calculations

The following modules remain free of React and browser dependencies:

- Generators and distractors.
- Session planning.
- Answer evaluation.
- Scoring.
- Currency awards.
- Capsule weighting.
- Inventory transitions.
- Mastery updates.
- Progress aggregation.
- Improvement Duel calculation.
- Save migration and validation.

### Development UI state gallery

A development-only entry renders important component and page states using deterministic fixtures.

Initial state-gallery coverage:

- Answer card: idle, hover/focus, pressed, correct, incorrect, disabled.
- Question page: ready, answering, feedback-correct, feedback-incorrect, final question.
- Previous-answer ribbon variants.
- Timer at short, normal, and long durations.
- Results: first session, personal best, accuracy improvement, pace improvement, no improvement.
- Collectible cards for every rarity.
- Cat and Guest badges.
- Owned, equipped, and locked silhouettes.
- Empty, partial, and complete gallery.
- Capsule closed, opening, Common reveal, Special reveal, collection complete.
- Save missing, save invalid, import preview, import error.
- Offline-ready and update-available messages.
- Very long display and collectible names.
- Large arithmetic values and negative-answer presentation.
- Reduced-motion state.

The gallery serves three purposes:

1. Fast human visual inspection.
2. Stable visual-regression targets.
3. Direct reproduction of rare states that would otherwise require extensive setup.

It is excluded from normal production navigation and contains no privileged production behavior.

## Test layers

### 1. Static verification

Run on every change:

- TypeScript strict type checking.
- ESLint.
- Formatting check.
- Build-time content schema validation.
- Broken asset-reference detection.
- Production build.

Static verification should fail on unused test escapes, accidental `any` in domain modules, unresolved catalog assets, duplicate collectible IDs, or an invalid PWA manifest.

### 2. Unit tests

Use Vitest for small deterministic units.

Required suites include:

- Random-source determinism and bounds.
- Clock and calendar boundaries.
- State transitions and invalid-event rejection.
- Scoring edge cases.
- Currency calculation.
- Inventory operations.
- Capsule preconditions.
- Personal-best fingerprinting.
- Save serialization, validation, and migrations.
- Catalog lookup and stable identity.

Prefer table-driven tests for known boundary examples and focused tests for error behavior.

### 3. Property-based tests

Use `fast-check` with Vitest for high-volume generated inputs.

#### Problem-generation properties

- Correct answer equals the mathematical result.
- Exactly one answer choice is correct.
- Answer choices are unique.
- Correct answer position is within bounds.
- Operands and result respect the selected difficulty.
- Nonnegative subtraction never produces a negative result.
- Division never uses zero as the divisor.
- Whole-number division has no remainder.
- Mixed sessions contain each selected operation when length permits.
- No accidental duplicate equations appear unless remediation requests them.
- Multiplication/division rounds satisfy the versioned low-challenge, focus, identity, zero, unit-divisor, and table-variety limits.
- Addition/subtraction rounds satisfy the versioned low-challenge, regrouping, borrowing, negative-answer, repeated-answer, and identity limits.
- Every supported operation combination and question count can be composed without partial output or an unbounded retry loop.
- Ruleset version, settings, and seed reproduce the exact fact schedule, distractors, and answer order.

#### Statistical checks

Statistical tests should use fixed seeds and generous, mathematically justified tolerances. They should detect gross bias without becoming flaky.

- Correct-answer positions are approximately uniform.
- Operation coverage is approximately balanced.
- Multiplication/division focus-band frequencies increase as specified by difficulty.
- Addition/subtraction carrying, borrowing, and Advanced negative-answer frequencies match their exact composition targets.
- Large fixed-seed samples never exceed per-round trivial-fact or table-value limits.
- Capsule outcomes reflect rarity weights over a broad unowned pool.
- Guided-random weighting favors weak skills without starving normal coverage.

Statistical distribution tests do not replace exact invariant tests.

Session-composition limits are exact invariants, not statistical aspirations. Statistical tests measure the variation that remains inside those limits and detect unintended concentration across many otherwise valid rounds.

#### Save/import fuzzing

Generate missing, extra, malformed, extreme, and legacy fields. The importer must either produce valid normalized save data or return a controlled validation error; it must never partially replace the active save.

### 4. Real-browser component tests

Use Vitest Browser Mode for components where actual DOM, CSS, focus, and browser APIs matter. Vitest recommends Browser Mode for accurate component testing because it catches layout, event, focus, and browser behavior that simulated DOM environments can miss ([Vitest component testing](https://vitest.dev/guide/browser/component-testing)).

Test components through public behavior:

- Accessible role and name.
- Visible text and state.
- Pointer and keyboard action.
- Focus movement.
- Emitted event or rendered outcome.

Avoid asserting private React state, implementation-specific class names, or component internals. Testing Library's guiding principle is that tests should resemble how software is used ([Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/)).

### 5. End-to-end tests

Use Playwright against a production-like server for player journeys.

Initial critical journeys:

1. First launch → name → starter → home.
2. Configure → complete correct/incorrect questions → results.
3. Replay with remembered settings.
4. Earn coins → open capsule → gallery → equip.
5. Reload and restore.
6. Export → reset → import → restore.
7. Keyboard-only completion.
8. Offline reload and play after initial caching.
9. Update available during a round → defer → update safely afterward.
10. Load an older save against a catalog containing new items.
11. Results → review all or missed questions → return to results.
12. History → review a retained round → clear play history without clearing rewards or settings.

Playwright projects should include at minimum:

- Desktop Chromium.
- Desktop Firefox.
- Desktop WebKit.
- Representative small phone viewport.
- Representative large phone viewport.
- Representative tablet portrait.
- Representative tablet landscape.

Playwright supports projects across Chromium, Firefox, WebKit, and emulated mobile/tablet devices ([Playwright projects](https://playwright.dev/docs/test-projects)). Emulation is regression coverage, not a claim that desktop WebKit exactly equals a physical iPad.

### 6. Visual regression

Use Playwright screenshot comparisons for stable state-gallery pages and a small set of complete screens. Playwright produces reference images and compares later runs against them ([Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)).

Good snapshot targets:

- Onboarding.
- Setup.
- Question answering and feedback states.
- Results.
- Round review with correct and incorrect answers.
- Capsule reveal.
- Gallery partial/complete.
- Shop.
- Progress overview.
- Offline/update prompts.
- State-gallery rarity and component matrices.

Stability rules:

- Run baselines in the same pinned CI environment.
- Use deterministic fonts and assets.
- Freeze time and randomness.
- Disable or complete animation before capture.
- Mask only truly irrelevant volatile content.
- Review baseline changes as product changes, never update them blindly.

Visual snapshots catch unintended changes; they do not determine whether a design is good. Direct visual inspection remains required.

### 7. Accessibility testing

Run axe-core after each major visible state is opened. Axe supports automated checks for WCAG rules and integrates into browser test infrastructure, but its own documentation estimates automated detection at roughly 57% of WCAG issues ([axe-core](https://github.com/dequelabs/axe-core)).

Automated checks:

- Accessible names.
- Valid roles and ARIA.
- Contrast where measurable.
- Landmark and heading structure.
- Image alternative text.
- Form labels.
- Common focus and semantic errors.

Manual checks:

- Complete every flow by keyboard.
- Visible focus at all times.
- Logical focus after feedback and navigation.
- Zoom to 200% and reflow.
- Text-size increase.
- Color-independent correctness indicators.
- Reduced motion.
- Screen-reader announcements that do not overwhelm rapid play.
- Large touch targets and spacing.
- Speech-disabled full functionality.

### 8. PWA and offline testing

PWA tests must run against a production build because service workers and caching behavior differ from the Vite development server.

Automated scenarios:

- Manifest and icons resolve under the GitHub Pages base path.
- Service worker registers.
- App shell and collectible assets become cached.
- Reload works with network disabled.
- A complete game works offline.
- Save writes continue offline.
- Returning online exposes an update.
- Update activation is deferred during a game or reward reveal.
- A new catalog version resolves old owned IDs and adds unowned items.

Service-worker tests should isolate their browser context and clean up registrations/caches so they do not leak into other tests.

### 9. Real-device testing

Before a milestone is called device-ready, run the checklist on at least one current iPhone and iPad:

- Open through Safari and add to Home Screen.
- Launch in standalone mode.
- Confirm icons, splash/background, and safe-area spacing.
- Play portrait and landscape where supported.
- Background and foreground during a game.
- Lock and unlock the device during a game.
- Kill and relaunch the app.
- Play offline.
- Install an update without losing progress.
- Export and share a save file.
- Import a save file.
- Verify touch target comfort and accidental-tap resistance.
- Check sound/mute and, when implemented, speech pronunciation.
- Observe performance on the oldest supported device available.

These checks require a person with the physical device. Browser emulation reduces risk but does not replace them.

### 10. Observed play-testing

Short play sessions should answer questions automation cannot:

- Can a new player start without explanation?
- Are operation and table settings understandable?
- Is the answer transition too fast or slow?
- Is the previous-answer ribbon noticed?
- Does the player guess rapidly to exploit scoring?
- Are hints helpful or patronizing?
- Does the collectible loop motivate another useful round?
- Are coin rewards too slow, too fast, or confusing?
- Do locked silhouettes and shop reveals create curiosity?
- Does the active companion distract from arithmetic?

Record observations, not only opinions. Hesitation, repeated taps, ignored messages, and requests for help are more actionable than “liked it.”

## Coverage policy

Coverage is a guardrail, not a quality score.

Recommended initial targets:

- Domain modules: 100% statements/functions and at least 95% branches, with documented exceptions.
- Save validation and migrations: 100% branches.
- Problem and distractor generators: 100% branches plus property tests.
- Reward and currency transactions: 100% branches.
- React/application code: an aggregate threshold can begin around 80%, but critical behavior must be covered regardless of the number.
- End-to-end: every critical journey and every production incident regression.

Do not add low-value assertions merely to raise coverage. A covered line without a meaningful expected outcome provides weak protection.

### Mutation testing

After the domain stabilizes, consider running mutation testing on math, scoring, economy, and migration modules. A mutation tool deliberately changes operators or conditions and checks whether tests fail. This is more useful than continually increasing raw coverage once domain coverage is already high.

Mutation testing can be slower, so it may run manually or on a scheduled CI job rather than every push.

## Test data and fixtures

Maintain named, version-controlled fixtures:

- Brand-new player.
- Player after one session.
- Perfect and low-accuracy sessions.
- Complete collection.
- Collection missing one Common item.
- Collection missing one Special Guest.
- Five-session Improvement Duel baseline.
- Previous save schema versions.
- Unknown legacy collectible ID.
- Maximum-length names.
- Thirty retained detailed rounds plus archived lifetime aggregates at the retention boundary.
- A legacy save with more than thirty detailed rounds migrating into bounded history.

Fixture creation should use builders or factories rather than hand-copying large JSON blobs. Published legacy fixtures remain immutable so migration behavior stays verifiable.

## CI design

### Required pull-request job

Run:

1. Dependency install from lockfile.
2. Formatting check.
3. Lint.
4. Type check.
5. Content validation.
6. Unit and property tests with coverage.
7. Production build.
8. Critical Chromium end-to-end tests.
9. Accessibility smoke tests.

### Broader browser job

Run on pull requests when practical, otherwise on `main`:

- Firefox and WebKit critical journeys.
- Mobile and tablet projects.
- Visual regression.
- Offline/PWA scenarios.

### Scheduled/manual job

- Large property-test sample sizes.
- Mutation testing.
- Full browser/device matrix.
- Dependency and bundle-size review.

CI should upload Playwright traces, screenshots, console logs, and test reports on failure so problems can be diagnosed without rerunning blindly.

## Standard commands

The exact package scripts can be finalized during scaffolding. The target interface is:

```text
npm run dev             local development
npm run build           production build
npm run preview         production preview
npm run typecheck       strict TypeScript
npm run lint            lint
npm run format:check    formatting verification
npm run test            unit and property tests
npm run test:browser    browser component tests
npm run test:e2e        Playwright critical journeys
npm run test:visual     visual regression
npm run test:pwa        production offline/update tests
npm run test:coverage   coverage report and thresholds
npm run content:check   content schema and asset validation
npm run verify          required complete local verification
```

Developers should be able to run a fast focused command while iterating and `npm run verify` before handing off a completed change.

## Visual inspection capability

No application dependency is required solely to let an automated collaborator see the interface. A local server can be opened and interacted with through the browser, including screenshots and viewport changes.

The application should nevertheless provide the state gallery and deterministic fixtures because they make visual inspection comprehensive and reproducible. Without them, rare states such as a Special reveal, corrupt import, collection completion, or deferred PWA update would be expensive to reach consistently.

## Limitations and honest confidence

The automated suite can provide strong evidence that specified behavior is correct. It cannot prove:

- That an unspecified behavior is desirable.
- That a child understands the interface.
- That rewards remain motivating over weeks.
- That every physical Safari/PWA quirk is covered by WebKit emulation.
- That every screen-reader experience is good merely because axe passes.
- That device speech sounds natural.

Those boundaries are handled with explicit real-device and observed-play checklists rather than pretending automation covers them.

## Initial testing deliverable

The first engineering task should demonstrate the complete testing pipeline with intentionally small examples:

- One pure unit test.
- One seeded property test.
- One real-browser component test.
- One Playwright journey.
- One screenshot baseline.
- One axe scan.
- One production-build offline test.
- One CI workflow running the required subset.

Once those examples work in a clean checkout, application behavior can be built through the same paths rather than retrofitting testability later.

# First Math Game

An offline-first, multiple-choice arithmetic PWA designed for short, engaging practice sessions on phones and tablets.

The first playable vertical slice is implemented. It includes onboarding, a starter companion, configurable mixed-operation rounds, four difficulty levels, scoring and Paw Coins, a duplicate-protected capsule, a collection gallery, equipping companions, local persistence, and offline PWA support.

## Project documents

- [Research and product design](./DESIGN_RESEARCH.md) — learning research, product principles, game modes, difficulty, scoring, progress, collectible economy, technical options, and confirmed design decisions.
- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md) — delivery sequence, first vertical slice, acceptance criteria, architecture boundaries, and milestone definitions.
- [Testing strategy](./docs/TEST_STRATEGY.md) — testability requirements, automated test layers, visual inspection, accessibility, PWA/device verification, coverage policy, and CI design.
- [Adding collectible content](./docs/ADDING_CONTENT.md) — the catalog, asset, rarity, and validation workflow for new companions.
- [Companion identity, themes, and presence](./docs/COMPANION_SYSTEM.md) — the species-neutral content model, per-companion themes, interface placements, and rollout sequence.
- [Companion personality, dialogue, and motion](./docs/COMPANION_PERSONALITY.md) — phrase contexts, voice profiles, repetition rules, CSS motion and motifs, Companion Lab, safety principles, and the implementation sequence.
- [Collectible art direction](./docs/COLLECTIBLE_ART.md) — the SVG/raster strategy, Art Lab bake-off, style bible, generation workflow, and final-art acceptance criteria.
- [The Nook Neighbors collection](./docs/NOOK_NEIGHBORS.md) — the first ten-cat roster, dual-style character recipes, existing-SVG review, and production sequence.
- [Nook Neighbors Sticker anchors](./docs/NOOK_NEIGHBORS_STICKER_ANCHORS.md) — the first Biscuit and Aurora raster candidates, exact prompts, and approval notes.
- [Nook Neighbors Sticker batch](./docs/NOOK_NEIGHBORS_STICKER_BATCH.md) — the remaining seven first-pass portraits, exact prompts, and collection review notes.
- [Button Bunny Sticker](./docs/BUTTON_BUNNY_STICKER.md) — the first Special Guest raster portrait, exact prompt, reference lineage, and production decision.
- [Economy tuning](./docs/ECONOMY.md) — current Paw Coin earnings, daily limits, capsule pricing, rationale, and safe tuning points.
- [Balance analysis](./docs/BALANCE_ANALYSIS.md) — play-history export fields, comparison workflow, simulation strategy, and controls for stable tuning.
- [Round review and history retention](./docs/PLAY_HISTORY.md) — question review, bounded detailed history, lifetime aggregates, migration, exports, and clearing test data.
- [Save backup and restore](./docs/SAVE_BACKUP.md) — complete local backup contents, safe import confirmation, schema migration, and analysis-export separation.
- [Sound effects and Sound Lab](./docs/AUDIO.md) — synthesized cue architecture, current gameplay wiring, device settings, listening workflow, and future music options.
- [Problem generation](./docs/PROBLEM_GENERATION.md) — constrained-random session composition, difficulty bands, variety limits, versioning, and acceptance criteria.
- [Addition and subtraction generation](./docs/ADDITION_SUBTRACTION_GENERATION.md) — carrying, borrowing, identity, negative-answer, and variety rules introduced in ruleset version 4.

## Current direction

- React, TypeScript, and Vite.
- Static deployment to GitHub Pages.
- Installable PWA with offline play.
- Addition, subtraction, multiplication, division, and mixed-operation sessions.
- Local player name, progress, mastery, scores, and JSON backup/restore.
- Cat-centered but species-flexible companions, rarity, capsules, direct purchase, per-companion themes, and a unified gallery.
- No backend, account, advertising, analytics, or real-money purchases.

## Current status

Milestones 0 and 1 and the first end-to-end slice are in place. Addition, subtraction, multiplication, division, constrained version 3 multiplication/division composition, constrained version 4 addition/subtraction composition, the version 5 signed-distractor correction, the version 6 Advanced short-round correction, and the version 7 global low-challenge budget are playable across Easy through Advanced difficulties and 10–50 question rounds. Completed rounds can be reviewed question by question, while the newest 30 rounds retain full detail and older rounds remain in compact lifetime statistics. Complete progress can be backed up and restored on an existing or brand-new device. First-run onboarding now presents all three starters as a deliberate, themed choice without adding a tutorial sequence, and the new-player Home gives the first round its own clear invitation and reward-loop explanation. Synthesized cues now accompany round launch, answers, results coins, capsule opening, unavailable capsules, and companion changes; a development Sound Lab supports detailed experimentation and copyable recipes. Catalog version 2.2 contains the complete ten-cat Nook Neighbors roster plus Button Bunny, with dual Classic/Sticker art for all eleven companions, species-neutral collection metadata, and accessible companion themes. Sticker art is the default, equipped companions influence the interface palette, link directly from the polished home presentation, and receive a collection spotlight with overall and per-collection progress. The species-neutral Companion Capsule and repeatable Art and Theme Labs support continued expansion. A pure companion-personality engine provides 128 validated contextual phrases, deterministic selection, truthful result priorities, repetition protection, token rendering, and personality definitions for all eleven companions. The development Companion Lab exposes those systems through responsive scenario previews, CSS motion and motif experiments, reduced-motion and large-text stress states, copyable JSON, and Draw 50 diagnostics. Stable, motion-aware companion dialogue now appears in all six initial contexts: Home, Game Setup, Round Results, idle Capsule, equip confirmation, and Play History, with a warmer first-person voice and result claims derived from retained progress rather than UI guesswork. Production Sticker WebPs total less than 750 KiB and use starter precaching plus on-demand caching for the remaining collection. The automated suite covers deterministic math and composition rules, companion dialogue and content validation, rewards, save migration and round-trips, history retention, audio scheduling and controls, real-browser components, the complete player journey, accessibility, phone/tablet layouts, and production offline reloads. The PWA is deployed through GitHub Pages while active play-testing continues.

## Run locally

Node.js 24 is used in CI. Install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Run all required checks before committing:

```sh
npx playwright install chromium
npm run verify
```

Useful focused commands are documented in the [testing strategy](./docs/TEST_STRATEGY.md#standard-commands). Development-only inspection routes include the state gallery at `/?dev=states`, Sound Lab at `/?dev=sounds`, Art Lab at `/?dev=art`, Theme Lab at `/?dev=themes`, and Companion Lab at `/?dev=companions`.

## Deploy

Before the first deployment, open the repository's **Settings → Pages** page and select **GitHub Actions** under **Build and deployment → Source**. This one-time step creates the Pages site used by the deployment action; without it, `actions/configure-pages` returns a `404 Not Found` error.

GitHub Pages is available for public repositories on GitHub Free. A private repository requires a plan that includes Pages for private repositories, such as GitHub Pro; the published site itself is still public for a personal-account project. If the Pages source control is unavailable for a private repository, make the repository public or use an eligible plan.

After Pages is enabled, pushing to `main` runs verification and deploys the app. The deployment workflow can also be run manually from the Actions tab.

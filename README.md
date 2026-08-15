# First Math Game

An offline-first, multiple-choice arithmetic PWA designed for short, engaging practice sessions on phones and tablets.

The first playable vertical slice is implemented. It includes onboarding, a starter companion, configurable mixed-operation rounds, four difficulty levels, scoring and Paw Coins, a duplicate-protected capsule, a collection gallery, equipping companions, local persistence, and offline PWA support.

## Project documents

- [Research and product design](./DESIGN_RESEARCH.md) — learning research, product principles, game modes, difficulty, scoring, progress, collectible economy, technical options, and confirmed design decisions.
- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md) — delivery sequence, first vertical slice, acceptance criteria, architecture boundaries, and milestone definitions.
- [Testing strategy](./docs/TEST_STRATEGY.md) — testability requirements, automated test layers, visual inspection, accessibility, PWA/device verification, coverage policy, and CI design.
- [Adding collectible content](./docs/ADDING_CONTENT.md) — the catalog, asset, rarity, and validation workflow for new cats and Special Guests.
- [Economy tuning](./docs/ECONOMY.md) — current Paw Coin earnings, daily limits, capsule pricing, rationale, and safe tuning points.
- [Balance analysis](./docs/BALANCE_ANALYSIS.md) — play-history export fields, comparison workflow, simulation strategy, and controls for stable tuning.
- [Round review and history retention](./docs/PLAY_HISTORY.md) — question review, bounded detailed history, lifetime aggregates, migration, exports, and clearing test data.
- [Problem generation](./docs/PROBLEM_GENERATION.md) — constrained-random session composition, difficulty bands, variety limits, versioning, and acceptance criteria.
- [Addition and subtraction generation](./docs/ADDITION_SUBTRACTION_GENERATION.md) — carrying, borrowing, identity, negative-answer, and variety rules introduced in ruleset version 4.

## Current direction

- React, TypeScript, and Vite.
- Static deployment to GitHub Pages.
- Installable PWA with offline play.
- Addition, subtraction, multiplication, division, and mixed-operation sessions.
- Local player name, progress, mastery, scores, and JSON backup/restore.
- Cat-centered collectibles with non-cat Guests, rarity, capsules, direct purchase, and a unified gallery.
- No backend, account, advertising, analytics, or real-money purchases.

## Current status

Milestones 0 and 1 and the first end-to-end slice are in place. Addition, subtraction, multiplication, division, constrained version 3 multiplication/division composition, constrained version 4 addition/subtraction composition, the version 5 signed-distractor correction, the version 6 Advanced short-round correction, Easy through Advanced difficulties, and 10–50 question rounds are playable. Completed rounds can be reviewed question by question, while the newest 30 rounds retain full detail and older rounds remain in compact lifetime statistics. The automated suite covers deterministic math and composition rules, rewards, save migration and round-trips, history retention, real-browser components, the complete player journey, accessibility, phone/tablet layouts, and production offline reloads. The PWA is deployed through GitHub Pages while active play-testing continues.

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

Useful focused commands are documented in the [testing strategy](./docs/TEST_STRATEGY.md#standard-commands). The development-only state gallery is available at `/?dev=states`.

## Deploy

Before the first deployment, open the repository's **Settings → Pages** page and select **GitHub Actions** under **Build and deployment → Source**. This one-time step creates the Pages site used by the deployment action; without it, `actions/configure-pages` returns a `404 Not Found` error.

GitHub Pages is available for public repositories on GitHub Free. A private repository requires a plan that includes Pages for private repositories, such as GitHub Pro; the published site itself is still public for a personal-account project. If the Pages source control is unavailable for a private repository, make the repository public or use an eligible plan.

After Pages is enabled, pushing to `main` runs verification and deploys the app. The deployment workflow can also be run manually from the Actions tab.

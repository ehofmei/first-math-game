# Round Review and Play-History Retention

Number Nook keeps useful long-term progress without allowing detailed question history to grow forever. Everything remains local to the device unless the player explicitly copies, downloads, exports, or imports data.

## Round review

The results screen includes **Review questions**. The Play History screen also includes **Review round** for every retained detailed round.

Review shows:

- The original equation and its position in the round.
- The selected answer and correct answer.
- Whether the answer was correct.
- Response time and score for that question.
- Round-level correct count, missed count, and thinking time.

When a round has missed answers, review opens with those answers filtered so the player can immediately see what deserves attention. The player can switch to all questions at any time. A perfect round opens with all questions visible.

Every review opens at the top of the page, independent of the scroll position on Play History.

Review is intentionally reflective rather than punitive. It does not change the score, award or remove Paw Coins, alter streaks, or ask the player to repeat a mistake.

## Bounded detailed history

Save schema version 4 retains the newest 30 completed rounds with full question-level detail. Completing round 31 archives the oldest detailed round into additive lifetime totals and keeps rounds 2–31 in detail.

Archived totals preserve:

- Rounds, questions, correct answers, score, and response time overall.
- The same totals by ruleset, difficulty, operation, and exact configuration.
- Lifetime high score for each exact configuration.

An exact configuration includes the ruleset version, normalized operation set, difficulty, and question count. Ruleset versions are never silently pooled.

The compact archive cannot reproduce an old question, answer-choice order, individual response-time distribution, or median. Consequently:

- Only the newest 30 rounds can be opened in round review.
- Lifetime averages are weighted from exact additive totals.
- Configuration medians in the analysis export are explicitly labeled as applying only to retained detailed rounds.

This design gives balance analysis a useful recent window while keeping browser storage predictable.

Recent detailed rounds appear before the per-setup analytics grid. The page shows the newest five detailed rounds and six setup configurations initially; each section can be expanded independently. This prevents either a long play history or a large variety of play-test setups from making the page difficult to scan.

## Analysis export version 3

The Play History analysis export includes:

- Lifetime overall, ruleset, configuration, difficulty, and operation summaries.
- A `retention` object stating the detailed limit, retained count, and archived count.
- Full settings, equations, choice order, selections, timing, scoring, and coin effects for the newest 30 rounds.
- Capsule economy events retained by the save.

The analysis export excludes the player name, account identifiers, installation identifiers, and device identifiers. It remains formatted for human inspection and sharing. The app's internal `localStorage` representation is compact JSON to avoid spending space on indentation.

## Migration and clearing

Version 1, 2, and 3 saves migrate automatically to schema version 4. If an older save has more than 30 sessions, the oldest sessions are summarized during migration and the newest 30 retain their question details.

**Clear play history** uses a confirmation step and removes:

- Retained detailed rounds.
- Archived lifetime progress.
- Scores and configuration performance summaries derived from those records.

It preserves Paw Coins, the daily coin allowance state, companions, equipped companion, capsule events, player name, and game settings. This makes it useful for removing development play-test results without resetting collection progress.

The separate [Save backup and restore](./SAVE_BACKUP.md) screen is the recovery mechanism for moving all progress to another device. The Play History analysis JSON is an analysis artifact and cannot be imported as a save file.

## Verification contract

Automated tests cover:

- Archiving the oldest round at the 30-round boundary.
- Lifetime totals across retained and archived rounds.
- Schema version 3 migration with more than 30 sessions.
- Compact internal saves and readable full-save exports.
- Clearing history while preserving collection, currency, and settings.
- Entering review from results and history.
- Rendering every retained question and returning to the correct screen.
- Opening review at the top regardless of the prior history scroll position.
- Collapsing and expanding long recent-round and configuration lists.
- Copying a name-free, versioned analysis export.
- Phone layout for the empty-history controls.

When changing retention, aggregation, scoring, or review behavior, update this document, increment the appropriate data/export version, and add a regression test before relying on new play-test data.

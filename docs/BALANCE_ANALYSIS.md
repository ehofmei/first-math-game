# Balance Analysis

Number Nook keeps play data on the device. The Play History screen turns completed rounds into a readable history and a versioned JSON analysis bundle that can be copied into a development conversation or downloaded as a file.

The export intentionally excludes the saved player name and does not create an account, installation ID, advertising ID, or device fingerprint.

## What is recorded

For every completed round:

- Ruleset version and random seed.
- Completion timestamp.
- Selected operations, difficulty, and question count.
- Total score, score per question, accuracy, elapsed time, and response-time summaries.
- Potential Paw Coins and coins actually awarded after the daily cap.
- Every equation's operation, operands, answer choices and their order, selected answer, correct answer, correctness, response time, and awarded score.

For economy pacing:

- Current coin balance and owned collectible count.
- Capsule cost and daily-cap rules in effect when exporting.
- Capsule-opening timestamp, cost, reward ID, kind, and rarity.

The export also groups comparable rounds by operation set, difficulty, and question count. This prevents a 50-question mixed round from being directly averaged with a 10-question addition round.

## How to share a useful sample

1. Play several rounds using the configurations being evaluated.
2. Open **Your progress** from the home screen.
3. Choose **Copy analysis data**.
4. Paste the JSON into the development chat and briefly identify the player context separately, such as “adult familiar with elementary arithmetic” or “child entering fourth grade.” Do not add a child's name.

Five rounds per configuration is a reasonable first directional sample. It is not enough to declare the design balanced, but it exposes obvious ceilings, difficulty jumps, distractor problems, and score compression. Samples from adults help calibrate the scoring ceiling; samples from the intended child players are necessary to calibrate learning difficulty and motivation.

## Initial local play-test baseline

An initial local-only adult export contained 32 rounds and 410 questions. Twenty rounds and 290 questions used the current version 2 ruleset; older version 1 data remains useful for migration checks but should not be pooled into current balance averages.

The sample exposed session-composition problems rather than a biased random-number source:

- One ten-question Hard multiplication/division round used table value `11` in five questions: three multiplication facts and two division facts.
- One twenty-question Medium division round contained five identity facts such as `8 ÷ 8 = 1`, plus three zero-quotient facts.
- Simulations showed that a twenty-question Hard multiplication round contains about three questions involving `11` on average, and roughly three in five such rounds contain at least three.
- Current-rule Hard multiplication was nearly indistinguishable from Medium for the adult tester, while Advanced produced a clear jump.
- Incorrect division responses were faster than correct division responses in this small sample. That may indicate rapid recognition errors, visual misreading, or intentional testing; it should not be labeled a learner misconception without observation.
- The same `54 ÷ 9` fact was selected as `7` in three separate rounds. If those were genuine attempts, future mastery weighting and round review should respond to the pattern; if intentional, the events remain useful feedback-state tests but not difficulty evidence.

The conclusion is that independently uniform questions are not enough. The next generator revision uses constrained randomization with explicit focus bands, low-challenge limits, and table-variety constraints. See [Problem generation and session composition](./PROBLEM_GENERATION.md).

The same export also confirmed economy compression: on one local test day, 150 questions represented 164 potential Paw Coins, but the first two rounds consumed the entire 30-coin allowance. Economy tuning remains separate from problem-composition tuning so their effects can be measured independently.

## Primary comparisons

Use these in order:

1. Accuracy by configuration and operation.
2. Median and average response time for correct answers.
3. Score per question, not only raw score.
4. Wrong-answer patterns and whether a distractor repeatedly attracts careful players.
5. Variation within one player across repeated comparable rounds.
6. Coin potential versus coins awarded, capsules opened, and days required per collectible.
7. Qualitative notes: “too easy,” “frustrating,” “fun,” unclear controls, or guessing.

Accuracy and response time are useful empirical difficulty signals, but neither alone measures enjoyment or comprehension. Objective play data should be paired with short observations and player comments.

## Controls that keep balance stable

### Version every rules change

Every new session stores a ruleset version. Any change to number ranges, distractors, score timing, currency, or session construction must increment that version. Never pool results across versions without labeling them.

Configuration summaries must include ruleset version in their grouping key. The initial exporter did not do this consistently, so that correction is required before collecting version 3 comparisons.

### Maintain deterministic simulations

Seeded generation lets tests replay exact sessions. Property tests cover mathematical validity, whole-number division, negative-number constraints, unique answer choices, correct-position placement, and operation balance across thousands of generated problems.

Add benchmark simulations before changing scoring or difficulty:

- Perfect fast player.
- Perfect deliberate player.
- Player with a fixed accuracy and response-time distribution.
- Random guesser.
- Player systematically choosing each distractor category.

Store the expected score-per-question and coin ranges as tests. A deliberate rules change then requires an intentional benchmark update rather than silently shifting the economy.

### Use a configuration matrix

Collect samples for each difficulty with single operations before drawing conclusions about mixed mode. Then test representative combinations. Multiplication and division table ranges deserve separate scrutiny because their difficulty does not rise in the same way as multi-digit addition and subtraction.

### Prefer cohorts over one universal curve

Keep adult calibration, younger-child calibration, older-child calibration, and individual improvement separate. Adult data is valuable for the practical score ceiling and timing curve, but it cannot determine whether Easy or Medium feels appropriate to a learner.

### Freeze tuning windows

Gather a batch under one ruleset, review it, make a small set of changes, increment the ruleset, and gather another batch. Constantly adjusting values makes comparisons uninterpretable.

## High-value data not yet recorded

The next useful additions are:

- Abandoned rounds, including the question reached and time spent.
- Retry count when untimed Practice mode is added.
- Hint, visual-aid, speech, and pause use.
- Session type and time limit when Time Rush and Endless arrive.
- A one-tap optional post-round feeling such as **Too easy**, **Just right**, or **Too hard**.

These should remain local and appear in the same explicit export. Passive remote analytics are unnecessary for this family project.

# Balance Analysis

Number Nook keeps play data on the device. The Play History screen turns completed rounds into a readable history and a versioned JSON analysis bundle that can be copied into a development conversation or downloaded as a file.

The export intentionally excludes the saved player name and does not create an account, installation ID, advertising ID, or device fingerprint.

## What is recorded

For each of the newest 30 completed rounds:

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

The export also groups comparable rounds by operation set, difficulty, question count, and ruleset version. Lifetime additive totals remain available after an older round's question detail is retired. This prevents a 50-question mixed round from being directly averaged with a 10-question addition round while keeping local storage bounded. See [Round review and play-history retention](./PLAY_HISTORY.md).

Analysis export version 3 reports its retention window explicitly. Overall, ruleset, configuration, difficulty, and operation averages use lifetime weighted totals; configuration median response time uses only the retained detailed window and is labeled with that scope.

## How to share a useful sample

1. Play several rounds using the configurations being evaluated.
2. Open **Your progress** from the home screen.
3. Optionally open **Review round** to inspect any surprising questions.
4. Choose **Copy analysis data**.
5. Paste the JSON into the development chat and briefly identify the player context separately, such as “adult familiar with elementary arithmetic” or “child entering fourth grade.” Do not add a child's name.

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

### Version 3 simulation baseline

Before local play-testing, the constrained composer was run across 5,000 fixed seeds for each single-operation difficulty using twenty-question rounds.

| Difficulty | Low-challenge multiplication | Low-challenge division | Focus facts | Identity division per round | Highest observed table-value count |
| --- | ---: | ---: | ---: | ---: | ---: |
| Easy | 30% | 30% | Foundational pool | 0.54 | 7 of 20 |
| Medium | 10.1% | 10.0% | 50% | 0.54 | 5 of 20 |
| Hard | 5.1% | 5.0% | 60% | 0.27 | 4 of 20 |
| Advanced | 5.1% | 5.0% | 60% | 0.26 | 3 of 20 |

The exact per-round caps held for every simulated seed. These figures are engineering baselines, not proof of age-appropriate difficulty; local child play-testing remains necessary.

### Version 4 simulation baseline

The addition/subtraction composer was verified across 5,000 representative fixed-seed, twenty-question rounds: 625 rounds for each single-operation difficulty. It was also exercised across every supported operation combination and question count.

| Difficulty | Low-challenge range | Minimum focus | Advanced negative subtraction | Correct-answer cap |
| --- | ---: | ---: | ---: | ---: |
| Easy | exactly 4 of 20 | 6 of 20 | none | 4 of 20 |
| Medium | 0–2 of 20 | 8 of 20 | none | 4 of 20 |
| Hard | 0–2 of 20 | 12 of 20 | none | 4 of 20 |
| Advanced | 0–2 of 20 | 12 of 20 | exactly 6 of 20 subtraction questions | 4 of 20 |

All 5,000 simulated rounds satisfied arithmetic ranges, focus minimums, identity and sign limits, answer-frequency limits, and exact-fact uniqueness with zero composition failures. See [Addition and subtraction generation](./ADDITION_SUBTRACTION_GENERATION.md) for the classification rules. As with version 3, this is an engineering baseline; it does not substitute for observing whether the labels feel right to the intended players.

Ruleset version 5 retains this composition baseline and removes mirrored-sign answer pairs from Advanced subtraction. Version 4 and version 5 play results remain separate because the changed choices can affect both accuracy and response time even though the generated equations are unchanged.

### Version 4 local play-test baseline

One adult test pass covered one twenty-question, single-operation round for every version 4 difficulty and addition/subtraction combination.

| Difficulty | Addition accuracy | Addition median | Subtraction accuracy | Subtraction median |
| --- | ---: | ---: | ---: | ---: |
| Easy | 95% | 1,184 ms | 100% | 1,043 ms |
| Medium | 90% | 1,746 ms | 90% | 1,868 ms |
| Hard | 95% | 4,619 ms | 90% | 4,506 ms |
| Advanced | 80% | 6,778 ms | 85% | 6,341 ms |

Every observed round met its exact low-challenge, focus, negative-answer, unique-fact, and repeated-answer constraints. Hard Addition included one known 32.1-second interruption; removing that question lowers its average response time from 6.53 to 5.19 seconds, while the median remains the safer comparison.

Advanced felt materially difficult and its response times and accuracy separated clearly from Hard. In Advanced subtraction, 14 of 20 questions displayed the correct answer and its exact opposite sign together. That 70% incidence produced a reliable answer-choice cue and motivated the version 5 correction above.

### Version 6 short mixed-round correction

A ten-question, four-operation Advanced play test contained four focus questions, five review questions, one low-challenge question, and no negative subtraction. This was not solely unlucky selection: separately flooring the two- or three-question per-operation targets structurally reduced the intended 60% focus share to 40%.

Ruleset version 6 changes only the Advanced short-round rounding behavior. Replaying the observed seed now produces six focus questions and one negative subtraction question. Existing ranges, classifications, low-challenge caps, and version 5 signed-choice correction remain unchanged.

### Version 7 global low-challenge correction

Repeated ten-question, four-operation Advanced play tests exposed rounds containing three identities, including combinations such as `18 ÷ 1`, `639 − 639`, and `1169 + 0`, or `3397 + 0`, `3 × 1`, and `0 ÷ 17`. Each operation independently satisfied its ceiling-rounded limit, but the complete round exceeded the intended one-per-ten identity rate. These questions took roughly one to two seconds in rounds whose harder questions sometimes took twelve to fourteen seconds.

Ruleset version 7 calculates a single low-challenge budget from the complete session length and allocates it across operations without weakening their focus minimums. A ten-question Advanced round may now contain zero or one identity. Ordinary review facts remain unchanged so the first comparison can isolate the effect of identity clustering; near-equal negative subtraction remains a documented follow-up observation rather than part of this correction.

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

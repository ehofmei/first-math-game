# Problem Generation and Session Composition

## Purpose

Number Nook uses seeded randomness so a saved round can be reproduced. Seeded randomness alone does not guarantee a varied or educationally useful round: independent uniform choices can cluster around one table, overproduce trivial facts, or make two difficulty levels feel nearly identical.

The target design is **constrained randomization**. Questions remain unpredictable, but a deterministic session composer selects them within explicit difficulty, variety, and composition rules.

This document specifies the multiplication/division composer introduced in ruleset version 3. The ruleset version 4 addition/subtraction composer is specified separately in [Addition and subtraction generation](./ADDITION_SUBTRACTION_GENERATION.md). Together, the two composers cover every initial operation while preserving one balanced operation schedule.

Related references:

- [Balance analysis](./BALANCE_ANALYSIS.md)
- [Addition and subtraction generation](./ADDITION_SUBTRACTION_GENERATION.md)
- [Testing strategy](./TEST_STRATEGY.md)
- [Research and product design](../DESIGN_RESEARCH.md)

## Vocabulary

### Seeded randomness

Given identical settings, ruleset version, and seed, the game produces the same complete round, including question order, operands, distractors, and answer positions.

### Fact pair

Multiplication and division use the same underlying factor pair:

- `6 × 9` has the pair `(6, 9)`.
- `54 ÷ 9` has the pair `(9, 6)`: divisor first, quotient second.

The dividend is derived from the pair for division and is not itself a table value.

### Exact fact

Multiplication normalizes commutative facts, so `6 × 9` and `9 × 6` are one exact fact. Division remains directional, so its exact fact is the generated dividend and divisor.

### Low-challenge fact

A multiplication fact is low-challenge when either factor is `0` or `1`.

A division fact is low-challenge when any of these apply:

- Zero quotient: `0 ÷ n = 0`.
- Identity: `n ÷ n = 1`.
- Unit divisor: `n ÷ 1 = n`.

A fact matching more than one condition counts once toward the overall low-challenge limit and toward each applicable subtype limit.

### Review and focus facts

Review facts preserve retrieval of previously introduced material. Focus facts provide the intended challenge of the selected difficulty.

For multiplication, use the displayed factors. For division, use divisor and quotient as the inverse multiplication pair.

| Difficulty | Allowed table values | Review facts | Focus facts |
| --- | --- | --- | --- |
| Easy | Existing Easy ranges: primary tables `0, 1, 2, 5, 10`; partner `0–10` | Non-low-challenge facts involving `2`, `5`, or `10` | Same as review for this foundational level |
| Medium | `0–10` | Non-low-challenge facts outside the focus definition | Both pair values are at least `3`, excluding facts made easy by `5` or `10` |
| Hard | `0–12` | Non-low-challenge facts outside the focus definition | Both pair values are in `6–12` |
| Advanced | `0–20` for multiplication; `1–20` divisor and `0–20` quotient for division | Non-low-challenge facts outside the focus definition | At least one pair value is in `13–20` and the other is at least `6` |

These are game difficulty bands, not claims about a school curriculum. Child play-testing may move individual fact families without changing the composition architecture.

## Composition rules

Focus targets are calculated separately from the number of multiplication slots and division slots after the operation schedule is balanced. This prevents one operation from consuming all focus slots while the other receives only review facts. The cross-operation table-variety limit uses the combined number of multiplication and division slots.

Ruleset version 7 calculates the low-challenge maximum once from the complete session length, then deterministically allocates the planned identity slots across all four operation families without exceeding any operation's original capacity. This prevents ceiling each two- or three-question allocation from turning one intended Advanced identity into several identities in a short mixed round.

For a limit expressed “per 10,” use:

```text
maximum = ceil(relevant question count × limit / 10)
minimum = floor(relevant question count × target / 10)
```

Ruleset version 6 uses the nearest whole question for the Advanced focus minimum. This only changes short mixed rounds whose per-operation slot count would otherwise round a 60% target too far downward; other difficulties retain the original floor rule.

This makes the rules meaningful in mixed rounds containing only a few multiplication or division questions.

### Category targets

| Difficulty | Maximum low-challenge facts | Minimum focus facts |
| --- | ---: | ---: |
| Easy | 3 per 10 | No separate minimum |
| Medium | 2 per 10 | 5 per 10 |
| Hard | 1 per 10 | 6 per 10 |
| Advanced | 1 per 10 | 6 per 10 |

Within division:

- Zero-quotient facts are limited to 1 per 10 at every difficulty.
- Identity facts are limited to 2 per 10 on Easy and 1 per 10 on Medium, Hard, and Advanced.
- Unit-divisor facts are limited to 2 per 10 on Easy and 1 per 10 on Medium, Hard, and Advanced.

Easy deliberately uses its full low-challenge allowance as foundational practice. Medium and above vary below their maximum and fill remaining slots with eligible review facts.

### Variety constraints

Within one completed round:

1. Keep 10- and 20-question operation sets exact-fact unique. Thirty- and fifty-question rounds may repeat from a constrained category pool, but never consecutively and only after preferring less-used facts.
2. Across multiplication and division together, a table value may appear in at most 4 factor-pair positions per 10 relevant questions on Easy, 3 on Medium, and 2 on Hard or Advanced. Easy needs the widest allowance because its foundational division pool has only four divisors; Medium needs enough room to mix focus and review facts without forcing contrived low facts. The maximum is never lower than 2 in a short mixed round. For example, `11 × 6`, `66 ÷ 11`, and `3 × 11` each consume an appearance of table value `11`.
3. Seed-shuffle category positions so focus, review, and low-challenge facts are interleaved rather than presented as fixed blocks. The table-value cap is the primary anti-clustering guarantee.
4. Randomize multiplication orientation after selecting the normalized fact so the focus value is not always shown on the same side.
5. Continue randomizing answer positions independently and approximately uniformly.
6. Preserve balanced selected-operation counts. Composition rules may not starve an operation to satisfy a table preference.

The table-value cap is the direct protection against a round in which one salient number dominates several different equations. The adjacency rule is a preference because very small or heavily customized future pools may make strict spacing impossible.

## Session-construction algorithm

The composer should use deterministic pools rather than repeatedly generating independent questions and rejecting duplicates.

1. Build the balanced operation schedule using the seeded random source.
2. Count multiplication and division slots, calculate their category targets separately, and calculate their shared table-variety limit.
3. Build all eligible fact candidates for the selected difficulty.
4. Annotate each candidate with operation, normalized fact ID, factor pair, low-challenge subtypes, review/focus category, and designated table.
5. Seed-shuffle candidates within their categories.
6. Select focus slots first, then low-challenge and review slots, so later easy choices cannot consume the capacity reserved for the selected difficulty. Return the facts in the seed-shuffled category and operation schedule.
7. If an early choice prevents a valid completion, discard the partial schedule and make a bounded deterministic retry with newly seed-shuffled category pools.
8. In a long round whose category pool is smaller than its slot count, allow spaced exact-fact reuse before relaxing arithmetic validity, operation balance, low-challenge limits, focus minimums, or table-value limits.
9. Generate operation-specific distractors and shuffle answer positions only after the fact schedule is complete.

The implementation must not use an unbounded retry loop. Every supported settings combination must either produce a full valid session or fail a test during development; ordinary gameplay must never expose a partial round.

## What remains random

Constraints should not make rounds predictable. The seed still controls:

- Which eligible facts fill each category.
- The order of scheduled operations and facts.
- Multiplication operand orientation.
- Which plausible distractor strategies are selected.
- Answer-card order.

Different seeds should normally produce different rounds while every seed satisfies the same composition contract.

## What is not part of this revision

The first revision does not:

- Adapt selection to a player's saved accuracy or response time.
- Immediately reinsert a missed question into the same scored round.
- Change scoring, Paw Coins, answer-feedback timing, or distractor formulas.
- Change the version 3 multiplication/division ranges.
- Define addition/subtraction carrying, borrowing, or signed-answer rules; those arrived later in ruleset version 4.
- Claim that initial quotas are final educational calibration.

Adaptive practice is a later layer. It should alter weights within safe composition limits, not bypass those limits. A weak fact may receive a higher chance in later rounds, but should not dominate a session or repeatedly surprise the player without review.

## Versioning and history

Implementing this specification increments the game ruleset from version 2 to version 3. The save schema does not need to change because the stored session shape already includes the seed, settings, operands, choices, answers, and ruleset version.

Ruleset version 6 leaves the version 3 multiplication/division categories and limits intact, but uses nearest-question rounding for Advanced focus minimums in short mixed rounds. This prevents four separately floored operation quotas from reducing a ten-question Advanced mixed round to only four focus questions.

Ruleset version 7 keeps those focus minimums and all fact classifications intact while applying one session-level low-challenge budget: 3 per 10 on Easy, 2 per 10 on Medium, and 1 per 10 on Hard or Advanced. Medium and above may use fewer than the maximum, while Easy uses the available allowance subject to the original operation-specific capacity. Existing ruleset 6 rounds remain readable and are never regenerated.

Balance exports and on-screen configuration summaries must group by all of:

- Ruleset version.
- Normalized operation set.
- Difficulty.
- Question count or session type.

Version 2 and version 3 results must never be pooled into one configuration average. Existing sessions remain readable and are not regenerated.

## Acceptance criteria

Before the new composer is considered complete:

1. Every operation and difficulty still satisfies its arithmetic invariants.
2. Every supported operation combination and question count produces a complete round across a large fixed seed set.
3. Every generated round satisfies category targets, subtype limits, short-round exact-fact uniqueness, long-round repeat spacing, table-value caps, and operation balance.
4. The same seed, settings, and ruleset reproduce the exact same round.
5. Correct-answer positions remain approximately uniform across large samples.
6. Hard multiplication/division contains materially more focus facts than Medium, and Advanced contains materially more Advanced focus facts than Hard.
7. A regression fixture representing the locally observed 11-heavy composition cannot produce five appearances of one table value in ten multiplication/division questions.
8. A regression fixture representing the identity-heavy division composition stays within the appropriate identity limit.
9. Across all four operations together, the completed round stays within its session-level low-challenge maximum.
10. History summaries keep ruleset versions separate.
11. Browser journeys for a mixed-operation round continue to pass without UI or persistence changes.

## Tuning workflow

Treat the numeric limits as ruleset constants, not scattered literals.

1. Implement and simulate version 3 across many fixed seeds.
2. Inspect distributions and several complete example rounds.
3. Run local adult play-tests to check variety and the practical speed ceiling.
4. Gather child play-tests for comprehension, frustration, and actual difficulty.
5. Freeze a sample before changing quotas.
6. Change only a small group of related values, increment the ruleset, and compare again.

The goal is not to make every round identical in difficulty. It is to keep natural variation inside boundaries that remain varied, fair, and useful.

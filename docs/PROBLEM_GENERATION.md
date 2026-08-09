# Problem Generation and Session Composition

## Purpose

Number Nook uses seeded randomness so a saved round can be reproduced. Seeded randomness alone does not guarantee a varied or educationally useful round: independent uniform choices can cluster around one table, overproduce trivial facts, or make two difficulty levels feel nearly identical.

The target design is **constrained randomization**. Questions remain unpredictable, but a deterministic session composer selects them within explicit difficulty, variety, and composition rules.

This document specifies the first composition revision. It is intentionally limited to multiplication and division because local play-testing exposed clear problems there. Addition and subtraction keep their current number-range rules and duplicate prevention until carrying, borrowing, and signed-number bands are designed separately.

Related references:

- [Balance analysis](./BALANCE_ANALYSIS.md)
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

Composition targets are calculated separately from the number of multiplication slots and division slots after the operation schedule is balanced. This prevents one operation from consuming all focus slots while the other receives only review facts. The cross-operation table-variety limit uses the combined number of multiplication and division slots.

For a limit expressed “per 10,” use:

```text
maximum = ceil(relevant question count × limit / 10)
minimum = floor(relevant question count × target / 10)
```

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

The composer fills remaining slots with eligible review facts. It does not force the maximum number of low-challenge facts into every round.

### Variety constraints

Within one completed round:

1. Do not repeat an exact fact.
2. Across multiplication and division together, a table value may appear in at most 3 factor-pair positions per 10 relevant questions on Easy and 2 per 10 on Medium, Hard, and Advanced. The maximum is never lower than 2 in a short mixed round. For example, `11 × 6`, `66 ÷ 11`, and `3 × 11` each consume an appearance of table value `11`.
3. Do not use the same designated focus table in consecutive multiplication/division questions when another eligible candidate exists.
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
6. Fill scheduled slots using category targets, exact-fact uniqueness, table-value caps, and operation requirements.
7. Use bounded deterministic backtracking when an early choice prevents a valid completion.
8. If needed, relax only the consecutive-focus-table preference. Do not silently relax arithmetic validity, operation balance, exact-fact uniqueness, low-challenge limits, or focus minimums.
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
- Change addition or subtraction ranges.
- Add carrying/borrowing classifications.
- Claim that initial quotas are final educational calibration.

Adaptive practice is a later layer. It should alter weights within safe composition limits, not bypass those limits. A weak fact may receive a higher chance in later rounds, but should not dominate a session or repeatedly surprise the player without review.

## Versioning and history

Implementing this specification increments the game ruleset from version 2 to version 3. The save schema does not need to change because the stored session shape already includes the seed, settings, operands, choices, answers, and ruleset version.

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
3. Every generated round satisfies category targets, subtype limits, exact-fact uniqueness, table-value caps, and operation balance.
4. The same seed, settings, and ruleset reproduce the exact same round.
5. Correct-answer positions remain approximately uniform across large samples.
6. Hard multiplication/division contains materially more focus facts than Medium, and Advanced contains materially more Advanced focus facts than Hard.
7. A regression fixture representing the locally observed 11-heavy composition cannot produce five appearances of one table value in ten multiplication/division questions.
8. A regression fixture representing the identity-heavy division composition stays within the appropriate identity limit.
9. History summaries keep ruleset versions separate.
10. Browser journeys for a mixed-operation round continue to pass without UI or persistence changes.

## Tuning workflow

Treat the numeric limits as ruleset constants, not scattered literals.

1. Implement and simulate version 3 across many fixed seeds.
2. Inspect distributions and several complete example rounds.
3. Run local adult play-tests to check variety and the practical speed ceiling.
4. Gather child play-tests for comprehension, frustration, and actual difficulty.
5. Freeze a sample before changing quotas.
6. Change only a small group of related values, increment the ruleset, and compare again.

The goal is not to make every round identical in difficulty. It is to keep natural variation inside boundaries that remain varied, fair, and useful.

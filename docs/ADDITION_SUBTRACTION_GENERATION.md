# Addition and Subtraction Generation

## Purpose

Ruleset version 4 extends Number Nook's constrained randomization to addition and subtraction. Number range alone is not a reliable difficulty control: a large problem may require no regrouping, while a smaller problem may require carrying or borrowing across several places.

The version 4 composer keeps the existing operand and answer ranges while controlling the arithmetic work, low-challenge identities, signed answers, repeated facts, and repeated answers within each round.

These are game difficulty bands informed by elementary-math practice, not curriculum claims. Local child play-testing remains the final calibration step.

## Definitions

### Exact fact

Addition is commutative, so `7 + 9` and `9 + 7` are one exact fact. Subtraction remains directional, so `15 − 7` and `7 − 15` are different facts.

### Low-challenge fact

An addition fact is low-challenge when either operand is zero.

A subtraction fact is low-challenge when either condition applies:

- Subtracting zero: `n − 0 = n`.
- Zero difference: `n − n = 0`.

A fact matching both subtraction conditions counts once toward the overall low-challenge limit and toward both subtype limits.

### Regrouping

An addition regroup occurs when a base-10 column produces a carry into the next column. A subtraction borrow occurs when a base-10 column of a nonnegative subtraction must borrow from the next column. Cascading borrows count once for each affected column; for example, `100 − 1` has two borrow columns.

### Review and focus facts

Review facts are non-low-challenge facts that do not meet the selected difficulty's focus definition.

| Difficulty | Addition focus | Subtraction focus |
| --- | --- | --- |
| Easy | At least one regroup within the existing `0–10` operand and `0–20` sum ranges | At least one borrow with a nonnegative answer within `0–20` |
| Medium | At least one regroup with operands through `50` and sums through `100` | At least one borrow with a nonnegative answer and operands through `100` |
| Hard | At least one regroup and at least one operand of `100` or more | At least one borrow and a minuend of `100` or more |
| Advanced | At least two regroup columns | A negative result or at least two borrow columns |

Advanced addition retains operands through `5,000` and sums through `10,000`. Advanced subtraction retains operands through `1,000`.

## Composition targets

Focus targets are calculated separately for the number of addition slots and subtraction slots after the selected-operation schedule is balanced. Starting with ruleset version 7, the low-challenge maximum is calculated from the complete session and allocated across every selected operation while retaining the original per-operation capacity.

For a target expressed “per 10,” use:

```text
maximum = ceil(relevant question count × limit / 10)
minimum = floor(relevant question count × target / 10)
```

Ruleset version 6 uses the nearest whole question for the Advanced focus minimum. Other difficulties retain the floor rule.

| Difficulty | Maximum low-challenge facts | Minimum focus facts |
| --- | ---: | ---: |
| Easy | 2 per 10 | 3 per 10 |
| Medium | 1 per 10 | 4 per 10 |
| Hard | 1 per 10 | 6 per 10 |
| Advanced | 1 per 10 | 6 per 10 |

Easy uses its full low-challenge allowance as foundational practice. Medium and above vary below their maximum so identities remain present occasionally without becoming predictable.

Within subtraction, subtract-zero and zero-difference facts are each limited to 1 per 10. Within addition, zero-operand facts are limited by the overall low-challenge limit.

Advanced subtraction includes at least 3 negative results per 10 subtraction questions and never more than 5 per 10. Negative questions count toward the Advanced focus minimum. Other difficulty levels never produce a negative result.

## Variety constraints

Within one completed round:

1. Keep 10- and 20-question operation sets exact-fact unique. Thirty- and fifty-question rounds prefer unused facts, permit reuse only when needed, and never repeat an exact fact consecutively.
2. Across addition and subtraction together, the same correct answer may appear at most 2 times per 10 relevant questions, with a minimum allowance of 2 for short mixed rounds. This prevents a salient answer such as `10` or `0` from dominating a round.
3. Seed-shuffle category positions so low, review, focus, and negative facts are interleaved.
4. Continue balancing selected operations and randomizing answer positions.
5. Continue normalizing addition skill keys while preserving directional subtraction skill keys.

## Session-construction algorithm

1. Build the existing balanced, seed-shuffled operation schedule.
2. Count addition and subtraction slots and create a category schedule for each operation.
3. Reserve Advanced negative-subtraction slots, then focus slots, low-challenge slots, and review slots.
4. Generate seeded candidates inside the existing difficulty ranges and classify their regrouping, borrowing, identity, and sign properties.
5. Reject candidates that would violate the requested category, exact-fact uniqueness, subtype limits, answer-frequency limit, or consecutive-repeat rule.
6. Prefer unused facts in long rounds and use bounded retries so invalid configurations fail loudly instead of silently weakening the rules.
7. Construct plausible answer choices and independently randomize the correct answer position.

## Versioning

Implementing this specification increments the game ruleset from version 3 to version 4. Existing saved rounds remain readable and retain their original ruleset version. History analysis must continue separating results by ruleset version and complete configuration.

Version 4 does not change scoring, Paw Coins, feedback timing, or the version 3 multiplication/division composition contract.

### Ruleset version 5 correction

Ruleset version 4 play-testing exposed an answer-choice shortcut in Advanced subtraction. The reversed-subtraction distractor could place the exact opposite of the correct answer beside it, such as `25` and `−25`. Whenever that mirrored pair appeared, one of the two values was necessarily correct.

Ruleset version 5 preserves the version 4 composition contract but forbids nonzero mirrored-sign pairs within one Advanced subtraction choice set. Plausible nearby, sign, addition-instead-of-subtraction, and no-borrow errors remain available without revealing the correct magnitude. Existing version 4 sessions retain their original version in history.

### Ruleset version 6 correction

A ten-question Advanced round containing all four operations assigns only two or three slots to each operation. Separately flooring every 60% focus target produced only one focus question per operation, or four focus questions overall. The small subtraction allocation also floored its negative-answer target to zero.

Ruleset version 6 rounds only Advanced focus minimums to the nearest whole question and guarantees one negative result whenever Advanced subtraction has at least one slot. A ten-question four-operation Advanced round therefore contains six focus questions and one negative subtraction question. Number ranges, fact categories, low-challenge limits, distractors, and longer-round targets are unchanged.

### Ruleset version 7 correction

Ruleset version 6 still rounded each operation's low-challenge maximum upward independently. In a ten-question four-operation Advanced round, three different operations could therefore each contribute one identity even though the intended rate was one per ten questions.

Ruleset version 7 plans one low-challenge budget for the complete round and allocates it deterministically among operations with available non-focus capacity. A ten-question Advanced or Hard round now contains at most one identity across all selected operations; Medium contains at most two and Easy at most three. Advanced focus and negative-subtraction minimums, ordinary review facts, operand ranges, and distractors are unchanged.

## Acceptance criteria

1. Every generated problem satisfies its arithmetic, range, whole-number, and sign invariants.
2. Every supported operation combination, difficulty, and question count composes successfully across a large fixed seed matrix.
3. Every addition/subtraction round satisfies its low-challenge maximum, focus minimum, subtype limits, Advanced negative band, short-round uniqueness, long-round repeat spacing, and answer-frequency limit.
4. Every complete round satisfies the session-level low-challenge maximum across all selected operations.
5. Multiplication/division rounds continue satisfying all version 3 constraints.
6. Identical settings and seeds reproduce identical complete rounds.
7. Correct-answer positions remain approximately uniform.
8. Automated simulations report zero composition violations across at least 5,000 representative seeds.
9. Browser journeys and save/history tests continue passing after the ruleset increment.

## Play-test questions

After automated verification, manually test ten- or twenty-question single-operation rounds and note:

- Whether Easy introduces regrouping without feeling mislabeled.
- Whether Medium feels like a deliberate mix rather than a random number range.
- Whether Hard consistently requires multi-digit work.
- Whether Advanced negatives are noticeable without taking over the round.
- Whether any answer or problem shape feels repetitive.
- Whether incorrect choices resemble believable mistakes without becoming ambiguous.

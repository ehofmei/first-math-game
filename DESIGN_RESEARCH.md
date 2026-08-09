# Math Practice Game: Research and Product Design Options

## Status

This document captures the current research, recommended product direction, technical approach, alternatives, risks, and unresolved design questions for a small family-oriented arithmetic PWA.

It is a design document, not a final implementation specification. Decisions marked **Recommended** are starting points that can change after prototyping and play-testing.

### Confirmed decisions from design follow-up

- Quick Game uses a subtle count-up timer.
- Tapping an answer has a short feedback beat before advancing, preventing ultra-fast guessing from becoming optimal.
- In untimed Practice, a selected wrong answer becomes disabled and the learner retries.
- Multiplication/division table selection is available without entering the full Advanced-settings view.
- One child-facing difficulty applies to the whole selected operation set, with operation-specific rules underneath.
- Correct-answer combo milestones can be celebrated, but mistakes produce no “streak broken” or “combo lost” message.
- The player chooses one of three starter cats.
- Random rewards guarantee a new collectible until the available set is complete.
- Collectibles can have rarity tiers.
- Art should be cute, stylish, and scalable, leaning toward clean storybook/vector illustration.
- Practice frequency uses a forgiving weekly goal—initially three qualifying days—plus a smaller first-session-of-the-day bonus.
- Any completed qualifying session counts toward practice frequency regardless of accuracy.
- Collectibles should appear throughout the experience where they add value, but remain visually restrained during questions.
- The collection includes a gallery for viewing all owned collectibles; the three-item shelf is only a home-screen showcase.
- Speech is an experiment or later enhancement, not a core-release dependency.
- A handicap-style Improvement Duel is worth planning for after the MVP: each participant competes against a personal baseline.
- The catalog must support cats and non-cat “Guest” collectibles without special-case application code.
- All collectible content ships through repository updates; there is no local content import or in-app collectible creator.
- Guests participate in the same gallery, capsule, shop, and ownership systems as cats and normally use Special rarity.
- Special rarity is reserved for Guests and exceptional one-off collectibles; ordinary cats top out at Legendary.
- Guests appear inline in the unified collection with a visible Guest badge and optional gallery filter.
- Locked gallery entries use silhouettes, while the direct-purchase shop reveals full artwork and personality text.
- If a completed collector receives an update with one new item, duplicate protection makes that item the next capsule reward.
- Content updates may bundle ordinary cats with a new Special Guest when preserving meaningful rarity weighting is desirable.
- Rarity affects presentation, capsule odds, and direct-purchase price.
- Both random capsules and much more expensive direct purchases are available.
- Every collectible has a name and short personality/flavor text.
- Addition/subtraction difficulty accounts for both number range and carrying/borrowing.
- Practice offers a hint after the first miss and automatically shows help after a second miss.
- Five comparable sessions establish an Improvement Duel baseline; the weighted grade prioritizes accuracy over pace.
- The weekly goal is fixed rather than offering extra rewards for larger goals.
- Progress shows the most recent 30 days plus compact lifetime totals.
- Endless sessions stop without penalty; pausing hides the equation; save import replaces rather than merges; reset is protected in advanced settings.

## Product vision

Create a fast, cheerful arithmetic game that elementary learners can open on a phone or tablet, configure without adult help, and play in short sessions. The game should make improvement visible, reward repeated practice, work offline after installation, and remain small enough for one developer to finish and maintain.

The first release should support:

- Addition, subtraction, multiplication, and division.
- Any single operation or a selected combination of operations.
- Straightforward difficulty presets plus an advanced/custom level.
- Fixed-question, timed, and endless sessions.
- Randomized problems and plausible randomized answer choices.
- Optional-but-prominent speed play.
- One local player name and progress record per device.
- Local progress, statistics, personal bests, and export/import.
- A cat-centered but extensible collectible reward layer, including non-cat Guests, a full gallery, and lightweight customization.
- Responsive phone and tablet layouts.
- PWA installation and offline play through GitHub Pages.
- Full playability without speech, music, or sound.

## Product principles

1. **Practice comes first.** Game systems should increase useful repetitions without making children rush carelessly or avoid difficult facts.
2. **Improvement beats comparison.** The most prominent result should be progress against the learner's own prior performance.
3. **Fast entry.** Returning players should be able to start another round in one or two taps.
4. **Mistakes are information.** Incorrect answers should trigger useful correction, not shame or loss of accumulated progress.
5. **Guided randomness.** Sessions should feel varied while still revisiting weak or overdue facts.
6. **No dead ends.** A learner should always be able to earn rewards through reasonable practice, regardless of current skill.
7. **Local-first and private.** No account, backend, analytics, ads, purchases, or personal data beyond an optional local display name.
8. **Finishable scope.** Prefer one polished collection system over a shallow collection system, world builder, avatar editor, battle system, and narrative all at once.
9. **Content is data.** New collectibles and themed packs should not require changes to game logic.
10. **Curated repository content.** The repository owner selects every bundled asset; the runtime has no public upload or remote-content surface.

## Research findings and design consequences

### Purposeful practice and progress monitoring

The Institute of Education Sciences' elementary mathematics guidance recommends systematic instruction, multiple meaningful practice opportunities, progress monitoring, self-correction, visual representations, number lines, and timed activities as one way to develop fluency ([IES practice guide](https://ies.ed.gov/ncee/wwc/practiceguide/26)).

Design consequences:

- Track performance at the fact or skill level, not only as a lifetime total.
- Reintroduce missed and slow facts in later questions and sessions.
- Offer optional visual representations and number lines.
- Include speed-oriented modes, but retain an untimed practice path.
- Give immediate correction and a later opportunity to retrieve the same fact again.

### Retrieval, spacing, and interleaving

Interleaved practice mixes related problem types so learners must recognize the appropriate operation or strategy. A preregistered randomized mathematics trial found stronger delayed performance for interleaved practice than blocked practice, though the participants were older than this game's initial audience ([IES project](https://nces.ed.gov/use-work/awards/efficacy-study-interleaved-mathematics-practice), [trial summary](https://eric.ed.gov/?id=EJ1237752)).

Design consequences:

- Mixed-operation mode is educationally useful, not merely a convenience.
- Do not force interleaving before a learner understands each included operation.
- Use a lightweight spaced-practice algorithm rather than uniform randomness.
- Preserve some mastered facts in sessions so learning is maintained over time.

### Feedback, persistence, and math anxiety

Research on children's response to math feedback found that higher math anxiety was associated with lower willingness to remain in the activity, with a trend toward lower resilience among learners receiving substantial negative feedback ([feedback and persistence study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12338047/)). A separate digital math-training study reported reduced math anxiety and improved performance following a motivating six-week program that used positive feedback ([digital math training study](https://pmc.ncbi.nlm.nih.gov/articles/PMC9120910/)).

Design consequences:

- Use calm correction such as “The answer was 42” instead of a harsh buzzer or failure screen.
- Do not remove coins, collectibles, streaks, or levels after a wrong answer.
- Celebrate effort, recovery, accuracy, mastery, and improvement.
- Keep a no-countdown mode available even if timed play is encouraged.

### Gamification and motivation

Systematic reviews generally find that game-based mathematics can improve engagement and affective outcomes, but results depend on implementation ([mathematics game-based learning review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10086333/)). A meta-analysis of gamification and intrinsic motivation found benefits for motivation, autonomy, and relatedness but a much smaller effect on perceived competence ([gamification meta-analysis](https://link.springer.com/article/10.1007/s11423-023-10337-7)).

Design consequences:

- Give meaningful choices: operation, difficulty, session type, active cat, and desired reward.
- Set attainable goals and show specific evidence of growing competence.
- Avoid making points and prizes the only reason to play.
- Reward completion and improvement, not only perfect performance.
- Keep the challenge close to the learner's demonstrated level.

### Answer-choice quality

Mathematics distractors work best when they represent plausible errors. Poorly designed choices can add cognitive load or even reinforce misconceptions ([mathematics distractor analysis](https://www.sciencedirect.com/science/article/pii/S1871187124002712)).

Design consequences:

- Generate choices from operation-specific error strategies rather than selecting arbitrary nearby numbers.
- Never show duplicate choices.
- Randomize the correct answer's position uniformly.
- Avoid visual tells such as making only the correct answer even, positive, or the expected number of digits.
- Record the selected distractor's error category where possible; this can eventually power better hints.

### Age-appropriate scope

The Common Core mathematics standards expect fluency with addition and subtraction within 20 by the end of grade 2, addition and subtraction within 1,000 during grade 2, foundations for equal groups, multiplication/division work in grade 3, and multi-digit arithmetic and factor work in grade 4 ([Common Core mathematics standards PDF](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf)). The game does not need to act as a curriculum, but these ranges are useful anchors for presets.

Design consequences:

- Easy presets should not simply mean “all operations with smaller numbers.”
- Difficulty needs operation-specific rules.
- Multiplication/division tables and multi-digit addition/subtraction should be independently configurable.
- Visual arrays and groups are especially relevant when multiplication and division are new.

### Streaks and random rewards

Streaks can increase persistence, but brittle streaks can shift attention to avoiding loss rather than learning. Recent research continues to examine both the motivational benefit and the possible cost ([student streak study](https://www.sciencedirect.com/science/article/pii/S0272775725001013), [streak persistence study](https://www.sciencedirect.com/science/article/pii/S0749597825000032)).

Random rewards can be motivating, including in educational contexts, but loot-box research raises concerns about opaque odds, overspending, and gambling-like design—especially for children ([reward-box study with fourth-grade classes](https://journals.sagepub.com/doi/10.1177/07356331261444108), [loot-box demand experiment](https://www.sciencedirect.com/science/article/pii/S016726812400369X), [children's-rights analysis](https://biblio.ugent.be/publication/01JTNVGBM7BA2FDXG6939186MV)).

Design consequences:

- Use no real-money purchases and no path to buy the virtual currency.
- Make all random rewards cosmetic.
- Show the complete collection and clear unlock rules.
- Use duplicate protection or let duplicates become currency that buys a chosen missing item.
- Do not use expiring shops, “limited-time” pressure, near-miss animations, or opaque rarity odds.
- Prefer a forgiving weekly practice goal over a streak that resets to zero after one missed day.

## Recommended MVP experience

### First launch

1. Enter a local display name.
2. Choose one of three starter cats.
3. See a short explanation: practice earns Paw Coins and unlocks more cats.
4. Land on the home screen with a prominent **Play** button.

The name is a convenience label stored only on the device. No email, birth date, login, or cloud identity is needed.

### Home screen

Recommended primary actions:

- **Play** using the remembered settings.
- **Change game** to edit operations, difficulty, and session format.
- **Cat Collection** to view and equip collectibles.
- **Progress** to see mastery and history.

Secondary settings can contain sound, speech, reduced motion, data export/import, reset, and installation help.

### Game setup

The setup screen should use large, direct controls:

- Operations: multi-select buttons for `+`, `−`, `×`, and `÷`.
- Difficulty: Easy, Medium, Hard, Advanced.
- Session type: Questions, Timed, Endless.
- Question count: 10, 20, 30, 50.
- Time limit: 30 seconds, 60 seconds, 2 minutes, 5 minutes.
- Timer display: visible or hidden, when meaningful.
- Visual help: automatic, on, or off.

Rules:

- At least one operation must remain selected.
- Save the last valid setup automatically.
- **Reset defaults** restores a sensible default, not an empty form.
- **Play again** starts immediately with identical settings.
- **Change settings** returns to the saved setup.

Suggested default: addition and subtraction, Medium, 10 questions, a subtle count-up timer, and no hard per-question limit.

### Core question loop

1. Display one large equation and four large answer cards.
2. A tap commits the answer immediately and temporarily locks the other answer cards.
3. Give brief color, icon, and optional sound feedback: initially 340 ms after a correct answer and 500 ms after an incorrect answer.
4. Advance quickly to the next problem after that feedback beat.
5. During the next problem, show a compact feedback ribbon for the previous one:
   - Correct: `✓ 7 × 6 = 42`
   - Incorrect: `7 × 6 = 42` with the chosen wrong answer shown less prominently if space permits.
6. Queue an incorrectly answered fact to reappear after several intervening questions when session length permits.

The previous-answer ribbon solves the speed-mode problem: correction remains visible without interrupting the round. It should not cover the new equation or answers.

For untimed Practice mode, an incorrect selected answer becomes disabled. The player tries again, optionally with a visual hint, until selecting the correct answer. The first selection remains the scored attempt so repeated guessing cannot inflate accuracy.

### Results screen

The top message should answer “How did I improve?” before presenting a generic score.

Examples:

- “New best! Same accuracy, 8 seconds faster.”
- “You mastered 3 new facts.”
- “Accuracy improved from 80% to 90%.”
- “You practiced 4 facts that were tricky last time.”
- “Great consistency—another strong round.”

Then show:

- Correct answers and accuracy.
- Total or average response time when timing applies.
- Personal-best status for comparable settings.
- Newly mastered facts or skill progress.
- Paw Coins earned.
- A reward reveal when one was earned.
- **Play again** as the largest action.
- **Change settings** as a secondary action.

## Game modes

### 1. Practice

- No countdown.
- Accuracy and correction emphasized.
- Optional visual hints.
- Missed facts return later.
- Timing may be recorded quietly but is not used to pressure the player.

### 2. Quick Game

- Fixed number of questions.
- Measures accuracy and total time.
- The recommended everyday mode.
- Optional visible elapsed timer.

### 3. Time Rush

- Answer as many as possible in 30 seconds to 5 minutes.
- Feedback appears in the previous-answer ribbon.
- Score rewards correct answers and pace.
- Wrong answers do not subtract coins or end a streak.

### 4. Endless

- Continues until the player stops.
- Periodic milestones award coins and offer a natural stopping point.
- Statistics should be normalized per question so very long sessions do not dominate every leaderboard.

### Possible post-MVP modes

- Daily or weekly seeded challenge.
- Mastery Quest that targets weak facts.
- Missing-number equations such as `__ + 7 = 15`.
- Fact-family rounds connecting multiplication with division or addition with subtraction.
- Comparison mode: choose `<`, `=`, or `>`.
- Estimation.
- Word problems.
- Fractions, decimals, percentages, powers, and negative-number practice.
- Pass-and-play or family challenge.

## Difficulty system

Difficulty should be data-driven configuration, not scattered conditional logic.

### Proposed presets

| Difficulty | Addition | Subtraction | Multiplication | Division |
| --- | --- | --- | --- | --- |
| Easy | operands 0–10, sums up to 20 | nonnegative answers within 20 | ×0, ×1, ×2, ×5, ×10 | exact fact-family answers from easy tables |
| Medium | operands 0–50, optional carrying | nonnegative answers within 100 | ×0 through ×10 | exact answers derived from ×0 through ×10, excluding divide-by-zero |
| Hard | operands 0–500, carrying | nonnegative answers within 1,000, borrowing | ×0 through ×12 | exact answers derived from ×0 through ×12 |
| Advanced | configurable multi-digit range | configurable range, optional negatives | operands beyond 12 | configurable range, optional remainders later |

This table needs play-testing. “Medium” may be too broad for multiplication if every table is introduced simultaneously. A table-selection control may be more useful than fixed multiplication ranges.

### Advanced settings

Potential controls:

- Operand minimum and maximum per operation.
- Included multiplication/division tables.
- Include zero and one.
- Allow carrying or borrowing.
- Allow negative subtraction results.
- Whole-number division only; remainders remain a future option.
- Number of answer choices: three or four.
- Per-question time limit, if later desired.

Advanced settings should be collapsed by default so the main setup remains approachable.

## Problem generation

### Extensible operation model

Each problem mode should implement a shared contract conceptually similar to:

```ts
interface ProblemGenerator<TSettings> {
  id: string;
  generate(settings: TSettings, rng: RandomSource): Problem;
  buildDistractors(problem: Problem, rng: RandomSource): Distractor[];
  getSkillKey(problem: Problem): string;
}

interface Problem {
  prompt: MathPrompt;
  correctAnswer: number | string;
  skillKey: string;
  metadata: Record<string, unknown>;
}
```

The game session should consume generic `Problem` objects and should not contain operation-specific generation logic. This makes new modes additive rather than invasive.

### Mathematical constraints

- Addition can select operands directly and derive the answer.
- Subtraction should generate an ordered pair or derive the minuend so nonnegative constraints are always satisfied.
- Multiplication selects a table and multiplier according to the chosen range.
- Division should generate divisor and quotient first, then multiply them to produce the dividend. This guarantees a whole-number answer and prevents accidental divide-by-zero.
- Mixed mode should balance selected operations instead of choosing independently with replacement; otherwise short sessions may omit a selected operation.
- Avoid exact duplicate equations within a short session unless intentionally repeating a missed fact.
- Consider commutative pairs the same skill for addition and multiplication while still varying their presentation.

### Distractor strategies

Potential operation-specific distractors include:

- Off by 1, 2, 5, or 10.
- Correct result for a neighboring fact.
- Applying a different displayed operation.
- Reversing subtraction operands.
- Using an addition result for multiplication.
- Forgetting a carry or borrow in multi-digit arithmetic.
- Multiplying or dividing by one operand incorrectly.
- Digit transposition where plausible.

The generator must filter:

- The correct answer.
- Duplicate distractors.
- Disallowed negatives.
- Implausible magnitude where it makes the correct answer obvious.
- Any value that violates a content rule for the selected difficulty.

## Guided randomness and mastery

### Per-skill record

Store compact aggregated information for each skill key, for example `mul:7x6`:

- Attempts.
- Correct attempts.
- Current correct streak for that skill.
- Recent accuracy using a rolling window or exponential average.
- Recent response-time average.
- Last practiced date.
- Mastery stage.
- Times selected as a remediation item.

### Mastery stages

Suggested child-facing labels:

1. New
2. Learning
3. Getting Strong
4. Confident
5. Mastered

A skill should not become Mastered from a single lucky answer. Promotion should require correct retrieval across more than one session or day. A later miss should reduce confidence gradually, not erase all progress.

### Selection weights

A session generator can create a candidate pool from the chosen settings and weight it approximately as follows:

- 50% normal coverage and variety.
- 30% weak, recently missed, or slow facts.
- 15% overdue facts that were previously strong.
- 5% stretch items near the top of the selected difficulty.

These values are hypotheses to test, not research-derived constants. The algorithm must also enforce operation balance and prevent frustrating repetition.

## Scoring and progress

No single number represents learning well. The game should maintain four separate concepts:

1. **Accuracy:** correct answers divided by attempted answers.
2. **Pace:** response time or correct answers per minute.
3. **Mastery:** stable performance on individual skills across sessions.
4. **Growth:** improvement against the learner's recent comparable baseline.

### Recommended presentation hierarchy

1. Growth or mastery message.
2. Accuracy.
3. Pace or time.
4. Game score and coins.

### Comparable personal bests

A personal best is meaningful only among comparable sessions. Store bests by:

- Mode.
- Difficulty.
- Selected operation set.
- Question count or time limit.
- Possibly advanced-settings fingerprint.

Avoid declaring a 10-question addition game directly “better” than a 50-question mixed-operation game.

### Game score

A simple starting formula for timed modes:

- Base points for each correct answer.
- A bounded speed bonus that reaches zero slowly, so thinking is still worthwhile.
- A small consecutive-correct bonus capped at a modest value. Milestones may be celebrated, but a miss silently resets the combo without a negative message.
- A difficulty multiplier.
- No negative score for an incorrect answer.

Exact values should be tuned after observing real sessions. Currency awards should depend mostly on completed useful practice, with smaller bonuses for accuracy, improvement, and mastery. Otherwise struggling learners earn rewards too slowly precisely when motivation is most needed.

### Progress views

Child-friendly overview:

- Current level or XP.
- Practice goal for the week.
- Facts mastered this week.
- Recent personal bests.
- Overall operation progress.

Detailed view:

- Accuracy and pace by operation.
- Multiplication/division table grid.
- Addition/subtraction ranges or skill groups.
- Skills labeled New, Learning, Confident, or Mastered.
- Recent sessions.
- Improvement over time.
- Frequently missed facts.

## Fair family competition

Raw score is unlikely to be fair across different ages or difficulty levels. Possible approaches:

### Improvement Duel — planned post-MVP option

Each player uses appropriate settings on their own device. The challenge is to beat their own recent baseline. A player earns one challenge point for improving accuracy and a second for improving pace without lowering accuracy.

This should behave more like a golf handicap than a raw-score comparison. Five comparable sessions establish the initial baseline. A provisional weighted grade gives accuracy substantially more weight than pace—for example, 75–80% accuracy improvement and 20–25% pace improvement—with a cap preventing a large speed gain from fully offsetting a meaningful accuracy loss. The exact formula should be simulated against saved-session data before it becomes player-facing.

Advantages:

- Different skill levels can compete meaningfully.
- Encourages growth rather than selecting easier opponents.
- Needs no network if results are compared in person.

Risks:

- A strong prior result is harder to beat.
- Baselines need enough sessions to become stable.
- Self-reported results are fine for a family game but not tamper-proof.

### Difficulty multipliers

Apply larger score multipliers to more difficult presets. This is familiar but difficult to balance across operations and ages. It can also encourage players to search for the easiest high-multiplier setting.

### Personal ghost

Each learner races an animation representing their own previous pace. Family members can celebrate whether each player beat their ghost. This is not directly competitive, but it creates a shared challenge and is naturally fair.

### Shared practice goal

Family members contribute completed questions toward a shared weekly target that unlocks a cat or gallery decoration. This adds relatedness without declaring a winner, but cross-device aggregation would require manual entry, export merging, or a backend.

## Extensible collectible economy

### Recommended MVP structure

- Start with 12–24 collectible cats across a few rarity tiers.
- Each has a stable ID, name, portrait, flavor text, rarity, and content-pack ID.
- The underlying system calls these items `Collectible`; “Cats” remains the main player-facing theme.
- Non-cat characters can appear as `Guest` collectibles without changing inventory, shop, gallery, or reward logic.
- Completing sessions earns Paw Coins.
- Coins can be spent on either:
  - A surprise Cat Capsule.
  - A rotating or complete catalog with fixed prices.
- The full gallery shows every owned collectible and silhouettes or metadata for undiscovered items as configured by its content pack.
- Any compatible owned collectible can be equipped as the active companion/avatar.
- A home screen shelf can display three favorites.

### Duplicate approaches

1. **No duplicates until the available collection is complete — confirmed for MVP.** Every capsule advances the collection. Rarity affects presentation and possibly price or unlock weight, but duplicate protection always wins.
2. **Duplicate conversion.** Duplicates become Yarn. Yarn buys a chosen missing cat. This makes duplicates useful but adds a second currency and more balancing work.
3. **Pity counter.** Odds of a new cat increase after duplicates. This retains suspense but is harder to explain and test.
4. **Duplicate upgrades.** Copies add stars or unlock alternate art. This can create an endless collection chase and substantially expands scope.

For the initial game, duplicate-free draws are the cleanest. Once all currently eligible items are found, capsules can unlock color variants, gallery backgrounds, or simply disappear in favor of fixed-price customization.

### Ways to use collectibles without building a large game

- Active cat appears beside the equation and reacts briefly to results.
- Equipped cat appears on the home and results screens.
- Choose three collectibles for a favorite shelf while retaining a separate gallery for the entire collection.
- Unlock simple gallery backgrounds.
- Each cat grants a cosmetic title or color theme.
- Cats can have one short “encouragement line,” text only.

Avoid stat bonuses tied to particular cats. Cosmetic choice should not influence which math settings maximize performance.

### Repository content-pack model

Collectibles should be loaded from repository data instead of declared inside React components or reward logic. Content packs are bundled into the application build and deployed through GitHub Pages. There is no user-facing collectible import or editor.

Conceptual schema:

```ts
interface ContentPack {
  formatVersion: number;
  id: string;
  version: string;
  name: string;
  author?: string;
  license?: string;
  collectibles: CollectibleDefinition[];
}

interface CollectibleDefinition {
  id: string;
  name: string;
  kind: "cat" | "guest";
  rarity: "common" | "uncommon" | "rare" | "legendary" | "special";
  description?: string;
  image: ContentAssetReference;
  thumbnail?: ContentAssetReference;
  altText: string;
  tags?: string[];
  capsuleEligible: boolean;
  capsuleWeight: number;
  shopEligible: boolean;
  shopPrice: number;
  sortOrder?: number;
}
```

Stable identity should combine pack and item IDs, such as `cozy-cats:cloud`, so themed packs can reuse a local item name without colliding. Save data records this stable identity; it does not copy the definition or artwork. IDs must never be reused for different content after release.

Adding content is a developer workflow:

1. Add or update a pack manifest under the repository content directory.
2. Add optimized images and thumbnails.
3. Run content-schema, unique-ID, and asset validation.
4. Build and deploy the application.
5. The PWA detects the new build and offers an update at a safe point outside an active session.
6. After updating, new items appear as unowned entries in the existing gallery, capsule pool, and shop without changing prior progress.

Cats and Guests use exactly the same ownership and acquisition code. `kind` affects badges and gallery filtering, while `rarity` controls visual treatment, capsule weight, and direct-purchase price. `special` is reserved for Guests and exceptional one-off collectibles; ordinary cats top out at `legendary`.

For the initial economy, every collectible should be available through both paths unless a future design explicitly needs an exception:

- **Cat Capsule:** cheaper, random, and weighted by rarity among eligible unowned items. It always awards a new item until every capsule-eligible item is owned.
- **Direct shop purchase:** substantially more expensive, but lets the player choose the exact item.

Buying an item directly removes it from the unowned capsule pool. Lower weights make rare, legendary, and special items less likely while a broad pool remains; duplicate protection means they eventually become guaranteed as the pool is completed. This tradeoff is intentional: rarity changes anticipation and acquisition order without making completion depend on endless duplicates.

If a player already owns every collectible and an update adds one new item, that item is necessarily the next capsule reward. This is desirable catch-up behavior for an established player. When an update should preserve suspense around a new Special Guest, it can ship that Guest alongside several new ordinary cats so rarity weighting remains meaningful.

The gallery and shop intentionally reveal different information:

- The unified gallery displays cats and Guests together, offers a Guest filter, and shows locked items as silhouettes.
- The shop displays full artwork, name, rarity, and personality for directly purchasable items so a player can deliberately save for a favorite.
- Owned Guests receive a visible Guest badge but otherwise behave like every other equipped or displayed collectible.

Initial placeholder rarity tuning, to be tested:

| Rarity | Capsule weight | Direct-price multiplier |
| --- | ---: | ---: |
| Common | 60 | 1× |
| Uncommon | 25 | 2× |
| Rare | 10 | 4× |
| Legendary | 4 | 7× |
| Special | 1 | 10× |

The weights operate only across currently unowned eligible items. Exact prices and the capsule cost require play-testing against real coin earnings.

Content-pack validation should enforce:

- Unique pack and collectible IDs.
- Supported format version and rarity values.
- Required alt text.
- Allowed image types and dimensions.
- Per-file and total-pack size limits.
- No remote image URLs or executable content.
- No HTML in display fields.
- A safe maximum collectible count.
- Clear upgrade behavior when a pack version changes.
- Build-time verification that every referenced asset exists.

The repository owner remains responsible for deciding which generated, original, or licensed assets to publish. The application architecture does not need to make content-policy decisions at runtime.

### Content production plan

Consistent collectible graphics are feasible with generated image assets. A practical pipeline would be:

1. Define one visual style, composition, palette, and background treatment.
2. Generate a reference sheet or initial hero cat.
3. Generate individual variants using the style reference.
4. Crop to a consistent square composition.
5. Export optimized WebP plus small thumbnails; retain source PNGs outside the shipped bundle if desired.
6. Add alt text, names, and flavor text in structured data.

Static portraits with small CSS motion are much cheaper than sprite animation and are enough for a satisfying collection.

## Practice-frequency rewards

### Recommended weekly goal

Use a fixed goal of “Practice on 3 days this week.” Each qualifying day fills a paw print. Completing the row gives a capsule ticket or coin bonus. Completing additional days can still appear in the activity calendar, but there is no larger selectable goal or escalating weekly reward.

Benefits:

- Encourages spaced practice.
- Missing one day does not destroy progress.
- Weekends, travel, illness, and family schedules do not feel like failures.

### Optional daily bonus

The first completed session of a calendar day can receive a small fixed coin bonus. This should be framed as “Today’s bonus” rather than a threat to a streak.

If a consecutive-day streak is added later:

- Never reset visible lifetime progress.
- Offer automatic grace days.
- Celebrate the current and longest streak without scolding.
- Do not make exclusive collectibles depend on very long streaks.

## Speech, sound, and motion

### Spoken problems

The browser's `SpeechSynthesis` API can speak text using voices already installed on the device and is broadly available across modern devices ([MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)).

Recommended behavior:

- Off by default or introduced as an obvious optional speaker button.
- A global “Read problems aloud” setting.
- Tap the equation or speaker icon to repeat.
- Cancel the previous utterance before speaking the next problem.
- Convert symbols to natural language: `7 × 6` becomes “seven times six,” not “seven x six.”
- Never require speech to understand or complete a round.
- Expect voice quality and exact pronunciation to vary by device.

### Sound effects

The smallest implementation can create short pleasant tones with the Web Audio API, avoiding downloaded audio assets. Alternatively, a few small licensed or original sound files can be added later.

Requirements:

- Muted state persists.
- No sound before user interaction, respecting browser autoplay rules.
- Incorrect-answer sound is neutral, short, and quieter than celebration audio.
- Respect reduced-motion preferences for visual celebration.
- Music is not necessary for MVP.

## Technical recommendation

### Stack

- React.
- TypeScript with strict checking.
- Vite.
- `vite-plugin-pwa` for manifest and service-worker generation.
- Plain CSS or CSS Modules with design tokens.
- React hooks/context or a small reducer; no global state library initially.
- Browser `localStorage` behind a versioned repository abstraction initially; move to IndexedDB only if history or save size later justifies it.
- Vitest for generators, distractors, scoring, migrations, and import validation.
- Testing Library for key interaction states.
- Playwright for a small number of mobile/tablet end-to-end paths.
- ESLint and Prettier.
- GitHub Actions deployment to GitHub Pages.

React is not strictly necessary, but the application has enough independent UI states—setup, game loop, results, gallery, shop, progress, settings, import—to benefit from a component model. TypeScript is especially valuable for generic problem generators, versioned save data, migrations, and validating the many setting combinations.

### Application architecture

Suggested modules:

```text
src/
  app/               app shell, navigation, state composition
  game/              session engine, selection, scoring, feedback
  modes/             operation/problem-generator plugins
  mastery/           skill records, weighting, promotion rules
  rewards/           currency, collection, shop/capsule logic
  progress/          aggregations and presentation models
  storage/           save schema, repository, migrations, import/export
  audio/             speech and sound adapters
  components/        reusable UI components
  content/           repository pack schemas, catalogs, validation, difficulty presets
  styles/            global tokens and shared responsive styles
```

Important boundaries:

- The problem generators know mathematics but not React.
- The session engine knows problems and answers but not addition-specific rules.
- Scoring does not award collectibles directly.
- Reward calculation consumes a completed session summary.
- Persistence is accessed through a repository rather than direct `localStorage` calls throughout the app.
- Content consumers use a catalog interface that merges bundled repository packs; they do not import a specific cat list.
- Presentation consumes derived progress models instead of recalculating statistics in components.

### Save-data model

Potential top-level fields:

```ts
interface SaveData {
  schemaVersion: number;
  player: LocalPlayer;
  preferences: Preferences;
  lastGameSettings: GameSettings;
  skillProgress: Record<string, SkillProgress>;
  sessionSummaries: SessionSummary[];
  personalBests: Record<string, PersonalBest>;
  rewards: RewardState;
  practiceCalendar: Record<string, DailyPracticeSummary>;
}
```

Keep only compact session summaries and per-skill aggregates, not an unlimited log of every tap. A limited recent-answer history can help diagnose bugs and show recent mistakes without unbounded growth.

### Export/import

- Export one versioned JSON file.
- Include a format identifier, schema version, export timestamp, and checksum if useful for accidental corruption detection.
- Validate imported data before replacing anything.
- Preview the imported player name, progress totals, and export date.
- Back up current data in memory before committing the replacement.
- Do not merge saves in MVP; replace is simpler and predictable.
- Offer a clear download/share flow, with platform limitations documented.

Collectible definitions and images are application content, not save data. The export contains only owned stable IDs and progress. After importing on another updated device, those IDs resolve against the bundled catalog.

Browser data is stored per origin and browser. It is best-effort by default, though regularly used origins are rarely evicted; explicit export remains valuable for device replacement ([MDN storage quotas and persistence](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)).

### PWA and GitHub Pages

A PWA needs a manifest for installability and commonly uses a service worker for offline use ([MDN PWA installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)). `vite-plugin-pwa` can generate and register the service worker and cache the app shell ([Vite PWA guide](https://vite-pwa-org.netlify.app/guide/)).

Key requirements:

- `display: standalone`.
- Portrait-friendly but not portrait-locked unless testing shows a strong reason.
- Maskable and standard icons.
- Theme and background colors.
- Offline precaching for the app shell, code, fonts, and collectible assets.
- A clear “update available” flow so an active session is never reloaded unexpectedly.
- An update prompt can say “New cats and surprises may be waiting” when the bundled catalog version changes; activation waits until the current round and reward reveal are complete.
- GitHub Pages repository base path configured correctly.
- No reliance on server-side routes.
- A small install-help screen for iPhone/iPad and Android.

Vite documents that project Pages sites need a `/<REPOSITORY>/` base path and a GitHub Actions build/deploy workflow ([Vite GitHub Pages guidance](https://vite.dev/guide/static-deploy.html#github-pages)). GitHub's official Pages actions deploy the built static artifact ([GitHub Pages custom-workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)).

### Responsive and accessible interaction

- Design mobile-first from roughly 320 CSS pixels upward.
- Use large answer targets, recommended at least 56 CSS pixels high.
- Support touch, mouse, and physical keyboard number/arrow selection.
- Never rely on color alone for correct/incorrect state.
- Maintain strong contrast and large equation text.
- Use safe-area insets on notched phones and Home Screen mode.
- Avoid tiny settings controls.
- Respect `prefers-reduced-motion`.
- Preserve visible focus styles.
- Announce feedback appropriately to screen readers without interrupting rapid play.

WCAG 2.2's minimum target guidance is 24×24 CSS pixels or sufficient spacing, while noting that larger controls improve touchscreen use ([W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). A child-oriented game should comfortably exceed the formal minimum.

### Performance

- Keep the first JavaScript bundle small; lazy-load gallery/progress views if they become large.
- Use optimized WebP/AVIF images with explicit dimensions.
- Preload only the active cat and immediate UI assets.
- Avoid heavy animation libraries initially.
- Use CSS transforms and opacity for small celebrations.
- Generate each next problem before the transition completes.
- Persist at session boundaries or in small debounced updates rather than synchronously writing on every animation frame.
- Test in installed standalone mode, not only desktop development tools.

## Testing priorities

Problem generation is deceptively risky and deserves more testing than the visual reward system.

### Unit/property-style tests

- Correct arithmetic for thousands of generated inputs.
- No divide-by-zero.
- Whole-number division in supported presets.
- No forbidden negative subtraction.
- Correct operand bounds.
- No duplicate answer choices.
- Exactly one correct choice.
- Balanced correct-answer positions over a large sample.
- Selected-operation coverage in mixed sessions.
- Missed-fact requeue behavior.
- Score determinism.
- Mastery promotion/demotion.
- Currency cannot become negative.
- Duplicate-protection guarantees.
- Save migrations and malformed import rejection.

### End-to-end tests

- First launch through first completed game.
- Remember and reset game settings.
- Quick replay.
- Incorrect-answer ribbon during timed play.
- Offline reload after one successful online visit.
- Installable manifest and icons.
- Export, reset, and import recovery.
- Gallery unlock and equip flow.
- Phone portrait, phone landscape, and tablet layout.

### Real-device play tests

Automated tests cannot answer:

- Whether answer transitions feel instant.
- Whether the correction ribbon is noticed without becoming distracting.
- Whether difficulty labels match learner expectations.
- Whether rewards arrive too slowly or too quickly.
- Whether children understand mastery versus score.
- Whether generated speech sounds natural on the target devices.
- Whether a 10-question session feels satisfying.

## Scope plan

### Phase 1: Playable arithmetic core

- App shell and responsive design.
- Local name.
- Setup with four operations, multi-select, presets, and fixed question counts.
- Quick Game and Practice.
- Problem/distractor generators.
- Results, compact statistics, and remembered settings.
- Basic local persistence.
- Tests for mathematical invariants.

### Phase 2: PWA and speed play

- Time Rush and Endless.
- Previous-answer correction ribbon.
- Personal bests and growth messages.
- Manifest, icons, offline cache, install help, update flow.
- GitHub Pages workflow.
- Real iPhone/iPad testing.

### Phase 3: Collection and retention

- Paw Coins.
- Initial cat set.
- Generic collectible/catalog interfaces and Guest support.
- Duplicate-free capsule or fixed-price shop.
- Full gallery, active companion, and three-item favorites shelf.
- Weekly practice goal and daily completion bonus.
- Lightweight CSS celebrations and optional tones.

### Phase 4: Adaptive practice and deeper progress

- Per-skill mastery.
- Guided-random question weighting.
- Table/range progress views.
- Mastery Quest.
- Detailed statistics.
- Export/import.
- Optional speech synthesis.

This ordering deliberately proves that the core math loop feels good before investing heavily in art and reward balancing. Some vertical-slice work from Phase 3—a few placeholder cats and one reward reveal—can be included earlier to test whether the complete loop is motivating.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Too many settings overwhelm children | Strong remembered defaults, progressive disclosure, one-tap replay |
| Easy mode means inconsistent things across operations | Operation-specific preset configuration and clear summaries |
| Random choices are obviously wrong | Operation-specific distractor strategies and invariant tests |
| Timer increases careless guessing | Accuracy-first summaries, bounded speed bonus, untimed Practice |
| Collectibles eclipse learning | Award primarily for useful completed practice; show growth first |
| Reward economy is completed too quickly | Tune prices, add backgrounds/variants later, avoid blocking MVP on endless content |
| Reward economy feels exploitative | No money, pressure, losses, opaque odds, or pay-to-win; duplicate protection |
| Local data is lost | Versioned export/import and storage abstraction |
| PWA serves a stale build | Explicit update prompt, version display, service-worker testing |
| Art increases bundle size | Consistent static portraits, thumbnails, WebP/AVIF, lazy loading |
| New repository content breaks saves or UI | Versioned schema, build-time validation, stable IDs, and catalog tests |
| App update interrupts an active game | Prompt at safe navigation points and defer service-worker activation until the round ends |
| Adaptive algorithm feels repetitive | Hard repetition caps, operation balance, and visible variety |
| Score comparisons are unfair | Personal bests keyed by settings; improvement-based family challenges |

## Recommended decisions at this stage

- React + TypeScript + Vite.
- Static, local-first PWA with no backend or accounts.
- One local player per device.
- Fixed-question Quick Game as the default mode.
- Optional Practice, Time Rush, and Endless modes.
- Remembered multi-select operation settings with an obvious reset.
- Nonnegative subtraction except Advanced.
- Exact whole-number division only for the initial release.
- Standard multiplication through 12, with larger Advanced ranges.
- Previous-answer correction ribbon in rapid modes.
- Growth/mastery as the headline result; accuracy and pace remain visible.
- Cat-centered generic collectibles, Paw Coins, rarity tiers, Guests, a full gallery, one equipped companion, a three-item shelf, and duplicate-free initial draws.
- Forgiving weekly practice goal plus a small first-session-of-the-day bonus.
- Device speech synthesis as optional progressive enhancement.
- Versioned JSON export/import.
- Repository content packs only; new builds add cats and Guests without changing game logic or existing saves.

## Decisions to validate in prototypes

The remaining uncertainties are better answered by wireframing and play-testing than abstract discussion:

1. Start multiplication/division table selection with curated presets plus an expandable **Customize tables** control. Simplify it if the setup screen feels crowded.
2. Keep the personal ghost out of the initial MVP. Use the end-of-round handicap result first and revisit a live pace marker only if play-testing suggests it would motivate rather than distract.
3. Place the active collectible as a small static portrait outside the primary equation/answer region, then test whether it adds personality without competing for attention.

## Sources

- [Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades](https://ies.ed.gov/ncee/wwc/practiceguide/26)
- [Teaching Math to Young Children Toolkit](https://ies.ed.gov/ncee/rel/math-young-children)
- [IES study of interleaved mathematics practice](https://nces.ed.gov/use-work/awards/efficacy-study-interleaved-mathematics-practice)
- [Randomized controlled trial of interleaved mathematics practice](https://eric.ed.gov/?id=EJ1237752)
- [Influence of game-based learning in mathematics education](https://pmc.ncbi.nlm.nih.gov/articles/PMC10086333/)
- [Gamification, intrinsic motivation, autonomy, and relatedness meta-analysis](https://link.springer.com/article/10.1007/s11423-023-10337-7)
- [Children's motivation in response to math feedback](https://pmc.ncbi.nlm.nih.gov/articles/PMC12338047/)
- [Digital mathematics training and math anxiety](https://pmc.ncbi.nlm.nih.gov/articles/PMC9120910/)
- [Analysis of distractors in mathematics questions](https://www.sciencedirect.com/science/article/pii/S1871187124002712)
- [Common Core State Standards for Mathematics](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf)
- [Streaks and student effort and learning](https://www.sciencedirect.com/science/article/pii/S0272775725001013)
- [The motivating power of streaks](https://www.sciencedirect.com/science/article/pii/S0749597825000032)
- [Rewards in game-based learning study](https://journals.sagepub.com/doi/10.1177/07356331261444108)
- [Experimental study of loot-box demand](https://www.sciencedirect.com/science/article/pii/S016726812400369X)
- [Children's-rights analysis of loot boxes](https://biblio.ugent.be/publication/01JTNVGBM7BA2FDXG6939186MV)
- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [MDN: Installing and uninstalling web apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing)
- [MDN: Browser storage quotas and persistence](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [MDN: SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [WebKit: Home Screen web apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Vite: GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages)
- [Vite PWA guide](https://vite-pwa-org.netlify.app/guide/)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [W3C: Understanding target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

# Companion Identity, Themes, and Presence

This document records the direction for making equipped collectibles feel valuable throughout Number Nook while allowing the catalog to grow beyond cats. The generalized catalog, complete dual-art Nook Neighbors roster, companion palettes, Theme Lab, application-wide equipped theme, art-style setting, collection polish, and all six initial dialogue contexts are implemented. A future non-cat collection remains the final proof that expansion requires content rather than species-specific application code.

## Product direction

- **Companion** is the universal player-facing term for an equippable collectible.
- Cats remain the center of gravity and may make up most of the catalog, but future collections may focus on dogs, birds, rabbits, plush characters, or other family-friendly companions.
- A **collection** groups related companions and supplies its own name, description, release order, and art guidance.
- **Species** describes the character; it does not determine rarity or acquisition behavior.
- **Special Guest** is an exceptional status, not a synonym for “not a cat.” An ordinary dog or bird may be Common through Legendary, while a one-off cat, bunny, or other character may be a Special Guest.
- Paw Coins remain the currency. The cat on the current icon may remain as a mascot even after the broader companion model is implemented.
- Existing collectible IDs, including the `cozy-cats` namespace, remain permanent so current saves continue to resolve.

The generic reward is named **Companion Capsule**. This keeps Button Bunny and future species inside one clearly shared reward system. Individual featured capsules may later use collection-specific names without changing the reward rules.

## Target content model

The content schema separates the concepts that were previously combined in `kind: "cat" | "guest"`:

```ts
interface CollectibleDefinition {
  id: string;
  collectionId: string;
  species: string;
  specialGuest: boolean;
  rarity: "common" | "uncommon" | "rare" | "legendary" | "special";
  art: {
    classic?: ContentAssetReference;
    sticker?: ContentAssetReference;
  };
  theme: CompanionTheme;
  // Existing identity, economy, accessibility, and ordering fields continue here.
}
```

Validation should require Special Guests to use Special rarity and prevent ordinary companions of any species from using it. `species` should be an extensible normalized slug rather than a closed cats/dogs/birds enum, so adding a new species remains a content change.

Ownership and equipped state continue to store only stable collectible IDs. Collection, species, art style, theme, and Guest status are resolved from the current repository catalog, so adding these fields does not require renaming owned items.

## Equipped-companion themes

Equipping a companion should change a restrained set of semantic CSS variables across the application:

- primary accent;
- strong accent;
- soft accent;
- page tint;
- one or two decorative background glows;
- focus-ring tint when it passes contrast requirements.

Correct, incorrect, warning, neutral text, rarity, and Paw Coin colors should remain semantically consistent. Themes should change personality without changing the learned meaning of gameplay feedback.

Each catalog theme should be small and data-driven. New companions should not require new CSS selectors. An unresolved or legacy companion uses the default Number Nook purple-and-cream theme. Theme changes should follow the equipped companion automatically and remain independent of the Classic/Sticker art-style preference.

Accessibility and testing requirements:

- Validate theme values as supported color strings.
- Automatically check contrast for themed buttons, links, focus indicators, and important text.
- Preview every theme against representative buttons, panels, feedback states, and both art styles in a development lab.
- Verify that changing themes does not alter layout or game state.
- Respect reduced-motion preferences when transitioning between themes.
- Keep a safe default theme for missing, invalid, or partially deployed content.

## Companion presence

The equipped companion should feel present without competing with arithmetic.

| Context | Recommended presence |
| --- | --- |
| Home | Large themed presentation that links directly to the collection, plus the equipped portrait and completion progress in the Collection shortcut. |
| Game setup | Compact portrait and a short neutral line such as “Cloud will cheer you on.” |
| Active questions | Small static portrait in the header, outside the equation and answer grid. No dialogue or mistake reaction. |
| Round results | Larger celebratory portrait regardless of score, paired with the round-complete treatment. |
| Collection | A “By your side” spotlight, overall and per-collection completion counts, clear equipped state, full character details, and an easy equip action. |
| Capsule | Compact equipped-companion dialogue while idle; the revealed companion keeps the large reveal presentation without competing dialogue. |
| History | Compact coach card above the statistics, describing current practice without implying participation in older rounds. |
| Backup | Equipped theme remains active; character imagery is omitted from the data-focused workflow. |

The next personality layer adds contextual dialogue, reusable motion profiles, and restrained motifs without introducing reactions to individual mistakes or dialogue during active questions. The complete phrase, CSS, safety, and Companion Lab contract is defined in [Companion Personality, Dialogue, and Motion](./COMPANION_PERSONALITY.md).

If historical rounds should show the companion used at the time, new session summaries must record that companion ID. Showing only the currently equipped companion requires no save change but must not imply that it participated in older rounds.

## Gallery and collection navigation

The unified gallery should continue to show every companion. As the catalog grows, collection grouping is more durable than hard-coded Cat/Guest filters:

- start with **All** and collection groupings;
- optionally expose dynamically generated species filters when multiple species collections exist;
- show Special Guests inline with a visible badge;
- never require separate ownership, reward, shop, or equip logic for a species.

## Implementation sequence

1. ~~Generalize the catalog schema while preserving every current stable ID and save behavior.~~ Completed in catalog version 2.0.0.
2. ~~Add collection metadata, species, Special Guest status, dual art references, and theme tokens to the current catalog.~~ Completed; all ten Nook Neighbors and Button Bunny have both art styles, while synthetic catalog tests preserve fallback coverage.
3. ~~Introduce semantic theme variables and a development Theme Lab with contrast checks.~~ Completed at `/?dev=themes`.
4. ~~Apply the equipped theme throughout the application with a safe default.~~ Completed.
5. ~~Add the setup, game-header, and results companion placements.~~ Completed.
6. ~~Integrate the complete Nook Neighbors roster and art-style toggle.~~ Completed in catalog 2.1 with the preference stored in save schema 5; catalog 2.2 adds Button Bunny's matching Sticker portrait.
7. ~~Optimize assets, verify offline caching, and test the complete collectible loop on phone and tablet layouts.~~ Completed with 768-pixel production WebPs, starter precaching, on-demand collection caching, and automated device coverage.
8. ~~Strengthen companion visibility and collection navigation without distracting from arithmetic.~~ Completed with the home companion shortcut, dashboard portrait and progress bar, gallery spotlight, per-collection counts, and species-neutral Companion Capsule label.
9. ~~Implement the pure phrase engine, personality registry, and development-only Companion Lab defined in [Companion Personality, Dialogue, and Motion](./COMPANION_PERSONALITY.md).~~ Completed with deterministic scenario controls, repetition and distribution diagnostics, responsive stress views, and reusable motion/motif experiments.
10. Use a future non-cat collection to prove that no species-specific application changes are required.

This foundation now precedes the large catalog expansion. The next slice can add content without reopening species, Guest, art-fallback, or theme architecture.

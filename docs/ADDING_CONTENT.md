# Adding Collectible Content

Collectibles are data-driven. Adding a cat or Special Guest should not require changes to game logic, save data, or UI components.

## Add a collectible

1. Add a scalable SVG or optimized PNG/WebP image to `public/collectibles/`.
2. Add one entry to `src/content/catalog.ts`.
3. Increase the catalog version when the published set changes.
4. Run `npm run content:check` and `npm test`.
5. Open `/?dev=states` during development to inspect the new card at multiple viewport sizes.

Use a permanent, namespaced ID such as `cozy-cats:new-cat` or `special-guests:new-friend`. An ID becomes part of local save data after release and must not later be reused for different content.

## Catalog fields

| Field | Purpose |
| --- | --- |
| `kind` | `cat` or `guest`; both appear in the unified gallery and reward system. |
| `rarity` | Cats use Common through Legendary. Guests use Special. |
| `image` | Path below `public/`, normally `collectibles/file.svg`. |
| `altText` | Short visual description for players using assistive technology. |
| `capsuleEligible` | Whether the item can be discovered in a capsule. |
| `capsuleWeight` | Relative random weight among currently unowned eligible items. |
| `shopEligible` | Whether a future direct-purchase shop may offer the item. |
| `shopPrice` | Future direct-purchase price in Paw Coins. |
| `starterEligible` | Exactly three collectibles must be starters. |
| `sortOrder` | Stable display order in the gallery. |

Capsules currently prevent duplicates completely. Lower weights make rare items less likely while they remain unowned. Special Guests should generally have the lowest weight and highest direct price. If a Special Guest makes the catalog feel too sparse, add one or more regular cats in the same content update.

## Asset guidance

- Prefer a square view box and strong silhouette so the art works on small phones.
- Keep important details away from the outer edge, where cards or future masks may crop them.
- Match the existing simple, cute, family-friendly style.
- Avoid text inside the image.
- Keep source prompts or editable originals outside the shipped asset when useful; the game only needs the optimized output.

`npm run content:check` rejects duplicate IDs, missing assets, an incorrect number of starters, and invalid catalog data. Unit tests also enforce that Special is reserved for Guests.

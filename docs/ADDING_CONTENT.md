# Adding Collectible Content

Collectibles are data-driven. Adding a companion of any supported species or a Special Guest should not require changes to game logic, save data, or UI components.

Catalog version 2 separates collection, species, rarity, and Special Guest status. See [Companion Identity, Themes, and Presence](./COMPANION_SYSTEM.md) for the model and rollout plan.

## Add a collectible

1. Add the Classic SVG to `public/collectibles/` and the approved Sticker PNG source to `src/dev/assets/`.
2. Add the approved source/output pair to `scripts/optimize-sticker-assets.ts` and run `npm run art:optimize` to create the production WebP.
3. Add one entry to `src/content/catalog.ts`.
4. Increase the catalog version when the published set changes.
5. Run `npm run content:check`, `npm test`, and the browser tests.
6. Inspect the new companion in `/?dev=art`, `/?dev=themes`, `/?dev=companions`, and the playable gallery at phone and tablet sizes.

Use a permanent, namespaced ID such as `cozy-cats:new-cat`, `neighborhood-dogs:new-dog`, or `special-guests:new-friend`. An ID becomes part of local save data after release and must not later be reused for different content.

## Catalog fields

| Field | Purpose |
| --- | --- |
| `collectionId` | Existing collection ID matching the namespace before the colon in the collectible ID. |
| `species` | Extensible normalized species slug such as `cat`, `dog`, `bird`, or `rabbit`. |
| `specialGuest` | Whether the companion receives Special Guest status; independent of species. |
| `rarity` | Ordinary companions use Common through Legendary. Special Guests use Special. |
| `art` | Classic and/or Sticker paths below `public/`; at least one is required and the other style falls back safely. |
| `theme` | Six validated semantic colors used when the companion is equipped. |
| `altText` | Short visual description for players using assistive technology. |
| `capsuleEligible` | Whether the item can be discovered in a capsule. |
| `capsuleWeight` | Relative random weight among currently unowned eligible items. |
| `shopEligible` | Whether a future direct-purchase shop may offer the item. |
| `shopPrice` | Future direct-purchase price in Paw Coins. |
| `starterEligible` | Exactly three collectibles must be starters. |
| `sortOrder` | Stable display order in the gallery. |

Capsules currently prevent duplicates completely. Lower weights make rare items less likely while they remain unowned. Special Guests should generally have the lowest weight and highest direct price. If a Special Guest makes the catalog feel too sparse, add one or more ordinary companions in the same content update.

## Asset guidance

- Prefer a square view box and strong silhouette so the art works on small phones.
- Keep important details away from the outer edge, where cards or future masks may crop them.
- Match the existing simple, cute, family-friendly style.
- Avoid text inside the image.
- Keep source prompts or editable originals outside the shipped asset when useful; the game only needs the optimized output.

Use the bake-off, style-bible, raster export, and final-art acceptance process in [Collectible Art Direction and Production](./COLLECTIBLE_ART.md) before replacing placeholder art or producing a larger pack.

The catalog supports Classic and Polished Sticker references while preserving one stable collectible ID and ownership record. The complete Nook Neighbors roster and Button Bunny have both styles. Safe fallback remains part of the asset contract and automated tests, so a staged content update can temporarily provide only one style without affecting ownership. The remembered master setting lives in the progress backup and never changes ownership, rarity, economy, or equipped state. The first complete dual-style production brief is [The Nook Neighbors Collection](./NOOK_NEIGHBORS.md), and the Special Guest extension is recorded in [Button Bunny Sticker Record](./BUTTON_BUNNY_STICKER.md).

Each companion has a small theme palette. Themes use semantic tokens, retain fixed correct/incorrect meanings, pass contrast checks, and fall back to the default Number Nook palette when unresolved.

`npm run content:check` rejects duplicate collection, collectible, or sort IDs; unknown collections; mismatched ID namespaces; missing or oversized art; invalid Sticker dimensions; unreadable theme palettes; an incorrect starter count or Nook Neighbors rarity distribution; and invalid catalog data. Special rarity is reserved for entries explicitly marked as Special Guests rather than tied to species.

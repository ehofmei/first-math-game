# Collectible Art Direction and Production

This document defines how Number Nook explores, selects, produces, and verifies collectible artwork. The SVG companions established the simple Classic treatment, and the completed Nook Neighbors pilot adds an interchangeable Polished Sticker set. Both remain supported production styles and can receive focused refinements through the Art Lab workflow.

## Goals

- Make every companion feel desirable at gallery-card and capsule-reveal sizes.
- Keep a recognizable Number Nook family resemblance across cats, other species, and Special Guests.
- Preserve a strong silhouette and readable expression on phones and tablets.
- Make it straightforward to add requested repository content later.
- Keep the offline PWA download reasonable as the collection grows.
- Favor a repeatable production process over one unusually successful image.

## Recommended direction

Use two interchangeable character-art styles within one hybrid visual system:

- **Classic** preserves the simple, hand-editable SVG treatment used by the original companions.
- **Sticker** uses optimized raster illustrations in the selected polished sticker/storybook treatment.
- Unlocking a collectible unlocks both visual representations; art style never changes progress, rarity, economy, or behavior.
- A remembered master setting switches all available collectible portraits together.
- If one style is temporarily missing during development or a staged content rollout, the available asset is the safe fallback.
- Interface icons, rarity frames, badges, locks, glows, and lightweight motion remain CSS or SVG.
- Every collectible uses the same square composition rules regardless of file format.
- Static portraits plus restrained application-level motion are preferred to bespoke character animation for the first complete set.

The Sticker target is a **polished sticker/storybook hybrid**: clean silhouette, expressive face, controlled texture, soft dimensional lighting, and enough graphic simplicity to remain clear at small sizes. Classic is not merely a placeholder after this system is implemented; it remains a supported player-selectable style.

The first complete production pilot is the ten-cat [Nook Neighbors collection](./NOOK_NEIGHBORS.md). Its character recipes and review sequence are the working test of this dual-style direction.

The larger catalog is companion-centered rather than species-locked. Cats remain the primary subject, but later dog, bird, or other collections should use the same art-style, ownership, reward, and equip contracts. Species and Special Guest status are independent; the broader content and theming model is defined in [Companion Identity, Themes, and Presence](./COMPANION_SYSTEM.md).

## SVG capabilities and limits

SVG is not limited to flat icons. It can combine detailed paths, gradients, patterns, masks, clipping, transparency, blur, lighting, displacement, and procedural texture. It can also embed raster data.

SVG remains attractive when:

- the illustration is built from a manageable number of intentional shapes;
- crisp scaling and easy palette changes are important;
- separate parts may eventually be animated;
- the art should remain deterministic and directly editable in source control.

SVG becomes less attractive when:

- fur, brushwork, or organic texture requires hundreds or thousands of shapes;
- automatic tracing produces large, hard-to-maintain paths;
- filters become expensive to render or visually inconsistent across contexts;
- editing the portrait takes substantially longer than generating and refining a raster master.

Collectibles currently render through HTML `img` elements. This is safe and simple, but it means the application cannot directly style or animate individual elements inside an SVG. A future character rig would need inline SVG, separate layers, or multiple image states.

## Raster format policy

- Retain a high-quality PNG master or the best available editable source outside the shipped asset set.
- Prefer optimized WebP for shipped full-color portraits.
- Use PNG when lossless edges or transparency materially improve the result.
- Consider AVIF only after measuring a meaningful total-size benefit; it is not required for the first final set.
- Avoid JPEG for portraits with transparency or crisp graphic edges.
- Never place text, names, rarity labels, or other interface information inside the artwork.

A 1024 by 1024 source is the default working size. It comfortably covers the current maximum presentation of approximately 290 CSS pixels on high-density displays while leaving room for future layouts. Final file-size targets will be chosen from actual bake-off outputs rather than guessed in advance.

## Composition rules

Every candidate should follow the same constraints:

- Square canvas with the face and identifying features inside a central safe area.
- Recognizable silhouette without relying on tiny accessories.
- Eyes and expression remain readable at 96 pixels.
- No important feature touches the crop boundary.
- No words, logos, signatures, or watermarks.
- Background supports the character without competing with it.
- Character and background values remain separable after the locked-state grayscale filter.
- Props and costume details are allowed, but should not obscure the face.
- Rare artwork may be more distinctive, ornate, or atmospheric, but Common companions should still feel complete and desirable.

## Style bible

Once a treatment is selected, record the following before generating the full set:

- approved reference portraits;
- canvas, crop, pose, and safe-area rules;
- head/body proportion and eye treatment;
- outline or edge treatment;
- palette and lighting rules;
- background structure;
- permitted texture and detail level;
- rules for accessories and rarity differentiation;
- standard generation prompt and negative constraints;
- preferred export settings;
- a short list of failure examples to reject.

The approved references should accompany later generation requests. Prompts alone are not enough to keep a growing cast visually consistent.

## Moonbeam bake-off

The first Art Lab compares four versions of the same companion:

1. **Simple SVG:** the current production placeholder and size baseline.
2. **Detailed SVG:** a hand-authored vector using richer shape language, shading, texture, and effects.
3. **Polished sticker raster:** clean, game-like illustration with controlled dimensionality.
4. **Soft storybook raster:** warmer, more textured illustration that tests the richer end of the range.

Using one subject isolates the treatment itself. Moonbeam is a useful test because the lavender palette, ears, expression, and crescent motif provide identifiable invariants without requiring a complicated costume.

## Art Lab evaluation

Open `/?dev=art` while running the local development server. The route is development-only and must not alter the live catalog or save data.

Evaluate each treatment in these contexts:

- 96-pixel compact view;
- 155-pixel phone companion;
- 230-pixel desktop companion;
- 290-pixel capsule reveal;
- collection-card crop;
- dark home panel;
- locked grayscale silhouette.

The same route also contains the complete ten-cat Nook Neighbors Classic draft, a synchronized locked-state toggle, and a 96-pixel contact strip. This roster review should happen before the five new assets enter the live catalog.

Score candidates informally on:

- immediate kid appeal;
- face and emotion readability;
- silhouette recognition;
- consistency with Number Nook's interface;
- visual quality at small size;
- crop tolerance;
- locked-state readability;
- file weight;
- repeatability for another cat and a Special Guest;
- ease of future revisions.

The purpose is to select a production direction, not necessarily one exact Moonbeam image. A promising candidate may need another focused revision before it becomes catalog artwork.

The exact first-study prompts and source assets are recorded in [Moonbeam Art Bake-off Record](./MOONBEAM_ART_BAKEOFF.md).

## Generation workflow

1. Write a character brief using the shared composition rules.
2. Generate a low-risk draft without text or branding.
3. Inspect the full image and its real in-game contexts.
4. Revise one problem at a time, preserving accepted features.
5. Approve the master before compression.
6. Export and optimize the production WebP or PNG. For the current pipeline, record the approved source in `scripts/optimize-sticker-assets.ts` and run `npm run art:optimize`.
7. Record the final prompt, references, and relevant decisions.
8. Add the asset and catalog definition through the normal content workflow.
9. Run content validation, browser tests, build verification, and device inspection.

Generated output should be treated like source material, not automatically accepted final art. Hands, paws, markings, symmetry, unintended text, crop boundaries, and character consistency all require inspection.

## Scaling the collection

After selecting a direction:

1. Complete one ten-cat pilot collection with a normalized rarity distribution.
2. Use a small anchor set with visibly different colors, silhouettes, and rarity treatments to lock the Sticker style.
3. Test whether the ten portraits look like one collection rather than unrelated prompts.
4. Produce one Special Guest using the same global framing and world treatment. Button Bunny Sticker v1 completes this proof and is recorded in [Button Bunny Sticker Record](./BUTTON_BUNNY_STICKER.md).
5. Refine the style bible and asset pipeline from those results.
6. Expand in themed collections of roughly ten, including non-cat collections when desired, rather than generating a one-hundred-item batch without review gates.

New art should normally arrive in small repository packs. This keeps review manageable and lets ordinary companions accompany a Special Guest when the capsule economy needs a broader unowned pool.

Production portraits load and cache on demand. Only the three starter Stickers join the initial PWA precache so first-run onboarding remains complete offline; opening the gallery warms the other portraits. The current eleven 768-pixel WebPs are each below 150 KiB and total less than 750 KiB. Content validation enforces the per-file limit, and the repeatable browser encoder makes the same policy practical for later collections.

## Animation options

Animation is deliberately separate from the first art-direction decision:

- **Current:** move the whole portrait with CSS float, reveal, and glow effects.
- **Next-smallest:** add alternate static expressions for correct, incorrect, and celebration states.
- **Intermediate:** use a short WebP/APNG sequence for a special reveal.
- **Advanced:** create separated or inline vector parts for eyes, ears, paws, and tails.

The first final set should work as static art. Alternate states can be added to a few favorites after the visual direction and file-size budget are proven.

## Acceptance criteria for final art

A collectible asset is ready for production only when:

- it passes the small-size, locked-state, home, gallery, and reveal checks;
- its source and production files are clearly named;
- its prompt and reference lineage are recorded when generated;
- it has accurate alt text;
- it does not introduce unintended text or recognizable third-party branding;
- its optimized size is reasonable relative to the approved art budget;
- content validation and automated tests pass;
- it has been inspected on at least one phone-size and one tablet/desktop-size viewport.

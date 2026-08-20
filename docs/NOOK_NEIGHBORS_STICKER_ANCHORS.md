# Nook Neighbors Sticker Anchor Record

This records the first Sticker candidates generated after the Classic Nook Neighbors roster was drafted. These are unoptimized development studies, not live catalog assets.

## Candidates

| Cat | Purpose | Master asset | Art Lab preview | Source size |
| --- | --- | --- | --- | --- |
| Biscuit | Common desirability and warm-light baseline | `src/dev/assets/biscuit-sticker-v1.png` | `src/dev/assets/biscuit-sticker-v1-preview.png` | 1254 × 1254 PNG |
| Biscuit v2 | Focused background simplification | `src/dev/assets/biscuit-sticker-v2.png` | `src/dev/assets/biscuit-sticker-v2-preview.png` | 1254 × 1254 PNG |
| Aurora | Rare lighting, unusual marking, and atmosphere stress test | `src/dev/assets/aurora-sticker-v1.png` | `src/dev/assets/aurora-sticker-v1-preview.png` | 1254 × 1254 PNG |

All candidates were generated with the built-in image-generation tool. The original generated files remain in the tool's generated-image storage; the versioned master copies above are the project review assets. The 768-pixel preview copies keep the Art Lab responsive without modifying the masters.

Open `/?dev=art` during local development to compare each candidate with its Classic SVG and inspect the Sticker portrait at 96 pixels.

## Biscuit version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Biscuit, a cheerful baker cat from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait with a softly dimensional cozy bakery-window nook, warm cream light, and only a restrained checked-cloth or round pastry motif; full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; pale biscuit-beige coat that does not read as bright orange; broad round cheeks; slightly darker rounded ear caps; two large cinnamon freckles on each cheek; warm brown expressive eyes; terracotta-pink nose; small tidy chest ruff; simple cream neckerchief; round biscuit medallion with a few large dot marks; friendly, capable, proud expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, cohesive with a cream-purple-gold family game interface
Composition/framing: centered head-and-upper-body portrait; character occupies about 71 percent of the square; both ears, neckerchief, and medallion fully inside generous safe margins; face and cinnamon freckles remain readable at 96 pixels; no perspective distortion
Lighting/mood: warm bakery-window light, cozy, welcoming, cheerful, moderate contrast
Color palette: biscuit beige, cinnamon brown, warm cream, muted peach, small Number Nook purple accents
Constraints: exactly one character; square full-bleed artwork; anatomically clear face, ears, paws if visible, neckerchief, and medallion; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, costume clutter, kitchen tools, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, bright ginger-orange coat, excessive crumbs, busy bakery scene, tiny intricate props, toddlerish proportions, plastic fur
```

## Aurora version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Aurora, a radiant sky-painter cat from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a quiet cozy rooftop at dawn, with a softly dimensional deep-plum-to-dawn-lilac sky and exactly one broad restrained aurora ribbon; full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable elegant cat facing forward; pearly cream coat; long graceful ear points; flowing but simple chest tuft; large expressive violet eyes; soft rose nose; a mint-to-rose-to-violet aurora-colored coat marking sweeping naturally across the forehead and onto one cheek, clearly part of the fur and not a headband, crown, mask, or accessory; simple collar with an angular prism-shaped charm; imaginative, warm, gently confident expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, cohesive with a cream-purple-gold family game interface
Composition/framing: centered head-and-upper-body portrait; character occupies about 70 percent of the square; both long ears, chest tuft, and prism charm fully inside generous safe margins; face, colored coat marking, violet eyes, and prism remain readable at 96 pixels; no perspective distortion
Lighting/mood: pearlescent dawn rim light created by the aurora, quietly magical and radiant, moderate contrast, face brighter and more important than the effects
Color palette: pearly cream, mint, dusty rose, violet, deep plum, dawn lilac
Constraints: exactly one character; square full-bleed artwork; anatomically clear face, ears, paws if visible, collar, and prism charm; only one controlled aurora ribbon; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, wings, horn, crown, headband, mask, costume clutter, glitter fur, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, unicorn traits, metallic fur, excessive sparkles, rainbow overload, busy skyline, tiny intricate background detail, dark frightening mood
```

## Biscuit version 2 edit prompt

Version 1 was supplied as the edit target.

```text
Use case: precise-object-edit
Asset type: square collectible character portrait for Number Nook
Input image 1: edit target
Primary request: Simplify only the background and foreground of the Biscuit portrait. Remove both oversized biscuits behind the cat and remove the pastry-like circles along the bottom edge. Replace those elements with a quiet, uncluttered cozy window-seat nook: soft cream and muted lavender cushions, a simple warm windowsill or ledge, and very subtle broad checked-fabric shapes. There must be no visible food or biscuits anywhere except Biscuit's single round biscuit-shaped collar medallion.
Preserve exactly: Biscuit's identity, face, expression, eye shape and color, eyebrows, ear shape and color, pale biscuit-beige fur, four cinnamon cheek freckles on each side as currently shown, terracotta nose, whiskers, body proportions, pose, cream neckerchief, central biscuit medallion, crop, warm window lighting, polished 2D sticker/storybook rendering, and square composition.
Constraints: change only the oversized background biscuits and decorated foreground surface; keep Biscuit and the main arched window composition unchanged; no new props, characters, text, logos, symbols, badges, watermarks, food, crumbs, kitchen tools, or added costume details.
Avoid: regenerating or redesigning the cat, changing facial anatomy, changing the medallion, adding decorative objects, busy patterns, or creating empty flat space with no sense of a cozy nook.
```

## Initial review notes

### Biscuit

- The face, freckles, medallion, and beige coat read immediately.
- The composition is highly legible and appropriately warm for a Common cat.
- Version 1's two large background biscuits are more prominent than the original “restrained motif” request.
- Version 2 removes the repeated food motifs and uses quiet cream-and-lavender cushions instead, but repeated viewing showed that the quieter scene also removed too much of Biscuit's personality.
- Version 1 is the leading candidate. Version 2 remains an alternate study in the Art Lab so the decision can be revisited without regenerating it.
- The image should be evaluated beside Moonbeam to determine whether its fur rendering is slightly more detailed than the intended shared treatment.

### Aurora

- The forehead-to-cheek color is clearly a fur marking rather than a wearable headband.
- Violet eyes, long ears, chest tuft, prism charm, and rooftop setting all survived generation.
- The atmosphere successfully feels rarer than Biscuit without hiding the face.
- The scene contains more architectural detail than a typical portrait background; evaluate it at gallery size before deciding whether to simplify a later version.

## Approval gate

Before either image becomes production art:

1. Compare it with Moonbeam, its Classic SVG, and the other anchor at 96, 155, 230, and 290 pixels.
2. Check gallery, home, reveal, and locked-state treatments.
3. Decide whether the rendering, eye treatment, crop, and background depth form one repeatable Sticker style.
4. Request only targeted revisions; keep accepted character invariants fixed.
5. Optimize the approved source to WebP or PNG under the production asset-size budget.

The seven additional first-pass portraits and their exact prompts are recorded in [Nook Neighbors Sticker Batch Record](./NOOK_NEIGHBORS_STICKER_BATCH.md).

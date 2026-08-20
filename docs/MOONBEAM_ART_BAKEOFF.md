# Moonbeam Art Bake-off Record

This records the first development-only collectible studies used by `/?dev=art`. None of these files replace the catalog version of Moonbeam.

## Candidates

| Candidate | Source | Development asset |
| --- | --- | --- |
| Simple SVG | Existing catalog placeholder | `public/collectibles/moonbeam.svg` |
| Detailed SVG | Hand-authored for the bake-off | `src/dev/assets/moonbeam-detailed.svg` |
| Polished sticker | Built-in image generation | `src/dev/assets/moonbeam-sticker.png` |
| Soft storybook | Built-in image generation | `src/dev/assets/moonbeam-storybook.png` |

The raster studies are 1024 by 1024 PNG files. They intentionally remain unoptimized while the visual direction is undecided. A selected production asset should be exported to optimized WebP or PNG according to `COLLECTIBLE_ART.md`.

## Shared character invariants

- One original lavender cat named Moonbeam.
- Forward-facing, friendly expression.
- Warm golden eyes, pink ear interiors, and a small pink nose.
- Darker lavender markings.
- Collar with a crescent-moon charm.
- Moonlit violet square background.
- Face remains readable at 96 pixels.
- No text, branding, watermark, interface frame, or recognizable third-party character.

## Polished sticker prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for a cheerful elementary-math game
Primary request: Create an original polished sticker-style portrait of Moonbeam, a cute lavender cat companion associated with quiet puzzles and moonlight.
Scene/backdrop: a complete square portrait with a softly dimensional violet night-sky background, a large warm crescent moon motif, a few restrained stars, and no transparent areas
Subject: one friendly lavender cat facing forward, large expressive golden eyes, rounded youthful proportions, triangular ears with pink interiors, a small pink nose, subtle darker lavender markings, a neat collar with a crescent-moon charm; unmistakably a cat; warm confident expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, smooth controlled shading, crisp readable edges, cute and somewhat stylish rather than babyish, cohesive with a cream-and-purple family game UI
Composition/framing: centered head-and-upper-body portrait, character occupies roughly 72% of the square, ears and charm fully inside a generous safe margin, face readable when reduced to 96 pixels, no perspective distortion
Lighting/mood: soft moonlit rim light with warm eye highlights, comforting and magical, moderate contrast
Color palette: lavender, deep violet, cream, warm gold, dusty pink
Constraints: exactly one character; square full-bleed artwork; no words, letters, numbers, logos, signatures, UI, frames, badges, watermarks, extra limbs, costume clutter, photorealism, or recognizable copyrighted character; keep both eyes, both ears, nose, mouth, collar, and charm anatomically clear
Avoid: generic 3D animation look, plastic fur, excessive sparkles, tiny intricate background detail, dark frightening mood
```

## Soft storybook prompt

```text
Use case: illustration-story
Asset type: square collectible character portrait for a cheerful elementary-math game
Primary request: Create an original soft storybook portrait of Moonbeam, a cute lavender cat companion associated with quiet puzzles and moonlight.
Scene/backdrop: a complete square portrait with a dreamy painted violet evening sky, softly glowing crescent moon, subtle cloud shapes, and no transparent areas
Subject: one friendly lavender cat facing forward, expressive warm golden eyes, rounded youthful proportions, triangular ears with dusty-pink interiors, small pink nose, gentle darker lavender markings, a simple collar with a crescent-moon charm; unmistakably a cat; calm curious expression
Style/medium: high-quality hand-painted children's storybook illustration, visible but controlled gouache and colored-pencil texture, elegant shapes, soft edges balanced by a clear silhouette, cute and stylish rather than toddlerish
Composition/framing: centered head-and-upper-body portrait, character occupies roughly 70% of the square, ears and charm fully inside a generous safe margin, face readable when reduced to 96 pixels, no perspective distortion
Lighting/mood: quiet moonlight, cozy luminous warmth, gentle depth, moderate contrast
Color palette: muted lavender, plum, cream, moonlit yellow, dusty rose
Constraints: exactly one character; square full-bleed artwork; no words, letters, numbers, logos, signatures, UI, frames, badges, watermarks, extra limbs, costume clutter, photorealism, or recognizable copyrighted character; keep both eyes, both ears, nose, mouth, collar, and charm anatomically clear
Avoid: glossy 3D rendering, anime rendering, heavy black outlines, excessive sparkles, muddy low contrast, tiny intricate background detail, dark frightening mood
```

## Initial observations to verify in the Art Lab

- The sticker study has the strongest eye contrast and most dramatic reveal presentation.
- The storybook study feels warmer and more handcrafted but may lose some texture at compact size.
- The detailed SVG tests whether additional authored detail is enough without adopting raster production.
- Both generated studies appear more vertically cropped than the SVG candidates; compare their ears, tails, and charm at card size.
- A production direction must prove repeatability on two more cats and one Special Guest.

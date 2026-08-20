# Nook Neighbors Sticker Batch Record

This records the seven Sticker portraits generated to complete the first-pass Nook Neighbors roster after Biscuit, Aurora, and Moonbeam established the direction. These are unoptimized development candidates, not live catalog assets.

## Assets

| Cat | Master | Art Lab preview |
| --- | --- | --- |
| Sunny | `src/dev/assets/sunny-sticker-v1.png` | `src/dev/assets/sunny-sticker-v1-preview.png` |
| Cloud | `src/dev/assets/cloud-sticker-v1.png` | `src/dev/assets/cloud-sticker-v1-preview.png` |
| Cloud v2 | `src/dev/assets/cloud-sticker-v2.png` | `src/dev/assets/cloud-sticker-v2-preview.png` |
| Juniper | `src/dev/assets/juniper-sticker-v1.png` | `src/dev/assets/juniper-sticker-v1-preview.png` |
| Patches | `src/dev/assets/patches-sticker-v1.png` | `src/dev/assets/patches-sticker-v1-preview.png` |
| Gizmo | `src/dev/assets/gizmo-sticker-v1.png` | `src/dev/assets/gizmo-sticker-v1-preview.png` |
| Pepper | `src/dev/assets/pepper-sticker-v1.png` | `src/dev/assets/pepper-sticker-v1-preview.png` |
| Comet | `src/dev/assets/comet-sticker-v1.png` | `src/dev/assets/comet-sticker-v1-preview.png` |

Each built-in generation produced a 1254 by 1254 PNG. The 768-pixel copies keep the development Art Lab responsive while preserving each master unchanged.

## Sunny version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Sunny, the optimistic neighborhood greeter from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a cozy sunlit reading corner with an arched window, warm cream cushions, restrained purple accents, and one simple sun motif; quiet full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; rich golden-orange coat; slightly rounded cheeks; subtle darker orange ear edges; warm dark-brown expressive eyes; pink nose; one small pale-gold forehead marking shaped like a soft sun ray; simple collar with a clearly readable sunburst charm that must not resemble a plus sign or medical cross; welcoming, confident, cheerful expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait; character occupies about 71 percent of the square; both ears and sunburst charm inside generous safe margins; face and charm readable at 96 pixels
Lighting/mood: warm morning window light, bright and reassuring without excessive glow, moderate contrast
Color palette: golden orange, warm cream, soft gold, muted peach, restrained Number Nook purple
Constraints: exactly one character; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, costume clutter, books with visible text, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, yellow overload, sun rays surrounding the entire cat, plus signs, crosses, busy library detail, toddlerish proportions, plastic fur
```

## Cloud version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Cloud, the gentle daydreamer from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a quiet open-window nook with a pale blue sky and only a few broad rounded cloud shapes; full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; soft white coat; strongly readable puffy cheek and crown silhouette; visible sky-blue markings across the crown and one ear; blue-gray expressive eyes; pink nose; simple pale-blue collar; comforting, buoyant, quietly happy expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait; character occupies about 70 percent of the square; both ears and fluffy cheek outline inside generous safe margins; face, blue markings, and cloud identity readable at 96 pixels
Lighting/mood: soft clear daylight, airy and comforting, moderate contrast with enough blue edge separation that the white fur never disappears
Color palette: white, sky blue, pale aqua, warm cream, blue-gray, dusty pink
Constraints: exactly one character; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, wings, halo, costume clutter, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, angel imagery, dense clouds covering the body, blank white silhouette, stormy mood, excessive background detail, plastic fur
```

## Cloud version 2 edit prompt

Version 1 was supplied as the edit target.

```text
Use case: precise-object-edit
Asset type: square collectible portrait for the Number Nook children's math game
Input image 1: edit target
Primary request: Change only Cloud's sky-blue fur markings. Remove the large eyebrow-like blue shapes directly above both eyes and the broad irregular blue forehead shapes. Replace them with one small, natural sky-blue crown tuft centered high between the ears, with soft tapered fur-shaped edges, plus one narrow restrained sky-blue accent at the outer tip of one ear. No blue marking should sit immediately above either eye.
Preserve exactly: Cloud's identity; face and anatomy; large blue-gray eyes; pink nose; gentle expression; white fluffy cheek and crown silhouette; ears; body; pale-blue collar; pose; crop; open-window and cloud background; plant, curtains, cushions; lighting; palette; polished cute 2D storybook/sticker rendering; square composition.
Constraints: change only the blue fur markings; keep at least one clearly visible blue marking readable at 96px, but make it restrained and naturally fur-shaped; no new accessories, props, characters, text, logos, or watermark.
Avoid: symmetrical eyebrow shapes, blue bangs, a mask, flames, lightning bolts, horns, human-like hair, or a completely plain white forehead.
```

## Juniper version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Juniper, the patient plant keeper from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a cozy greenhouse window or plant nook with two or three large soft-focus leaves and warm cream architecture; restrained full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; warm brown tabby coat; cream muzzle; two or three broad dark forehead stripes; moss-green expressive eyes; dusty-rose nose; taller ears and small restrained cheek tufts; simple green collar; one clearly readable two-leaf sprig tucked near one ear without covering the eye; patient, observant, encouraging expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait; character occupies about 70 percent of the square; tall ears and leaf sprig inside generous safe margins; green eyes, tabby stripes, cream muzzle, and sprig readable at 96 pixels
Lighting/mood: gentle greenhouse window light, calm, growing, optimistic, moderate contrast
Color palette: warm brown, cream, moss green, leafy green, dusty rose, pale mint
Constraints: exactly one character; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, flower crown, costume clutter, garden tools, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, dense foliage, leaves covering the face, jungle scene, muddy low contrast, tiny plants, plastic fur
```

## Patches version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Patches, the curious artist from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a bright creative nook with a soft painted cream-to-lilac backdrop and one broad restrained three-color paint swipe; full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; cream calico coat; one large charcoal ear-and-eye patch; one large orange crown-and-cheek patch; clearly asymmetrical face; teal-green expressive eyes; coral-pink nose; one ear slightly more upright than the other; simple coral painter's neckerchief; playful, inventive, confident expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait; character occupies about 71 percent of the square; both ears and neckerchief inside generous safe margins; asymmetrical calico design and teal eyes readable at 96 pixels
Lighting/mood: cheerful studio-window light, creative and lively but not chaotic, moderate contrast
Color palette: warm cream, charcoal plum, orange, coral, teal, soft lilac
Constraints: exactly one character; only one broad paint-swipe motif; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, beret, costume clutter, multiple paintbrushes, tiny splatters, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, rainbow overload, messy paint covering the cat, busy art studio, symmetrical coat patches, plastic fur
```

## Gizmo version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Gizmo, the inventive tinkerer from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a cozy workshop nook with soft cream architecture, restrained teal and copper light, and only two or three large blurred round workshop shapes; full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; blue-gray coat; pale muzzle; darker mask-like brow markings; bright teal expressive eyes; muted pink nose; compact cheek fur; one subtly bent ear tip; two round copper goggles resting safely on the forehead above the eyes; simple collar with one readable six-tooth gear charm; focused, enthusiastic, slightly eccentric expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait; character occupies about 70 percent of the square; ears, goggles, and gear charm inside generous safe margins; teal eyes, bent ear, goggles, and gear readable at 96 pixels
Lighting/mood: warm workshop-window light with soft copper and teal accents, inventive, safe, welcoming, moderate contrast
Color palette: blue-gray, pale blue, teal, copper, warm cream, muted pink
Constraints: exactly one character; goggles stay above and do not cover the eyes; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, loose wires, sparks, hazardous tools, costume clutter, readable diagrams, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, steampunk overload, complex machinery, goggles over the eyes, mad-scientist mood, busy workshop, plastic fur
```

## Pepper version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Pepper, the bold explorer from The Nook Neighbors collection.
Scene/backdrop: a complete square portrait suggesting a breezy Number Nook porch overlooking a simple winding path, using only a few large soft shapes and warm coral light; restrained full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; charcoal coat; small lighter charcoal muzzle and chin accent; pale-gold expressive eyes; pink nose; simple coral explorer scarf with a clearly readable knot and one controlled trailing end; brave, energetic, friendly expression that never looks aggressive
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait with a slight sense of forward energy; character occupies about 70 percent of the square; ears, scarf knot, and trailing end inside generous safe margins; eyes and scarf identity readable at 96 pixels
Lighting/mood: adventurous golden-hour breeze, warm coral rim light, confident and hopeful, somewhat more dramatic than Common cats, moderate contrast
Color palette: charcoal plum, coral, pale gold, warm cream, dusty pink
Constraints: exactly one character; scarf creates one controlled diagonal; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, backpack, hat, map, compass, weapons, costume clutter, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, pirate imagery, superhero cape, threatening expression, black fur losing edge definition, busy landscape, plastic fur
```

## Comet version 1 prompt

```text
Use case: stylized-concept
Asset type: square collectible character portrait for Number Nook, a cheerful elementary-math game
Primary request: Create an original polished Sticker portrait of Comet, the joyful cosmic adventurer and Legendary member of The Nook Neighbors collection.
Scene/backdrop: a complete square portrait with a softly dimensional deep-violet night sky, sparse stars, and exactly one broad curved cyan comet trail that connects visually to the cat's movement; restrained full-bleed illustrated background with no transparent areas
Subject: exactly one unmistakable cat facing forward; deep-blue coat; lighter electric-blue ear and edge accents; luminous cyan expressive eyes; pink-violet nose; one bold cyan comet-streak marking across the forehead; the connected cyan comet sweep may read as part tail and part magical trail; joyful, fast, welcoming expression
Style/medium: premium 2D mobile-game collectible illustration, polished sticker/storybook hybrid, clean silhouette, crisp readable edges, controlled soft shading, restrained plush fur texture, cute and stylish rather than babyish, same visual family as Biscuit, Aurora, and Moonbeam from Number Nook
Composition/framing: centered head-and-upper-body portrait with controlled curved motion; character occupies about 69 percent of the square; both ears and connected comet sweep inside generous safe margins; face, cyan eyes, forehead streak, and trail readable at 96 pixels
Lighting/mood: luminous cyan and violet cosmic rim light, joyful and spectacular, strongest atmosphere in the collection while keeping the face brighter and more important than the effects
Color palette: deep blue, electric blue, cyan, violet, small pink-violet accents, sparse white stars
Constraints: exactly one character; exactly one primary comet trail; no words, letters, numbers, logos, signatures, UI, frames, rarity badges, watermarks, extra limbs, extra ears, wings, horn, helmet, costume clutter, planets with faces, or recognizable copyrighted character
Avoid: glossy 3D animation look, photorealism, galaxy overload, multiple tails, detached rocket shape, frightening space, excessive particles, face obscured by glow, plastic fur
```

## Initial review notes

- **Sunny:** Strong face, palette, forehead marking, and unmistakable sunburst charm. The background sun is fairly literal but does not compete as heavily as Biscuit version 1's repeated biscuits.
- **Cloud:** Version 1 has excellent white-fur separation and a puffy silhouette, but its broad mirrored blue forehead markings read as unnatural face decoration. Version 2 keeps the same identity and scene while reducing the blue to a small crown tuft and one ear accent. Version 2 is the leading candidate; version 1 remains in the Art Lab as a comparison.
- **Juniper:** Strong tabby identity and green eyes. The foliage is the busiest Common background, and the sprig has three leaves rather than the requested two; neither issue requires an automatic regeneration.
- **Patches:** The asymmetrical coat and painter identity are excellent. The flatter painted rendering is a visible departure from the more dimensional cats and should be judged in the contact sheet.
- **Gizmo:** Goggles, teal eyes, gear, and bent ear are exceptionally readable. The ear fold is more pronounced than “subtle,” but it creates a memorable silhouette.
- **Pepper:** Strong Rare candidate with excellent scarf motion and dark-fur edge contrast. The landscape is more scenic than Common backgrounds but supports the rarity step.
- **Comet:** Immediately Legendary, joyful, and readable. The trail is intentionally dominant; confirm it does not overpower the face in reveal and locked states.

## Review gate

1. Inspect all ten candidates together in `/?dev=art` at normal and 96-pixel sizes.
2. Judge rendering consistency separately from intentional rarity and personality differences.
3. Identify only specific problems that materially hurt identity, clarity, or collection cohesion.
4. Iterate one problem at a time and retain every accepted version.
5. Do not promote any master into the live catalog until the art-style toggle, production format, and caching strategy are implemented.

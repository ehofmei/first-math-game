# The Nook Neighbors Collection

This document is the production brief for Number Nook's first complete ten-cat collection. It defines the roster, rarity distribution, character identities, Classic SVG requirements, Polished Sticker requirements, and review sequence.

The collection is the pilot for a larger catalog. Its purpose is not merely to add five cats: it must prove that one collectible identity can remain recognizable across two art styles and that the same process can later support roughly ten collections and one hundred companions. Cats are expected to remain the majority, while future collections may feature dogs, birds, or other species.

## Collection definition

| Field | Value |
| --- | --- |
| Internal ID | `cozy-cats` |
| Player-facing name | The Nook Neighbors |
| Kind | Cat collection |
| Size | 10 cats |
| Setting | A welcoming little neighborhood centered around Number Nook |
| Mood | Cheerful, cozy, curious, gently magical |
| Core palette | Warm cream, Number Nook purple, soft gold, coral, sky blue, and leafy green |

The internal ID remains `cozy-cats` because the five existing collectible IDs are already suitable for save data and must not be renamed after release. The display name is independent of that permanent identifier.

Player-facing collection description:

> The friendly cats who make Number Nook feel like home, from sunny reading corners to starry rooftop hideaways.

The collection is deliberately varied. Its members share a neighborhood and an illustration language rather than one costume or narrow color scheme. This makes it a useful first test of whether the art direction can unify cats with different coats, silhouettes, personalities, and rarity levels.

## Rarity distribution

| Rarity | Count | Cats |
| --- | ---: | --- |
| Common | 4 | Sunny, Cloud, Biscuit, Juniper |
| Uncommon | 3 | Moonbeam, Patches, Gizmo |
| Rare | 2 | Pepper, Aurora |
| Legendary | 1 | Comet |

This distribution describes the contents of the collection, not capsule probabilities. Acquisition should eventually choose a rarity using the configured economy rules and then choose an eligible unowned cat within that rarity. Catalog composition and reward odds should remain independently tunable.

Button Bunny is not one of the ten cats. Button Bunny belongs to the separate `special-guests` collection, uses Special rarity, and participates in the same ownership, capsule, shop, companion, and art-style systems.

## Shared character rules

Every Nook Neighbor needs:

- a distinct silhouette or large identifying shape;
- a readable expression at 96 pixels;
- one signature motif that survives simplification;
- one dominant coat palette that is not easily confused with another member;
- a personality expressed through pose, eyes, ears, or accessory rather than text;
- a welcoming expression, including for bold or mysterious characters;
- a complete square composition with important features inside the safe area;
- equivalent identifying features in both Classic and Sticker art.

Accessories support identity but must not cover the eyes or become the only way to distinguish a cat. Tiny props, text, numbers, logos, and detailed scenery are not part of the character portrait.

## Art-style contract

Unlocking a cat unlocks the character, not an individual image. Classic and Sticker are alternate presentations of the same collectible and must share its name, description, rarity, ownership state, and gameplay behavior.

### Classic SVG

Classic is the original Number Nook vector treatment. New and revised assets should use the existing vocabulary intentionally:

- 400 by 400 square view box;
- rounded full-card background with a restrained two-color gradient;
- centered face or head-and-upper-body composition;
- simple filled shapes with approximately 8-to-12-pixel feature strokes;
- no texture that depends on raster filters;
- strong contrast between face, eyes, mouth, and background;
- a large signature motif near the lower edge or integrated into the silhouette;
- few enough shapes that the source remains understandable and hand-editable.

Classic cats should feel related without sharing an identical circular head and ear template. Cheek shape, ear proportions, fur tufts, markings, and accessories should create meaningful variation while preserving the simple visual grammar.

### Polished Sticker

Sticker is a premium 2D mobile-game portrait with clean edges, controlled dimensional shading, expressive eyes, a gently storybook-like finish, and a complete illustrated background.

- 1024 by 1024 master;
- square, full-bleed composition;
- head and upper body occupy approximately 68-to-74 percent of the canvas;
- both ears and the signature accessory remain inside a generous safe margin;
- face and defining markings remain readable at 96 pixels;
- soft dimensional lighting without glossy plastic fur;
- background reflects the cat's neighborhood activity without becoming a scene illustration;
- no text, letters, numbers, logos, frames, badges, signatures, or watermarks;
- exactly one character with clear anatomy and no extra limbs or duplicated accessories.

The current Moonbeam Sticker study is the leading tonal reference, not an approved production asset or immutable template. The full collection should refine its crop, safe margins, and repeatability before production assets are approved.

## Rarity expression

Rarity should affect anticipation, not whether a cat looks cared for.

| Rarity | Visual treatment |
| --- | --- |
| Common | Clear coat design, expressive face, one strong motif, simple supportive background |
| Uncommon | More distinctive markings or silhouette plus one additional accessory or background layer |
| Rare | Unusual color relationship, lighting, or large signature effect while retaining small-size clarity |
| Legendary | The collection's strongest silhouette, motion, glow, and atmosphere without visual clutter |

Do not make Common cats intentionally plain, unfinished, or less appealing. A child should be happy to choose any Nook Neighbor as a companion.

## Roster at a glance

| Cat | Rarity | Core palette | Personality/activity | Signature read |
| --- | --- | --- | --- | --- |
| Sunny | Common | Golden orange and warm cream | Optimistic neighborhood greeter | Sunburst charm |
| Cloud | Common | White and sky blue | Softhearted daydreamer | Puffy cheeks and cloud shapes |
| Biscuit | Common | Biscuit beige and cinnamon | Cheerful baker | Cinnamon freckles and biscuit medallion |
| Juniper | Common | Brown tabby and leafy green | Patient plant keeper | Leaf sprig and tall ears |
| Moonbeam | Uncommon | Lavender, violet, and warm gold | Quiet puzzle-loving stargazer | Crescent charm |
| Patches | Uncommon | Cream, charcoal, orange, and coral | Curious artist | Asymmetrical calico face and paint motif |
| Gizmo | Uncommon | Blue-gray, copper, and teal | Inventive tinkerer | Forehead goggles and gear charm |
| Pepper | Rare | Charcoal, coral, and pale gold | Bold explorer | Sweeping coral scarf |
| Aurora | Rare | Pearl, mint, rose, and violet | Radiant sky painter | Aurora forehead sweep and prism charm |
| Comet | Legendary | Deep blue, cyan, and violet | Fast cosmic adventurer | Luminous comet sweep |

## Classic draft implementation

All ten Classic portraits now have SVG drafts under `public/collectibles/`. Open `/?dev=art` during local development to review the complete roster at card size and 96 pixels, then toggle the shared locked-state preview.

The five existing production paths received focused refinements:

- Sunny's lower-right symbol is now an unmistakable sunburst.
- Cloud has a puffier silhouette and visible sky-blue coat markings.
- Moonbeam has readable golden eyes and a darker lavender forehead marking.
- Pepper's lower band is now a tied, flowing explorer scarf.
- Comet's cyan trail connects visually to the character instead of relying on a detached decoration.

The five new draft assets are:

- `public/collectibles/biscuit.svg`
- `public/collectibles/juniper.svg`
- `public/collectibles/patches.svg`
- `public/collectibles/gizmo.svg`
- `public/collectibles/aurora.svg`

The five new cats entered the live catalog only after the ten-cat Classic and Sticker contact sheets were accepted. Keeping draft files outside the catalog remains the rule for future packs so unfinished artwork and untuned economy changes cannot appear merely because an asset exists.

The first Biscuit and Aurora Sticker candidates and their exact prompts are recorded in [Nook Neighbors Sticker Anchor Record](./NOOK_NEIGHBORS_STICKER_ANCHORS.md).

The remaining first-pass Sticker portraits and prompts are recorded in [Nook Neighbors Sticker Batch Record](./NOOK_NEIGHBORS_STICKER_BATCH.md).

## Existing cats

The existing descriptions, stable IDs, and rarities remain authoritative. The notes below identify visual invariants and specific SVG review targets; they do not require automatic replacement of art that already works well in the application.

### Sunny

- **ID:** `cozy-cats:sunny`
- **Rarity:** Common
- **Description:** A warm-hearted cat who always spots the bright side.
- **Identity:** The welcoming face of the neighborhood: open, energetic, and reassuring.
- **Coat and face:** Golden-orange coat, slightly rounded cheeks, warm dark eyes, pink nose, and subtle darker ear edges.
- **Signature motif:** A simple sunburst charm.
- **Classic SVG review:** Preserve the excellent warm palette and clear face. Replace or refine the lower-right plus-shaped symbol so it unmistakably reads as a sun rather than a medical or addition symbol. Consider a small forehead ray marking or cheek shape to distinguish Sunny from the shared base head.
- **Sticker direction:** Warm window light and a suggestion of the Nook's sunny reading corner. Keep the background simple. Sunny should feel bright because of expression and lighting rather than excessive yellow glow.
- **Required invariants:** Golden-orange coat, welcoming open eyes, sunburst motif, warm cream-and-gold environment.
- **Alt text target:** A cheerful golden-orange cat with a sunburst charm.

### Cloud

- **ID:** `cozy-cats:cloud`
- **Rarity:** Common
- **Description:** A soft, bouncy cat who makes hard days lighter.
- **Identity:** A gentle daydreamer whose softness feels comforting rather than sleepy or timid.
- **Coat and face:** White coat, puffy cheek fur, sky-blue crown or ear markings, blue-gray eyes, and a pink nose.
- **Signature motif:** Layered cloud shapes along the lower composition.
- **Classic SVG review:** The existing white-and-blue contrast is clear. Add a genuinely fluffy cheek or crown silhouette and visible sky-blue coat markings so the artwork matches its alt text. Avoid relying solely on the cloud bank at the bottom to create identity.
- **Sticker direction:** Soft daylight with rounded clouds and a pale blue nook near an open window. Retain enough edge contrast that white fur does not disappear into the background.
- **Required invariants:** White fluffy silhouette, visible sky-blue markings, blue-gray eyes, cloud motif.
- **Alt text target:** A fluffy white cat with sky-blue markings and soft cloud shapes.

### Moonbeam

- **ID:** `cozy-cats:moonbeam`
- **Rarity:** Uncommon
- **Description:** A dreamy night owl who loves quiet puzzles.
- **Identity:** A calm stargazer who is thoughtful, curious, and quietly confident.
- **Coat and face:** Lavender coat, darker lavender markings, warm golden eyes, dusty-pink ear interiors, and a small pink nose.
- **Signature motif:** A collar with a crescent-moon charm.
- **Classic SVG review:** Preserve the restful expression and strong crescent. Consider opening the eyes enough to establish the golden-eye invariant used by Sticker art, or use simplified golden crescent eyes that still read clearly. Add one restrained darker-lavender marking so Moonbeam is not identified only by palette.
- **Sticker direction:** Follow the approved bake-off brief: a softly dimensional violet night background, restrained stars, moonlit rim light, and a warm crescent motif.
- **Required invariants:** Lavender coat, golden eyes, crescent charm, calm expression, moonlit violet setting.
- **Alt text target:** A calm lavender cat with golden eyes and a crescent-moon charm.

### Pepper

- **ID:** `cozy-cats:pepper`
- **Rarity:** Rare
- **Description:** A bold little explorer who never gives up.
- **Identity:** Brave and energetic without looking aggressive; the cat most likely to suggest taking the interesting path.
- **Coat and face:** Charcoal coat, pale-gold eyes, pink nose, and a small lighter muzzle or chin accent.
- **Signature motif:** A coral explorer scarf with a readable knot or trailing end.
- **Classic SVG review:** The dark coat and coral palette are distinctive. Refine the broad lower band into a recognizable scarf shape and introduce a simple face marking or muzzle accent. Preserve high contrast around the eyes and mouth.
- **Sticker direction:** A breezy porch, map-table, or path suggestion in the background, with the scarf creating one controlled diagonal. Do not add a backpack, hat, map, and compass simultaneously.
- **Required invariants:** Charcoal coat, pale-gold eyes, coral scarf, bold friendly expression.
- **Alt text target:** A bold charcoal cat wearing a flowing coral explorer scarf.

### Comet

- **ID:** `cozy-cats:comet`
- **Rarity:** Legendary
- **Description:** A cosmic cat who races answers across the stars.
- **Identity:** The neighborhood's spectacular adventurer: fast, joyful, and unmistakably magical.
- **Coat and face:** Deep-blue coat, lighter electric-blue edge accents, luminous cyan eyes, and a pink-violet nose.
- **Signature motif:** A connected comet sweep that reads as part tail, part magical trail.
- **Classic SVG review:** Preserve the excellent dark background and cyan contrast. Make the lower-right comet shape feel deliberately connected to Comet's movement or silhouette rather than like a detached decoration. A single forehead streak may reinforce identity at compact size.
- **Sticker direction:** Deep violet space with a strong curved cyan trail and sparse stars. Use the most atmospheric lighting in the collection, but keep the face brighter and more important than the effects.
- **Required invariants:** Deep-blue coat, cyan eyes and accents, curved comet trail, joyful forward energy.
- **Alt text target:** A deep-blue cosmic cat with glowing cyan eyes and a sweeping comet trail.

## New cats

The text below is sufficiently specific to guide both the first SVG pass and later Sticker prompts. Exact small decorative details may change during visual review, but the required invariants should remain stable once an asset is accepted.

### Biscuit

- **Planned ID:** `cozy-cats:biscuit`
- **Rarity:** Common
- **Description:** A cheerful baker who believes every problem is easier with a warm snack.
- **Identity:** Round, practical, and immediately friendly; Biscuit is proud of helping without needing to be the center of attention.
- **Coat and face:** Pale biscuit-beige coat, slightly darker rounded ears, cinnamon freckles on both cheeks, warm brown eyes, and a terracotta-pink nose.
- **Silhouette:** Broad round cheeks with a small tidy chest ruff. Keep Biscuit visibly beige rather than orange so Sunny remains distinct.
- **Signature motif:** A round biscuit medallion with several large dot marks; a small cream neckerchief may support the baker identity.
- **Classic SVG recipe:** Cream-to-peach background gradient; beige rounded head with darker ear caps; large brown oval eyes; three or four oversized cinnamon freckles total; simple cream neckerchief; biscuit medallion near the lower-right edge. Do not draw tiny crumbs or kitchen tools.
- **Sticker direction:** Warm bakery-window light with only a soft checked-cloth or round pastry motif in the background. Fur should be smooth and plush, not photorealistic. The medallion and freckles must survive the 96-pixel view.
- **Required invariants:** Biscuit-beige coat, cinnamon freckles, warm brown eyes, round medallion, broad friendly silhouette.
- **Alt text target:** A round biscuit-beige cat with cinnamon freckles and a biscuit medallion.

### Juniper

- **Planned ID:** `cozy-cats:juniper`
- **Rarity:** Common
- **Description:** A patient plant keeper who knows that small progress grows into big things.
- **Identity:** Observant, patient, and quietly encouraging; Juniper celebrates every new leaf.
- **Coat and face:** Warm brown tabby coat, cream muzzle, two or three broad dark forehead stripes, moss-green eyes, and a dusty-rose nose.
- **Silhouette:** Taller ears and a slightly narrower face than the other Common cats, plus one restrained cheek tuft on each side.
- **Signature motif:** A large two-leaf sprig tucked near one ear or attached to a simple green collar.
- **Classic SVG recipe:** Pale mint-to-warm-cream gradient; brown head with clear cream muzzle and broad tabby markings; green almond-shaped eyes; simple leaf sprig; large rounded leaf motif at the lower edge. Use only a few plant shapes.
- **Sticker direction:** Gentle greenhouse or window-sill light with broad leaves blurred into the background. Avoid flower crowns and dense foliage that would obscure the ears or face.
- **Required invariants:** Brown tabby coat, cream muzzle, green eyes, tall ears, two-leaf sprig.
- **Alt text target:** A patient brown tabby cat with green eyes and a leafy sprig.

### Patches

- **Planned ID:** `cozy-cats:patches`
- **Rarity:** Uncommon
- **Description:** A curious artist who turns every mistake into part of the picture.
- **Identity:** Playful and inventive, with visible asymmetry that feels designed rather than messy.
- **Coat and face:** Cream calico coat, one charcoal ear and eye patch, one orange crown-and-cheek patch, teal-green eyes, and a coral-pink nose.
- **Silhouette:** One ear sits slightly more upright than the other. Coat patches must define the face even when all accessories are hidden.
- **Signature motif:** A coral painter's neckerchief and one broad three-color paint-swipe motif.
- **Classic SVG recipe:** Pale coral-to-lilac gradient; cream head; large charcoal and orange patches with clean boundaries; teal eyes; coral neckerchief; three bold paint ovals or one broad painted arc near the lower edge. Do not use tiny splatters.
- **Sticker direction:** A bright studio nook suggested by a soft painted backdrop. Include at most one brush tucked behind an ear if it remains anatomically clear. The calico design, not the prop, is the primary identity.
- **Required invariants:** Asymmetrical cream-charcoal-orange face, teal eyes, coral neckerchief, broad paint motif.
- **Alt text target:** A playful calico cat with teal eyes, a coral neckerchief, and colorful paint marks.

### Gizmo

- **Planned ID:** `cozy-cats:gizmo`
- **Rarity:** Uncommon
- **Description:** An inventive tinkerer who loves discovering more than one way to solve a problem.
- **Identity:** Focused, enthusiastic, and a little eccentric, but never frantic or unsafe.
- **Coat and face:** Blue-gray coat, pale muzzle, darker mask-like brow markings, bright teal eyes, and a muted pink nose.
- **Silhouette:** Compact cheek fur, one subtly bent ear tip, and rounded copper goggles resting above the eyes.
- **Signature motif:** Two-lens forehead goggles and a simple gear charm.
- **Classic SVG recipe:** Pale aqua-to-soft-gray gradient; blue-gray head with pale muzzle; teal eyes; two large copper goggle circles connected by a band above the brow; one six-tooth gear motif near the lower edge. Keep the goggles off the eyes.
- **Sticker direction:** A cozy workshop with soft copper and teal light, suggested by a few large round shapes. Avoid loose wires, complex machinery, readable diagrams, or an overload of tools.
- **Required invariants:** Blue-gray coat, teal eyes, bent ear tip, copper forehead goggles, gear charm.
- **Alt text target:** A blue-gray tinkering cat with teal eyes, copper goggles, and a gear charm.

### Aurora

- **Planned ID:** `cozy-cats:aurora`
- **Rarity:** Rare
- **Description:** A radiant sky painter who leaves ribbons of color wherever curiosity leads.
- **Identity:** Graceful, imaginative, and luminous. Aurora supplies wonder without competing with Comet's speed or Moonbeam's nighttime calm.
- **Coat and face:** Pearly cream coat, mint-to-rose aurora marking sweeping across the forehead and one cheek, violet eyes, and a soft rose nose.
- **Silhouette:** Long elegant ear points and a flowing chest tuft, clearly different from Cloud's rounded fluff.
- **Signature motif:** A prism-shaped collar charm and one broad mint-rose-violet ribbon of light.
- **Classic SVG recipe:** Deep plum-to-dawn-lilac gradient; pearly head with a single clean multicolor forehead sweep; violet oval eyes; angular prism charm; one translucent three-band arc along the lower or side edge. Avoid numerous sparkles and tiny gradient fragments.
- **Sticker direction:** A quiet rooftop at dawn with one controlled aurora ribbon providing colored rim light. Use pearlescent lighting rather than metallic or glittery fur. Aurora is Rare because of the unusual light and marking design, not extra costume pieces.
- **Required invariants:** Pearly coat, mint-rose forehead sweep, violet eyes, long ear silhouette, prism charm, broad aurora ribbon.
- **Alt text target:** A pearly cat with violet eyes, a colorful aurora marking, and a prism charm.

## Existing SVG review checklist

Review all five current cats together before drawing the newcomers:

- Do the portraits still feel appealing beside the selected Sticker reference?
- Does each cat remain identifiable without the lower-right motif?
- Are the alt-text coat markings actually present in the image?
- Do the head and ear silhouettes vary enough across the collection?
- Are dark features visible against both the cat and background?
- Does every signature item read as its intended object at 96 pixels?
- Are the backgrounds equally saturated and visually balanced?
- Are any details unintentionally coded as an interface symbol?
- Do all important features survive the locked grayscale treatment?
- Can revisions reuse a common SVG vocabulary without returning to one identical face template?

The objective is a coherent refresh, not detail for its own sake. Existing art that passes these checks should remain simple.

## Sticker generation brief

Use this collection layer between the global Sticker style instructions and each cat's individual recipe:

```text
Collection: The Nook Neighbors, the friendly cats who live around a cozy little neighborhood centered on Number Nook.
Shared world: welcoming reading corners, window seats, porches, small gardens, creative worktables, and gently magical rooftops.
Shared mood: cheerful, cozy, curious, reassuring, and family-friendly for children roughly seven to nine years old; cute and stylish rather than babyish.
Shared visual language: polished 2D mobile-game collectible portrait with a clean sticker-like silhouette, controlled storybook warmth, soft dimensional lighting, expressive readable eyes, restrained texture, and a cream-purple-gold family resemblance.
Background rule: suggest one part of the neighborhood using a few large shapes and controlled motifs; do not create a busy narrative scene.
Consistency rule: match the approved reference portraits for crop, proportions, eye treatment, edge treatment, lighting strength, and background depth while preserving the named cat's required invariants.
```

The complete generation request should be assembled as:

1. global Sticker composition and safety rules from `COLLECTIBLE_ART.md`;
2. the Nook Neighbors collection layer above;
3. one cat's individual identity, palette, silhouette, motif, and required invariants;
4. explicit negative constraints relevant to that cat;
5. approved reference images.

## Production sequence

1. Review Sunny, Moonbeam, Pepper, Cloud, and Comet together in the Art Lab and at actual game sizes.
2. Record which existing Classic assets pass unchanged and which need a focused revision.
3. Draw Classic SVGs for Biscuit, Juniper, Patches, Gizmo, and Aurora.
4. Inspect all ten Classic cats as one contact sheet, including locked grayscale and 96-pixel views.
5. Generate a small Sticker anchor set spanning the visual range. Moonbeam may serve as the first reference; Sunny, Pepper, and Comet are useful additional stress cases.
6. Refine and lock the Sticker style bible from the accepted anchors.
7. Generate the remaining Sticker portraits in small batches, always reviewing them beside the approved roster.
8. Optimize approved masters into production assets and record prompt/reference lineage.
9. Add collection metadata, dual asset references, the master art-style preference, fallbacks, and on-demand image caching to the application.
10. Add the per-companion theme contract and restrained setup, game-header, and results placements defined in [Companion Identity, Themes, and Presence](./COMPANION_SYSTEM.md).
11. Verify the collection view, unified gallery, shop, capsule reveal, companion placements, backup/restore, offline behavior, and multiple device sizes.

The full sequence is implemented for the first collection. All ten cats are live with Classic SVG and 768-pixel production WebP references; Biscuit v1 and Cloud v2 are the selected revisions. The save-backed gallery setting switches the complete app between Polished Sticker and Simple SVG. Button Bunny now extends the same dual-art contract to a Special Guest, while the generic fallback remains tested independently. The three starter Stickers are precached and the remaining raster portraits use on-demand Cache First storage.

## Acceptance criteria

The first collection is production-ready when:

- all ten cats have permanent IDs, descriptions, rarities, and accessible alt text;
- the roster contains exactly four Common, three Uncommon, two Rare, and one Legendary cat;
- every cat has an approved Classic asset and Sticker asset;
- switching art style never changes ownership, rarity, economy, or equipped-companion state;
- each cat is identifiable in both styles at 96 pixels;
- the ten Sticker portraits look like one world rather than ten unrelated prompts;
- the ten Classic portraits feel deliberately varied rather than simple recolors;
- locked and unlocked gallery states remain understandable;
- production assets meet the agreed image-size budget and offline caching policy;
- content validation, automated tests, and phone/tablet visual checks pass.

## Deliberately deferred decisions

- Exact rarity roll odds and guarantee windows
- Collection-completion reward
- Whether future capsules can feature one collection
- Whether a much larger catalog ships together or arrives as repository content updates

The gallery now uses **Polished Sticker** and **Simple SVG** as the player-facing choices, and locked cards use the selected portrait's grayscale silhouette. The remaining choices do not block later collection expansion.

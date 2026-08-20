import { useMemo, useState } from 'react';
import auroraSticker from './assets/aurora-sticker-v1-preview.png';
import biscuitStickerV1 from './assets/biscuit-sticker-v1-preview.png';
import biscuitStickerV2 from './assets/biscuit-sticker-v2-preview.png';
import buttonBunnySticker from './assets/button-bunny-sticker-v1-preview.png';
import cloudStickerV1 from './assets/cloud-sticker-v1-preview.png';
import cloudStickerV2 from './assets/cloud-sticker-v2-preview.png';
import cometSticker from './assets/comet-sticker-v1-preview.png';
import gizmoSticker from './assets/gizmo-sticker-v1-preview.png';
import juniperSticker from './assets/juniper-sticker-v1-preview.png';
import moonbeamDetailed from './assets/moonbeam-detailed.svg';
import moonbeamSticker from './assets/moonbeam-sticker.png';
import moonbeamStickerPreview from './assets/moonbeam-sticker-v1-preview.png';
import moonbeamStorybook from './assets/moonbeam-storybook.png';
import patchesSticker from './assets/patches-sticker-v1-preview.png';
import pepperSticker from './assets/pepper-sticker-v1-preview.png';
import sunnySticker from './assets/sunny-sticker-v1-preview.png';

interface ArtTreatment {
  id: string;
  name: string;
  medium: string;
  description: string;
  image: string;
  alt: string;
}

interface ClassicCat {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  image: string;
  alt: string;
  signature: string;
  status: 'Refined existing' | 'New draft';
}

const classicAsset = (filename: string) => `${import.meta.env.BASE_URL}collectibles/${filename}`;

const CLASSIC_CATS: readonly ClassicCat[] = [
  {
    id: 'sunny',
    name: 'Sunny',
    rarity: 'common',
    image: classicAsset('sunny.svg'),
    alt: 'A cheerful golden-orange cat with a sunburst charm',
    signature: 'Sunburst charm',
    status: 'Refined existing',
  },
  {
    id: 'cloud',
    name: 'Cloud',
    rarity: 'common',
    image: classicAsset('cloud.svg'),
    alt: 'A fluffy white cat with sky-blue markings and soft cloud shapes',
    signature: 'Puffy cloud shapes',
    status: 'Refined existing',
  },
  {
    id: 'biscuit',
    name: 'Biscuit',
    rarity: 'common',
    image: classicAsset('biscuit.svg'),
    alt: 'A round biscuit-beige cat with cinnamon freckles and a biscuit medallion',
    signature: 'Cinnamon freckles',
    status: 'New draft',
  },
  {
    id: 'juniper',
    name: 'Juniper',
    rarity: 'common',
    image: classicAsset('juniper.svg'),
    alt: 'A patient brown tabby cat with green eyes and a leafy sprig',
    signature: 'Leaf sprig',
    status: 'New draft',
  },
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    rarity: 'uncommon',
    image: classicAsset('moonbeam.svg'),
    alt: 'A calm lavender cat with golden eyes and a crescent-moon charm',
    signature: 'Crescent charm',
    status: 'Refined existing',
  },
  {
    id: 'patches',
    name: 'Patches',
    rarity: 'uncommon',
    image: classicAsset('patches.svg'),
    alt: 'A playful calico cat with teal eyes, a coral neckerchief, and colorful paint marks',
    signature: 'Calico paint motif',
    status: 'New draft',
  },
  {
    id: 'gizmo',
    name: 'Gizmo',
    rarity: 'uncommon',
    image: classicAsset('gizmo.svg'),
    alt: 'A blue-gray tinkering cat with teal eyes, copper goggles, and a gear charm',
    signature: 'Copper goggles',
    status: 'New draft',
  },
  {
    id: 'pepper',
    name: 'Pepper',
    rarity: 'rare',
    image: classicAsset('pepper.svg'),
    alt: 'A bold charcoal cat wearing a flowing coral explorer scarf',
    signature: 'Explorer scarf',
    status: 'Refined existing',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    rarity: 'rare',
    image: classicAsset('aurora.svg'),
    alt: 'A pearly cat with violet eyes, a colorful aurora marking, and a prism charm',
    signature: 'Aurora marking',
    status: 'New draft',
  },
  {
    id: 'comet',
    name: 'Comet',
    rarity: 'legendary',
    image: classicAsset('comet.svg'),
    alt: 'A deep-blue cosmic cat with glowing cyan eyes and a sweeping comet trail',
    signature: 'Comet trail',
    status: 'Refined existing',
  },
];

const STICKER_ANCHORS = [
  {
    id: 'sunny',
    name: 'Sunny',
    rarity: 'common',
    classic: classicAsset('sunny.svg'),
    purpose: 'Common warmth',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: sunnySticker,
        alt: 'Sunny Sticker version 1 with golden-orange fur and a sunburst charm',
      },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud',
    rarity: 'common',
    classic: classicAsset('cloud.svg'),
    purpose: 'White-fur contrast',
    preferredVersion: 'Sticker v2',
    stickers: [
      {
        version: 'Sticker v1',
        image: cloudStickerV1,
        alt: 'Cloud Sticker version 1 with white fluffy fur and sky-blue markings',
      },
      {
        version: 'Sticker v2',
        image: cloudStickerV2,
        alt: 'Cloud Sticker version 2 with a small sky-blue crown tuft and one blue ear accent',
      },
    ],
  },
  {
    id: 'biscuit',
    name: 'Biscuit',
    rarity: 'common',
    classic: classicAsset('biscuit.svg'),
    purpose: 'Warm baseline',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: biscuitStickerV1,
        alt: 'Biscuit Sticker version 1 with large biscuits in the background',
      },
      {
        version: 'Sticker v2',
        image: biscuitStickerV2,
        alt: 'Biscuit Sticker version 2 in a simple cushioned window nook',
      },
    ],
  },
  {
    id: 'juniper',
    name: 'Juniper',
    rarity: 'common',
    classic: classicAsset('juniper.svg'),
    purpose: 'Natural texture',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: juniperSticker,
        alt: 'Juniper Sticker version 1 with brown tabby fur, green eyes, and a leaf sprig',
      },
    ],
  },
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    rarity: 'uncommon',
    classic: classicAsset('moonbeam.svg'),
    purpose: 'Original style bridge',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: moonbeamStickerPreview,
        alt: 'Moonbeam Sticker version 1 with lavender fur and a crescent charm',
      },
    ],
  },
  {
    id: 'patches',
    name: 'Patches',
    rarity: 'uncommon',
    classic: classicAsset('patches.svg'),
    purpose: 'Graphic variation',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: patchesSticker,
        alt: 'Patches Sticker version 1 with asymmetrical calico fur and a coral neckerchief',
      },
    ],
  },
  {
    id: 'gizmo',
    name: 'Gizmo',
    rarity: 'uncommon',
    classic: classicAsset('gizmo.svg'),
    purpose: 'Accessory density',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: gizmoSticker,
        alt: 'Gizmo Sticker version 1 with copper goggles, teal eyes, and a gear charm',
      },
    ],
  },
  {
    id: 'pepper',
    name: 'Pepper',
    rarity: 'rare',
    classic: classicAsset('pepper.svg'),
    purpose: 'Rare motion',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: pepperSticker,
        alt: 'Pepper Sticker version 1 with charcoal fur, golden eyes, and a coral scarf',
      },
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    rarity: 'rare',
    classic: classicAsset('aurora.svg'),
    purpose: 'Rare atmosphere',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: auroraSticker,
        alt: 'Aurora Sticker version 1 with colorful fur markings and a prism charm',
      },
    ],
  },
  {
    id: 'comet',
    name: 'Comet',
    rarity: 'legendary',
    classic: classicAsset('comet.svg'),
    purpose: 'Legendary spectacle',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: cometSticker,
        alt: 'Comet Sticker version 1 with deep-blue fur, cyan eyes, and a comet trail',
      },
    ],
  },
  {
    id: 'button-bunny',
    name: 'Button Bunny',
    rarity: 'special',
    classic: classicAsset('button-bunny.svg'),
    purpose: 'Special Guest plush',
    preferredVersion: 'Sticker v1',
    stickers: [
      {
        version: 'Sticker v1',
        image: buttonBunnySticker,
        alt: 'Button Bunny Sticker version 1 with teal plush fabric and a yellow button',
      },
    ],
  },
] as const;

type StickerAnchor = (typeof STICKER_ANCHORS)[number];

const preferredSticker = (cat: StickerAnchor) =>
  cat.stickers.find(({ version }) => version === cat.preferredVersion) ?? cat.stickers[0];

const ART_TREATMENTS: readonly ArtTreatment[] = [
  {
    id: 'simple-svg',
    name: 'Simple SVG',
    medium: 'Classic · vector',
    description: 'The supported original style establishes the clarity and weight baseline.',
    image: `${import.meta.env.BASE_URL}collectibles/moonbeam.svg`,
    alt: 'Current simple lavender Moonbeam cat illustration',
  },
  {
    id: 'detailed-svg',
    name: 'Detailed SVG',
    medium: 'Hand-authored · vector',
    description:
      'Layered shading, texture, lighting, expressive eyes, and a more dimensional charm.',
    image: moonbeamDetailed,
    alt: 'Detailed vector illustration of Moonbeam beneath a crescent moon',
  },
  {
    id: 'sticker-raster',
    name: 'Polished sticker',
    medium: 'Generated study · raster',
    description: 'Crisp mobile-game rendering, strong contrast, and the clearest small-size face.',
    image: moonbeamSticker,
    alt: 'Polished sticker-style illustration of Moonbeam beneath a crescent moon',
  },
  {
    id: 'storybook-raster',
    name: 'Soft storybook',
    medium: 'Generated study · raster',
    description:
      'Gouache-like texture, gentler contrast, and a warmer illustrated-book personality.',
    image: moonbeamStorybook,
    alt: 'Soft storybook illustration of Moonbeam in a moonlit sky',
  },
];

const SCALE_SAMPLES = [
  { size: 96, label: 'Compact' },
  { size: 155, label: 'Phone' },
  { size: 230, label: 'Home' },
  { size: 290, label: 'Reveal' },
] as const;

export function ArtLab() {
  const [selectedId, setSelectedId] = useState(ART_TREATMENTS[0]!.id);
  const [showClassicLocked, setShowClassicLocked] = useState(false);
  const selected = useMemo(
    () => ART_TREATMENTS.find(({ id }) => id === selectedId) ?? ART_TREATMENTS[0]!,
    [selectedId],
  );

  return (
    <main className="state-gallery art-lab page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Development only</span>
          <h1>Number Nook Art Lab</h1>
          <p>
            Review companion identities across Classic and Sticker art, from the complete Nook
            Neighbors collection to its first Special Guest.
          </p>
          <nav className="lab-links" aria-label="Development labs">
            <a href="?dev=states">State gallery</a>
            <a href="?dev=sounds">Sound Lab</a>
            <a href="?dev=themes">Theme Lab</a>
            <a href="?dev=companions">Companion Lab</a>
            <a href={import.meta.env.BASE_URL}>Playable app</a>
          </nav>
        </div>
      </header>

      <section className="panel art-comparison" aria-labelledby="art-comparison-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Bake-off</span>
            <h2 id="art-comparison-heading">Four versions of Moonbeam</h2>
            <p>Select a treatment to use throughout the context tests below.</p>
          </div>
          <span className="mode-pill">{selected.name}</span>
        </div>

        <div className="art-treatment-grid">
          {ART_TREATMENTS.map((treatment) => (
            <button
              className={`art-treatment ${selected.id === treatment.id ? 'art-treatment--selected' : ''}`}
              type="button"
              key={treatment.id}
              aria-pressed={selected.id === treatment.id}
              onClick={() => setSelectedId(treatment.id)}
            >
              <img src={treatment.image} alt={treatment.alt} />
              <span className="art-treatment-copy">
                <strong>{treatment.name}</strong>
                <small>{treatment.medium}</small>
                <span>{treatment.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel sticker-anchors" aria-labelledby="sticker-anchors-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Sticker candidates</span>
            <h2 id="sticker-anchors-heading">Companion Sticker contact sheet</h2>
            <p>
              Compare identity across styles and inspect approved source portraits at compact size.
            </p>
          </div>
          <span className="mode-pill">11 companions</span>
        </div>

        <div className="sticker-anchor-grid">
          {STICKER_ANCHORS.map((cat) => (
            <article className="sticker-anchor-card" data-testid={`sticker-${cat.id}`} key={cat.id}>
              <div className="sticker-anchor-heading">
                <div>
                  <h3>{cat.name}</h3>
                  <span className={`rarity rarity--${cat.rarity}`}>{cat.rarity}</span>
                </div>
                <small>{cat.purpose}</small>
              </div>
              <div className="sticker-anchor-images">
                <figure>
                  <img src={cat.classic} alt={`${cat.name} in the Classic style`} />
                  <figcaption>Classic</figcaption>
                </figure>
                {cat.stickers.map((sticker) => (
                  <figure key={sticker.version}>
                    <img src={sticker.image} alt={sticker.alt} loading="lazy" />
                    <figcaption>
                      {sticker.version}
                      {sticker.version === cat.preferredVersion ? ' · leading' : ''}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="sticker-anchor-compact">
                <span>96 px</span>
                <img
                  src={preferredSticker(cat).image}
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel classic-collection" aria-labelledby="classic-collection-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Classic draft</span>
            <h2 id="classic-collection-heading">The Nook Neighbors</h2>
            <p>
              Check silhouette, palette, signature motif, and rarity balance across all ten cats.
            </p>
          </div>
          <span className="mode-pill">10 / 10 drafted</span>
        </div>

        <div className="classic-collection-actions">
          <button
            className="secondary-button"
            type="button"
            aria-pressed={showClassicLocked}
            onClick={() => setShowClassicLocked((locked) => !locked)}
          >
            {showClassicLocked ? 'Show unlocked colors' : 'Preview locked'}
          </button>
          <span>
            Toggle every portrait together to find silhouettes that collapse in grayscale.
          </span>
        </div>

        <div
          className={`classic-roster ${showClassicLocked ? 'classic-roster--locked' : ''}`}
          data-testid="classic-roster"
        >
          {CLASSIC_CATS.map((cat) => (
            <article className="classic-cat-card" key={cat.id}>
              <div className="classic-cat-art">
                <img src={cat.image} alt={cat.alt} />
                {showClassicLocked ? <span aria-hidden="true">?</span> : null}
              </div>
              <div className="classic-cat-copy">
                <div>
                  <strong>{cat.name}</strong>
                  <span className={`rarity rarity--${cat.rarity}`}>{cat.rarity}</span>
                </div>
                <span>{cat.signature}</span>
                <small>{cat.status}</small>
              </div>
            </article>
          ))}
        </div>

        <div className="classic-compact-check" aria-label="Classic 96 pixel comparison">
          <strong>Actual 96 px comparison</strong>
          <div>
            {CLASSIC_CATS.map((cat) => (
              <figure key={cat.id}>
                <img
                  className={showClassicLocked ? 'classic-compact-locked' : undefined}
                  src={cat.image}
                  alt=""
                  width="96"
                  height="96"
                />
                <figcaption>{cat.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="art-scale-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Readability</span>
            <h2 id="art-scale-heading">Actual-size samples</h2>
            <p>Judge the face and identifying details without enlarging the page.</p>
          </div>
        </div>
        <div className="art-scale-row">
          {SCALE_SAMPLES.map(({ size, label }) => (
            <figure key={size}>
              <img src={selected.image} alt="" width={size} height={size} />
              <figcaption>
                <strong>{label}</strong>
                <span>{size} px</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="art-context-heading">
        <div className="art-section-heading">
          <div>
            <span className="eyebrow">Fit check</span>
            <h2 id="art-context-heading">Game contexts</h2>
            <p>These simulations reuse the current crops, backgrounds, shadows, and lock filter.</p>
          </div>
        </div>

        <div className="art-context-grid">
          <article className="art-context-card">
            <span className="art-context-label">Collection card</span>
            <div className="art-gallery-preview">
              <img src={selected.image} alt="" />
              <div>
                <strong>Moonbeam</strong>
                <span className="rarity rarity--uncommon">uncommon</span>
              </div>
            </div>
          </article>

          <article className="art-context-card">
            <span className="art-context-label">Equipped at home</span>
            <div className="art-home-preview">
              <img src={selected.image} alt="" />
              <strong>Moonbeam</strong>
              <span>is ready!</span>
            </div>
          </article>

          <article className="art-context-card">
            <span className="art-context-label">Capsule reveal</span>
            <div className="art-reveal-preview">
              <span aria-hidden="true">✦</span>
              <img src={selected.image} alt="" />
              <strong>You found Moonbeam!</strong>
            </div>
          </article>

          <article className="art-context-card">
            <span className="art-context-label">Locked silhouette</span>
            <div className="art-locked-preview">
              <img src={selected.image} alt="" />
              <span aria-hidden="true">?</span>
            </div>
          </article>
        </div>
      </section>

      <section className="panel art-lab-notes">
        <h2>What to look for</h2>
        <ul>
          <li>Which face has the strongest immediate appeal without feeling too young?</li>
          <li>Can you still read the expression and crescent identity at 96 pixels?</li>
          <li>Does the art belong beside the existing cream-and-purple interface?</li>
          <li>Does the locked image remain recognizable without revealing too much?</li>
          <li>Could the treatment plausibly stay consistent across one hundred cats and Guests?</li>
        </ul>
        <p>
          The Classic roster is a production draft, while the additional Moonbeam treatments remain
          studies. Review all ten cats together before adding the five newcomers to the live
          catalog.
        </p>
      </section>
    </main>
  );
}

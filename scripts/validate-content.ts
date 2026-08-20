import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { DIALOGUE_PHRASES } from '../src/companions/phrases.ts';
import { COMPANION_PERSONALITIES } from '../src/companions/personalities.ts';
import { validateCompanionContent } from '../src/companions/validation.ts';
import { catalog } from '../src/content/catalog.ts';

const ids = new Set<string>();
const collectionIds = new Set<string>();
const sortOrders = new Set<number>();
const MAX_STICKER_BYTES = 150_000;

function validateStickerDimensions(asset: string, assetPath: string, collectibleId: string) {
  const source = readFileSync(assetPath);
  let width: number | undefined;
  let height: number | undefined;
  if (asset.endsWith('.png')) {
    width = source.readUInt32BE(16);
    height = source.readUInt32BE(20);
  } else if (asset.endsWith('.webp') && source.toString('ascii', 12, 16) === 'VP8X') {
    width = source.readUIntLE(24, 3) + 1;
    height = source.readUIntLE(27, 3) + 1;
  }
  if (width !== undefined && (width !== height || width < 580 || width > 1_024)) {
    throw new Error(
      `Sticker art for ${collectibleId} must be square and 580–1024 pixels; found ${width}x${height}.`,
    );
  }
}
for (const collection of catalog.collections) {
  if (collectionIds.has(collection.id))
    throw new Error(`Duplicate collection ID: ${collection.id}`);
  collectionIds.add(collection.id);
}

for (const collectible of catalog.collectibles) {
  if (ids.has(collectible.id)) throw new Error(`Duplicate collectible ID: ${collectible.id}`);
  ids.add(collectible.id);
  if (sortOrders.has(collectible.sortOrder)) {
    throw new Error(`Duplicate collectible sort order: ${collectible.sortOrder}`);
  }
  sortOrders.add(collectible.sortOrder);
  if (!collectionIds.has(collectible.collectionId)) {
    throw new Error(`Unknown collection ${collectible.collectionId} for ${collectible.id}.`);
  }

  for (const [style, asset] of Object.entries(collectible.art)) {
    if (!asset) continue;
    const assetPath = resolve('public', asset);
    if (!existsSync(assetPath)) {
      throw new Error(`Missing ${style} asset for ${collectible.id}: ${assetPath}`);
    }
    if (style === 'sticker') {
      const size = statSync(assetPath).size;
      if (size > MAX_STICKER_BYTES) {
        throw new Error(
          `Sticker asset for ${collectible.id} is ${size} bytes; limit is ${MAX_STICKER_BYTES}.`,
        );
      }
      validateStickerDimensions(asset, assetPath, collectible.id);
    }
  }
}

const starters = catalog.collectibles.filter((collectible) => collectible.starterEligible);
if (starters.length !== 3)
  throw new Error(`Expected 3 starter collectibles, found ${starters.length}.`);

const nookNeighbors = catalog.collectibles.filter(
  ({ collectionId }) => collectionId === 'cozy-cats',
);
const expectedRarities = { common: 4, uncommon: 3, rare: 2, legendary: 1 } as const;
if (nookNeighbors.length !== 10) {
  throw new Error(`Expected 10 Nook Neighbors, found ${nookNeighbors.length}.`);
}
for (const [rarity, expected] of Object.entries(expectedRarities)) {
  const actual = nookNeighbors.filter((collectible) => collectible.rarity === rarity).length;
  if (actual !== expected) {
    throw new Error(`Expected ${expected} ${rarity} Nook Neighbors, found ${actual}.`);
  }
}

const companionIssues = validateCompanionContent(
  catalog.collectibles.map((collectible) => collectible.id),
);
if (companionIssues.length > 0) {
  throw new Error(`Invalid companion personality content:\n${companionIssues.join('\n')}`);
}

console.log(
  `Validated ${catalog.collectibles.length} collectibles, ${COMPANION_PERSONALITIES.length} personalities, and ${DIALOGUE_PHRASES.length} dialogue phrases across ${catalog.collections.length} collections in catalog ${catalog.version}.`,
);

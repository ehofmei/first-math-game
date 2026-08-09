import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { catalog } from '../src/content/catalog.ts';

const ids = new Set<string>();
for (const collectible of catalog.collectibles) {
  if (ids.has(collectible.id)) throw new Error(`Duplicate collectible ID: ${collectible.id}`);
  ids.add(collectible.id);
  const assetPath = resolve('public', collectible.image);
  if (!existsSync(assetPath)) throw new Error(`Missing collectible asset: ${assetPath}`);
}

const starters = catalog.collectibles.filter((collectible) => collectible.starterEligible);
if (starters.length !== 3)
  throw new Error(`Expected 3 starter collectibles, found ${starters.length}.`);

console.log(`Validated ${catalog.collectibles.length} collectibles in catalog ${catalog.version}.`);

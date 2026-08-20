import { describe, expect, it } from 'vitest';
import {
  catalog,
  getCollectible,
  getCollectibleImage,
  getCollection,
  getStarterCollectibles,
} from './catalog';
import { catalogSchema, collectibleArtSchema, collectibleSchema } from './schema';
import { contrastRatio, themeContrastIssues } from './theme';

describe('collectible catalog', () => {
  it('is valid, unique, collection-backed, and has exactly three starters', () => {
    expect(catalogSchema.parse(catalog)).toEqual(catalog);
    expect(new Set(catalog.collections.map(({ id }) => id)).size).toBe(catalog.collections.length);
    expect(new Set(catalog.collectibles.map(({ id }) => id)).size).toBe(
      catalog.collectibles.length,
    );
    expect(
      catalog.collectibles.every((collectible) => getCollection(collectible.collectionId)),
    ).toBe(true);
    expect(getStarterCollectibles()).toHaveLength(3);
  });

  it('looks up known and unknown collectibles', () => {
    expect(getCollectible('cozy-cats:sunny')?.name).toBe('Sunny');
    expect(getCollectible('missing:item')).toBeUndefined();
    expect(getCollection('cozy-cats')?.name).toBe('The Nook Neighbors');
    expect(getCollection('missing')).toBeUndefined();
  });

  it('contains the complete Nook Neighbors rarity distribution', () => {
    const neighbors = catalog.collectibles.filter(
      ({ collectionId }) => collectionId === 'cozy-cats',
    );
    const rarityCounts = neighbors.reduce<Record<string, number>>((counts, collectible) => {
      counts[collectible.rarity] = (counts[collectible.rarity] ?? 0) + 1;
      return counts;
    }, {});

    expect(neighbors).toHaveLength(10);
    expect(rarityCounts).toEqual({ common: 4, uncommon: 3, rare: 2, legendary: 1 });
    expect(neighbors.every(({ art }) => Boolean(art.classic && art.sticker))).toBe(true);
  });

  it('separates species from Special Guest status and rarity', () => {
    const cat = catalog.collectibles[0]!;
    const guest = catalog.collectibles.find(({ specialGuest }) => specialGuest)!;
    expect(
      collectibleSchema.safeParse({
        ...cat,
        id: 'neighborhood-dogs:poppy',
        collectionId: 'neighborhood-dogs',
        species: 'dog',
      }).success,
    ).toBe(true);
    expect(collectibleSchema.safeParse({ ...cat, rarity: 'special' }).success).toBe(false);
    expect(collectibleSchema.safeParse({ ...guest, rarity: 'rare' }).success).toBe(false);
    expect(
      collectibleSchema.safeParse({
        ...guest,
        id: 'cozy-cats:visiting-cat',
        collectionId: 'cozy-cats',
        species: 'cat',
      }).success,
    ).toBe(true);
  });

  it('requires namespaced collection membership and at least one art style', () => {
    const sunny = catalog.collectibles[0]!;
    expect(collectibleSchema.safeParse({ ...sunny, collectionId: 'special-guests' }).success).toBe(
      false,
    );
    expect(collectibleArtSchema.safeParse({}).success).toBe(false);
    expect(collectibleArtSchema.safeParse({ sticker: 'collectibles/sunny.webp' }).success).toBe(
      true,
    );
  });

  it('rejects duplicate IDs and unknown collection references at the catalog boundary', () => {
    expect(
      catalogSchema.safeParse({
        ...catalog,
        collections: [...catalog.collections, catalog.collections[0]],
      }).success,
    ).toBe(false);
    expect(
      catalogSchema.safeParse({
        ...catalog,
        collectibles: [...catalog.collectibles, catalog.collectibles[0]],
      }).success,
    ).toBe(false);
    expect(
      catalogSchema.safeParse({
        ...catalog,
        collectibles: [
          {
            ...catalog.collectibles[0]!,
            id: 'missing-collection:sunny',
            collectionId: 'missing-collection',
          },
          ...catalog.collectibles.slice(1),
        ],
      }).success,
    ).toBe(false);
  });

  it('uses the preferred art style with a deterministic fallback', () => {
    const sunny = catalog.collectibles[0]!;
    expect(getCollectibleImage(sunny, 'classic')).toBe('collectibles/sunny.svg');
    expect(getCollectibleImage(sunny, 'sticker')).toBe('collectibles/sunny-sticker.webp');
    expect(
      getCollectibleImage({ ...sunny, art: { sticker: 'collectibles/sunny.webp' } }, 'classic'),
    ).toBe('collectibles/sunny.webp');
    const buttonBunny = getCollectible('special-guests:button-bunny')!;
    expect(getCollectibleImage(buttonBunny, 'sticker')).toBe(
      'collectibles/button-bunny-sticker.webp',
    );
    expect(
      getCollectibleImage(
        { ...buttonBunny, art: { classic: 'collectibles/button-bunny.svg' } },
        'sticker',
      ),
    ).toBe('collectibles/button-bunny.svg');
  });

  it('validates readable companion palettes', () => {
    for (const collectible of catalog.collectibles) {
      expect(themeContrastIssues(collectible.theme), collectible.name).toEqual([]);
    }
    expect(contrastRatio('#30284A', '#FFF8EE')).toBeGreaterThan(4.5);
    expect(
      collectibleSchema.safeParse({
        ...catalog.collectibles[0]!,
        theme: { ...catalog.collectibles[0]!.theme, accent: '#FFF8EE' },
      }).success,
    ).toBe(false);
  });
});

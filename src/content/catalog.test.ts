import { describe, expect, it } from 'vitest';
import { catalog, getCollectible, getStarterCollectibles } from './catalog';
import { catalogSchema, collectibleSchema } from './schema';

describe('collectible catalog', () => {
  it('is valid, unique, and has exactly three starters', () => {
    expect(catalogSchema.parse(catalog)).toEqual(catalog);
    expect(new Set(catalog.collectibles.map(({ id }) => id)).size).toBe(
      catalog.collectibles.length,
    );
    expect(getStarterCollectibles()).toHaveLength(3);
  });

  it('looks up known and unknown collectibles', () => {
    expect(getCollectible('cozy-cats:sunny')?.name).toBe('Sunny');
    expect(getCollectible('missing:item')).toBeUndefined();
  });

  it('reserves Special rarity for Guests', () => {
    const cat = catalog.collectibles[0]!;
    const guest = catalog.collectibles.find(({ kind }) => kind === 'guest')!;
    expect(collectibleSchema.safeParse({ ...cat, rarity: 'special' }).success).toBe(false);
    expect(collectibleSchema.safeParse({ ...guest, rarity: 'rare' }).success).toBe(false);
  });
});

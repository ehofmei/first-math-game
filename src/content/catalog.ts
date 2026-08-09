import { catalogSchema, type CatalogData, type CollectibleDefinition } from './schema.ts';

const rawCatalog = {
  version: '1.0.0',
  collectibles: [
    {
      id: 'cozy-cats:sunny',
      name: 'Sunny',
      kind: 'cat',
      rarity: 'common',
      description: 'A warm-hearted cat who always spots the bright side.',
      image: 'collectibles/sunny.svg',
      altText: 'A cheerful golden cat with a sun-shaped charm.',
      capsuleEligible: true,
      capsuleWeight: 60,
      shopEligible: true,
      shopPrice: 120,
      starterEligible: true,
      sortOrder: 10,
    },
    {
      id: 'cozy-cats:moonbeam',
      name: 'Moonbeam',
      kind: 'cat',
      rarity: 'uncommon',
      description: 'A dreamy night owl who loves quiet puzzles.',
      image: 'collectibles/moonbeam.svg',
      altText: 'A lavender cat with a crescent moon charm.',
      capsuleEligible: true,
      capsuleWeight: 25,
      shopEligible: true,
      shopPrice: 240,
      starterEligible: true,
      sortOrder: 20,
    },
    {
      id: 'cozy-cats:pepper',
      name: 'Pepper',
      kind: 'cat',
      rarity: 'rare',
      description: 'A bold little explorer who never gives up.',
      image: 'collectibles/pepper.svg',
      altText: 'A charcoal cat with a coral scarf.',
      capsuleEligible: true,
      capsuleWeight: 10,
      shopEligible: true,
      shopPrice: 480,
      starterEligible: true,
      sortOrder: 30,
    },
    {
      id: 'cozy-cats:cloud',
      name: 'Cloud',
      kind: 'cat',
      rarity: 'common',
      description: 'A soft, bouncy cat who makes hard days lighter.',
      image: 'collectibles/cloud.svg',
      altText: 'A fluffy white cat with sky-blue markings.',
      capsuleEligible: true,
      capsuleWeight: 60,
      shopEligible: true,
      shopPrice: 120,
      starterEligible: false,
      sortOrder: 40,
    },
    {
      id: 'cozy-cats:comet',
      name: 'Comet',
      kind: 'cat',
      rarity: 'legendary',
      description: 'A cosmic cat who races answers across the stars.',
      image: 'collectibles/comet.svg',
      altText: 'A deep blue cat with a glowing comet tail.',
      capsuleEligible: true,
      capsuleWeight: 4,
      shopEligible: true,
      shopPrice: 840,
      starterEligible: false,
      sortOrder: 50,
    },
    {
      id: 'special-guests:button-bunny',
      name: 'Button Bunny',
      kind: 'guest',
      rarity: 'special',
      description: 'A well-loved plush guest with a talent for lucky answers.',
      image: 'collectibles/button-bunny.svg',
      altText: 'A cozy teal plush bunny with a yellow button.',
      capsuleEligible: true,
      capsuleWeight: 1,
      shopEligible: true,
      shopPrice: 1_200,
      starterEligible: false,
      sortOrder: 60,
    },
  ],
} satisfies CatalogData;

export const catalog = catalogSchema.parse(rawCatalog);

export function getCollectible(id: string): CollectibleDefinition | undefined {
  return catalog.collectibles.find((collectible) => collectible.id === id);
}

export function getStarterCollectibles(): CollectibleDefinition[] {
  return catalog.collectibles.filter((collectible) => collectible.starterEligible);
}

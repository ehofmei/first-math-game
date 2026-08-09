import { z } from 'zod';

export const raritySchema = z.enum(['common', 'uncommon', 'rare', 'legendary', 'special']);
export type Rarity = z.infer<typeof raritySchema>;

export const collectibleSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/),
    name: z.string().min(1).max(40),
    kind: z.enum(['cat', 'guest']),
    rarity: raritySchema,
    description: z.string().min(1).max(160),
    image: z.string().startsWith('collectibles/'),
    altText: z.string().min(1).max(160),
    capsuleEligible: z.boolean(),
    capsuleWeight: z.number().positive(),
    shopEligible: z.boolean(),
    shopPrice: z.number().int().nonnegative(),
    starterEligible: z.boolean(),
    sortOrder: z.number().int(),
  })
  .superRefine((collectible, context) => {
    if (collectible.kind === 'guest' && collectible.rarity !== 'special') {
      context.addIssue({
        code: 'custom',
        path: ['rarity'],
        message: 'Guests must use the Special rarity.',
      });
    }
    if (collectible.kind === 'cat' && collectible.rarity === 'special') {
      context.addIssue({
        code: 'custom',
        path: ['rarity'],
        message: 'Special is reserved for Guests.',
      });
    }
  });

export type CollectibleDefinition = z.infer<typeof collectibleSchema>;

export const catalogSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  collectibles: z.array(collectibleSchema).min(1),
});

export type CatalogData = z.infer<typeof catalogSchema>;

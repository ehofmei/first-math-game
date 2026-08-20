import { z } from 'zod';
import { themeContrastIssues } from './theme.ts';

export const raritySchema = z.enum(['common', 'uncommon', 'rare', 'legendary', 'special']);
export type Rarity = z.infer<typeof raritySchema>;

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const assetPathSchema = z.string().regex(/^collectibles\/[a-z0-9-]+\.(?:svg|png|webp|avif)$/);
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const artStyleSchema = z.enum(['classic', 'sticker']);
export type ArtStyle = z.infer<typeof artStyleSchema>;

export const companionThemeSchema = z
  .object({
    accent: hexColorSchema,
    accentStrong: hexColorSchema,
    accentSoft: hexColorSchema,
    pageTint: hexColorSchema,
    glowPrimary: hexColorSchema,
    glowSecondary: hexColorSchema,
  })
  .superRefine((theme, context) => {
    for (const message of themeContrastIssues(theme)) {
      context.addIssue({ code: 'custom', message });
    }
  });

export type CompanionTheme = z.infer<typeof companionThemeSchema>;

export const collectibleArtSchema = z
  .object({
    classic: assetPathSchema.optional(),
    sticker: assetPathSchema.optional(),
  })
  .refine(({ classic, sticker }) => Boolean(classic || sticker), {
    message: 'At least one collectible art style is required.',
  });

export const collectionSchema = z.object({
  id: slugSchema,
  name: z.string().min(1).max(60),
  description: z.string().min(1).max(240),
  sortOrder: z.number().int(),
});

export type CollectionDefinition = z.infer<typeof collectionSchema>;

export const collectibleSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/),
    collectionId: slugSchema,
    name: z.string().min(1).max(40),
    species: slugSchema,
    specialGuest: z.boolean(),
    rarity: raritySchema,
    description: z.string().min(1).max(160),
    art: collectibleArtSchema,
    theme: companionThemeSchema,
    altText: z.string().min(1).max(160),
    capsuleEligible: z.boolean(),
    capsuleWeight: z.number().positive(),
    shopEligible: z.boolean(),
    shopPrice: z.number().int().nonnegative(),
    starterEligible: z.boolean(),
    sortOrder: z.number().int(),
  })
  .superRefine((collectible, context) => {
    if (collectible.id.split(':')[0] !== collectible.collectionId) {
      context.addIssue({
        code: 'custom',
        path: ['collectionId'],
        message: 'Collectible ID namespace must match its collection ID.',
      });
    }
    if (collectible.specialGuest && collectible.rarity !== 'special') {
      context.addIssue({
        code: 'custom',
        path: ['rarity'],
        message: 'Special Guests must use the Special rarity.',
      });
    }
    if (!collectible.specialGuest && collectible.rarity === 'special') {
      context.addIssue({
        code: 'custom',
        path: ['rarity'],
        message: 'Special rarity is reserved for Special Guests.',
      });
    }
  });

export type CollectibleDefinition = z.infer<typeof collectibleSchema>;

export const catalogSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    collections: z.array(collectionSchema).min(1),
    collectibles: z.array(collectibleSchema).min(1),
  })
  .superRefine((catalog, context) => {
    const collectionIds = new Set<string>();
    for (const [index, collection] of catalog.collections.entries()) {
      if (collectionIds.has(collection.id)) {
        context.addIssue({
          code: 'custom',
          path: ['collections', index, 'id'],
          message: `Duplicate collection ID: ${collection.id}`,
        });
      }
      collectionIds.add(collection.id);
    }

    const collectibleIds = new Set<string>();
    for (const [index, collectible] of catalog.collectibles.entries()) {
      if (collectibleIds.has(collectible.id)) {
        context.addIssue({
          code: 'custom',
          path: ['collectibles', index, 'id'],
          message: `Duplicate collectible ID: ${collectible.id}`,
        });
      }
      collectibleIds.add(collectible.id);

      if (!collectionIds.has(collectible.collectionId)) {
        context.addIssue({
          code: 'custom',
          path: ['collectibles', index, 'collectionId'],
          message: `Unknown collection: ${collectible.collectionId}`,
        });
      }
    }
  });

export type CatalogData = z.infer<typeof catalogSchema>;

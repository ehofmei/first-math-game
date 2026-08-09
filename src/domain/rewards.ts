import type { CollectibleDefinition } from '../content/schema';
import type { RandomSource } from './random';

export const CAPSULE_COST = 60;
export const DAILY_COIN_CAP = 30;

export function chooseCapsuleReward(
  catalog: readonly CollectibleDefinition[],
  ownedIds: readonly string[],
  random: RandomSource,
): CollectibleDefinition | null {
  const owned = new Set(ownedIds);
  const eligible = catalog.filter(
    (collectible) => collectible.capsuleEligible && !owned.has(collectible.id),
  );
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, collectible) => sum + collectible.capsuleWeight, 0);
  let selection = random.next() * totalWeight;

  for (const collectible of eligible) {
    selection -= collectible.capsuleWeight;
    if (selection < 0) return collectible;
  }

  return eligible.at(-1) ?? null;
}

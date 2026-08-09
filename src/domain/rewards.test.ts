import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catalog } from '../content/catalog';
import { SeededRandom } from './random';
import { chooseCapsuleReward } from './rewards';

describe('capsule rewards', () => {
  it('never returns an owned collectible while another remains', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.subarray(catalog.collectibles.map(({ id }) => id)),
        (seed, owned) => {
          const reward = chooseCapsuleReward(catalog.collectibles, owned, new SeededRandom(seed));
          const unowned = catalog.collectibles.filter(
            (item) => item.capsuleEligible && !owned.includes(item.id),
          );
          if (unowned.length === 0) {
            expect(reward).toBeNull();
          } else {
            expect(reward).not.toBeNull();
            expect(owned).not.toContain(reward?.id);
            expect(unowned.map(({ id }) => id)).toContain(reward?.id);
          }
        },
      ),
      { numRuns: 1_000 },
    );
  });

  it('guarantees the only remaining Special Guest', () => {
    const guest = catalog.collectibles.find(({ kind }) => kind === 'guest');
    expect(guest).toBeDefined();
    const owned = catalog.collectibles.filter(({ id }) => id !== guest?.id).map(({ id }) => id);
    expect(chooseCapsuleReward(catalog.collectibles, owned, new SeededRandom(1))).toEqual(guest);
  });
});

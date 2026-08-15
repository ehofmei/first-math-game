# Economy Tuning

The economy is deliberately small, transparent, local-only, and easy to rebalance after family play-testing. Paw Coins can never be bought with real money.

## Current values

| Rule | Value |
| --- | ---: |
| Correct answer | 1 coin |
| At least 80% accuracy | 2 bonus coins |
| Perfect round | 3 additional bonus coins |
| Completely incorrect round | 0 coins |
| Maximum session earnings for 10 correct answers | 15 coins |
| Daily earning cap | 30 coins |
| Duplicate-protected capsule | 60 coins |

A player therefore needs four perfect ten-question rounds to afford one capsule, spread across at least two local calendar days. The cap limits newly earned coins; it never removes an existing balance. Opening a capsule and any future purchases do not reduce the day's earning allowance.

When the daily cap is reached, practice, scores, accuracy, and saved progress continue normally. The results screen awards only the remaining allowance and uses neutral language when today's Paw Coin pouch is full.

## Rationale

- Accuracy must matter: rapidly submitting wrong answers earns no currency.
- Struggling players still earn one coin for every correct answer and never lose coins for mistakes.
- The small accuracy bonuses recognize careful rounds without making one perfect round worth a capsule.
- A daily maximum keeps repeated short sessions from immediately exhausting the collection.
- Duplicate protection means every capsule still has substantial value.

These are initial play-test values, not permanent balance claims. The relevant constants are `CAPSULE_COST` and `DAILY_COIN_CAP` in `src/domain/rewards.ts`; the session formula is in `src/domain/session.ts`.

## Save behavior

Save schema version 2 added the local date and number of coins earned on that date. Version 3 added reproducible question snapshots and capsule transaction history for balance analysis. Version 4 keeps the newest 30 rounds in detail and rolls older rounds into compact lifetime statistics. Version-1, version-2, and version-3 saves migrate automatically and keep their prior balance, settings, collection, and meaningful progress. Previously accumulated coins are intentionally not reduced retroactively.

Future direct-purchase prices should remain substantially higher than the capsule price because direct purchase removes randomness. Revisit the daily cap, capsule cost, and catalog size together rather than tuning one in isolation.

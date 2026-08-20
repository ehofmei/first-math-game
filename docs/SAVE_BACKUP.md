# Save Backup and Restore

Number Nook can move complete local progress between devices without an account or backend. **Backup & restore** is available from the home page and **Restore a backup** is available before onboarding on a new device.

## Complete backup contents

A save backup includes:

- Player name and remembered game settings.
- Paw Coin balance and current daily earning allowance.
- Owned and equipped companions.
- Remembered Classic or Polished Sticker art preference.
- Capsule economy events.
- Retained detailed rounds and archived lifetime progress.
- Save schema version for validation and migration.

Sound-effects enabled/disabled and volume are device-output preferences, so they remain on the current device and are not included in a progress backup. A restored player inherits the destination device's existing audio preference.

Because the backup contains the local player name and complete progress, it should be treated as a private file. The app does not upload it automatically.

On platforms that support sharing files, **Save backup file** opens the system share sheet. Other browsers download a file named `number-nook-save-YYYY-MM-DD.json`.

## Safe restore flow

Selecting a file never changes progress immediately. The app first:

1. Rejects files larger than 5 MiB.
2. Parses and validates the complete JSON structure.
3. Migrates supported older schemas to the current schema.
4. Shows the file name, player, lifetime round count, Paw Coins, and companion count.
5. Requires **Restore this backup** before replacing the device's current save.

Invalid files show an error and leave the current save untouched. After a successful restore, all transient game, results, review, and capsule state is cleared so it cannot leak into the restored save.

The success message appears only after browser storage accepts the complete restored save. A storage failure leaves the current in-memory progress unchanged and reports that the restore could not be completed.

Current schema version 5 and legacy schema versions 1–4 are supported. Version 5 adds the master art-style preference; older saves migrate to the Polished Sticker default without changing collection progress. The normal repository migration path is used for both startup and manual restore, so those behaviors cannot drift apart.

## Different export types

Number Nook has two deliberately separate JSON formats:

- `number-nook-save-…json` is a complete, private backup that can be restored.
- `number-nook-history-…json` is a name-free analysis export for balance review and cannot be restored.

This separation keeps analysis sharing privacy-conscious and prevents a partial analysis record from being mistaken for complete progress.

## Verification contract

Automated tests cover:

- Current-save export and import round trips.
- Schema version 1–4 migration.
- Download naming.
- Invalid-file rejection without changing the current save.
- Preview-before-replacement behavior.
- Confirmed replacement and persistence after reload.
- Restore from the pre-onboarding screen on a new device.
- Accessibility and phone layout.

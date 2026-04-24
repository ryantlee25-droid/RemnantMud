-- Drop saw_prologue: app uses localStorage exclusively (remnant_saw_prologue key)
-- Column was added in 20260326000005 but never wired into loadPlayer/savePlayer
ALTER TABLE players DROP COLUMN IF EXISTS saw_prologue;

-- Drop dead ledger columns: never read or written by application code
-- Echo/rebirth system uses cycle_history snapshots instead
ALTER TABLE player_ledger DROP COLUMN IF EXISTS faction_reputation_best;
ALTER TABLE player_ledger DROP COLUMN IF EXISTS quest_flags_completed;

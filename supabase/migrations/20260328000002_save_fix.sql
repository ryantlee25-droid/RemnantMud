-- Fix save failures: add missing columns referenced by gameEngine._savePlayer()
-- These were added to the engine code but no migration was created.

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS active_buffs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pending_stat_increase BOOLEAN NOT NULL DEFAULT FALSE;

-- Fix ledger failures: add missing discovered_enemies column
-- Referenced by _handlePlayerDeath(), createCharacter(), and rebirth code.

ALTER TABLE player_ledger
  ADD COLUMN IF NOT EXISTS discovered_enemies JSONB DEFAULT '[]'::jsonb;

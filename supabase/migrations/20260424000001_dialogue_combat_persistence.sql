-- Persist active dialogue and combat state across page refreshes.
-- Both columns store JSONB so the existing TypeScript types round-trip
-- without any additional serialization layer.
-- Cleared on death and rebirth (see _handlePlayerDeath / rebirthCharacter).

ALTER TABLE players ADD COLUMN IF NOT EXISTS active_dialogue jsonb;
ALTER TABLE players ADD COLUMN IF NOT EXISTS combat_state jsonb;

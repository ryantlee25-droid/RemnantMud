-- Migration: Cycle system — death, rebirth, and cross-cycle persistence
-- players: track current cycle state
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS cycle INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_deaths INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_dead BOOLEAN NOT NULL DEFAULT FALSE;

-- player_ledger: meta-progression that persists across all cycles
-- One row per auth user (not per character). Created on first character creation.
CREATE TABLE IF NOT EXISTS player_ledger (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id             UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  world_seed            INTEGER NOT NULL,
  current_cycle         INTEGER NOT NULL DEFAULT 1,
  total_deaths          INTEGER NOT NULL DEFAULT 0,
  pressure_level        INTEGER NOT NULL DEFAULT 1 CHECK (pressure_level BETWEEN 1 AND 5),
  discovered_room_ids   JSONB NOT NULL DEFAULT '[]',
  squirrel_alive        BOOLEAN NOT NULL DEFAULT FALSE,
  squirrel_trust        INTEGER NOT NULL DEFAULT 0,
  squirrel_cycles_known INTEGER NOT NULL DEFAULT 0,
  squirrel_name         TEXT CHECK (squirrel_name IN ('Chippy', 'Stumpy')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE player_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "player_ledger: own row only"
  ON player_ledger FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Auto-update updated_at
CREATE TRIGGER player_ledger_updated_at
  BEFORE UPDATE ON player_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

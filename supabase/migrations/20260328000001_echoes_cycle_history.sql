ALTER TABLE player_ledger
  ADD COLUMN IF NOT EXISTS cycle_history JSONB DEFAULT '[]'::jsonb;

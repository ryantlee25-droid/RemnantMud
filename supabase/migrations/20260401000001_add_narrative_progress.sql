-- Fix: narrative_progress column missing from players table
-- Root cause: Added to gameEngine.ts _savePlayer() during remnant-narrative-0329
-- convoy but migration was never created (same class as active_buffs fix in
-- 20260328000002_save_fix.sql)

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS narrative_progress JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN players.narrative_progress IS 'Tracks hollow pressure and narrative keys for story progression';

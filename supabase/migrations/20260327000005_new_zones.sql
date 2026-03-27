-- Migration: New world zones — faction reputation and quest flags
-- players: track per-faction reputation and quest progression

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS faction_reputation JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quest_flags        JSONB NOT NULL DEFAULT '{}';

-- player_ledger: persist reputation and quest state across cycles
ALTER TABLE player_ledger
  ADD COLUMN IF NOT EXISTS faction_reputation_best JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quest_flags_completed    JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN players.faction_reputation IS
  'Per-faction reputation scores: { accord: 0, salters: 0, drifters: 0, ... } (-3 to +3)';

COMMENT ON COLUMN players.quest_flags IS
  'Active and completed quest state: { quest_id: "pending"|"active"|"complete"|"failed" }';
